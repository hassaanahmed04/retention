import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient as createClient } from "@/lib/supabase/server"
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commissionId } = body;

    // 1. Get Admin Client (bypasses RLS for secure payout)
    // Note: Ensure getSupabaseAdminClient is exported from your lib/supabase/server.ts
    // or use standard createClient() if the logged-in user is an Admin.
    const supabase = await createClient(); 

    // 2. Fetch Commission & User Details
    const { data: commission } = await supabase
      .from("commissions")
      .select("*, users(stripe_account_id)")
      .eq("id", commissionId)
      .single();

    if (!commission) return NextResponse.json({ error: "Commission not found" }, { status: 404 });
    if (commission.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });

    const destinationAccount = commission.users?.stripe_account_id;

    if (!destinationAccount) {
      return NextResponse.json({ error: "Affiliate has not connected a bank account" }, { status: 400 });
    }

    // 3. Process Stripe Transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(commission.amount * 100), // Convert dollars to cents
      currency: "usd",
      destination: destinationAccount,
      description: `Commission Payout for Lead ${commission.lead_id}`,
    });

    // 4. Update Database Status
    const { error } = await supabase
      .from("commissions")
      .update({
        status: "paid",
        stripe_transfer_id: transfer.id,
        paid_at: new Date().toISOString(),
      })
      .eq("id", commissionId);

    if (error) throw error;

    return NextResponse.json({ success: true, transferId: transfer.id });
  } catch (error: any) {
    console.error("Payout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}