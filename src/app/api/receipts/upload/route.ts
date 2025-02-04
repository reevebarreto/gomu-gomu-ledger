import { supabase } from "@/lib/supabase";
import visionHelper from "@/lib/visionHelper";
import parseReceiptText from "@/lib/parseReceiptText";

import { currentUser } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";
import { syncUserToSupabase } from "@/lib/syncUser";

export async function POST(req: Request) {
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await syncUserToSupabase(user);

  const body = await req.formData();
  const imageFile = body.get("image");

  if (!imageFile) {
    return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
  }

  if (!(imageFile instanceof File)) {
    return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
  }

  const imageBuffer = await imageFile.arrayBuffer();
  const extractedText = await visionHelper(Buffer.from(imageBuffer));
  const parsedData = parseReceiptText(extractedText);

  let receiptDate: string;
  if (parsedData.date) {
    // Check if the date is already in ISO format: YYYY-MM-DD
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (isoRegex.test(parsedData.date)) {
      receiptDate = parsedData.date;
    } else {
      // Attempt to parse it and convert it
      const dateObj = new Date(parsedData.date);
      if (isNaN(dateObj.getTime())) {
        // Fallback: if the parsed date is invalid, use today's date
        receiptDate = new Date().toISOString().split("T")[0];
      } else {
        receiptDate = dateObj.toISOString().split("T")[0];
      }
    }
  } else {
    // If no date was found, fallback to today's date
    receiptDate = new Date().toISOString().split("T")[0];
  }

  // Insert into Supabase
  const { data, error } = await supabase
    .from("receipts")
    .insert([
      {
        user_id: user.id,
        store: parsedData.store,
        date: receiptDate,
        total: parsedData.total,
      },
    ])
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const receiptId = data.id;

  for (const item of parsedData.items) {
    await supabase
      .from("receipt_items")
      .insert({ receipt_id: receiptId, name: item.name, price: item.price });
  }

  return NextResponse.json({ message: "Receipt uploaded", receipt: data });
}
