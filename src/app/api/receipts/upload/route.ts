import { extractReceiptData } from "@/lib/azureReceiptParser";
import { supabase } from "@/lib/supabase";
import { syncUserToSupabase } from "@/lib/syncUser";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await syncUserToSupabase(user);

  // Get Image File
  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Convert File to Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Process Image (Resize + Compress)
  const processedImageBuffer = await sharp(buffer)
    .resize({ width: 2000, withoutEnlargement: true }) // Resize if larger than 2000px
    .jpeg({ quality: 70 }) // Convert to JPEG and compress
    .toBuffer();

  // Extract Receipt Data
  const receiptData = await extractReceiptData(processedImageBuffer);

  // Insert into Supabase
  const { data, error } = await supabase
    .from("receipts")
    .insert([
      {
        user_id: user.id,
        store: receiptData?.store,
        date: receiptData?.date,
        total: receiptData?.total,
      },
    ])
    .select("id")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const receiptId = data?.id;

  for (const item of receiptData?.items) {
    await supabase
      .from("receipt_items")
      .insert({ receipt_id: receiptId, name: item.name, price: item.price });
  }

  return Response.json(receiptData);
}
