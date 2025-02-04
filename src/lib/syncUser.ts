import { supabase } from "@/lib/supabase"; // Adjust this import to your Supabase client setup
import type { User as ClerkUser } from "@clerk/nextjs/server"; // Clerk user type

export async function syncUserToSupabase(user: ClerkUser) {
  // Check if the user already exists in Supabase
  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("Error selecting user:", selectError);
    return;
  }
  // If user doesn't exist, insert the record
  if (!existingUser) {
    const { error: insertError } = await supabase.from("users").insert({
      clerk_id: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
    });

    if (insertError) {
      console.error("Error inserting user into Supabase:", insertError);
    } else {
      console.log("User synced to Supabase:", user.id);
    }
  }
}
