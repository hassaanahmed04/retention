import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient as createClient } from "@/lib/supabase/server"
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Ensure this matches a recent version
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check if user already has a stripe_account_id in DB
    const { data: dbUser } = await supabase
      .from("users")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single();

    let accountId = dbUser?.stripe_account_id;

    // 2. If not, create a new Stripe Express Account
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US", 
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
      });

      accountId = account.id;

      // Save the new Stripe ID to your database
      await supabase
        .from("users")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
    }

    // 3. Generate the Onboarding Link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/affiliates?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/affiliate?success=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Stripe Onboarding Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}