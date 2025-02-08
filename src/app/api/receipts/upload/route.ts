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
    .jpeg({
      quality: 75, // Balance between compression & quality (70-80 recommended)
      mozjpeg: true, // Uses better compression algorithm (smaller file, same quality)
      progressive: true, // Loads faster on web (good for UX)
    })
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

  for (const item of fixReceiptItems(receiptData?.items)) {
    await supabase.from("receipt_items").insert({
      receipt_id: receiptId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    });
  }

  return Response.json(receiptData);
}

function fixReceiptItems(
  items: { name: string; price: number; quantity: number }[]
) {
  // Count "Unknown Item" occurrences and €0.00 prices
  const unknownCount = items.filter(
    (item) => item.name === "Unknown Item"
  ).length;
  const zeroPriceCount = items.filter((item) => item.price === 0).length;

  // Only apply the fix when the counts match
  if (unknownCount !== zeroPriceCount) return items;

  const fixedItems: { name: string; price: number; quantity: number }[] = [];

  for (let i = 0; i < items.length; i++) {
    if (items[i].name === "Unknown Item" && items[i].price > 0) {
      // Push "Unknown Item" with no price
      fixedItems.push({
        name: "Unknown Item",
        price: 0,
        quantity: items[i].quantity,
      });

      // Shift the price to the next valid item
      if (i + 1 < items.length) {
        items[i + 1].price = items[i].price; // Move the price
      }
    } else if (items[i].price !== 0) {
      // Keep other valid items
      fixedItems.push(items[i]);
    }
  }

  return fixedItems;
}
