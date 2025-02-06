import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("receipts")
    .select("*, receipt_items(*)")
    .eq("user_id", user.id); // Join with receipt_items

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
