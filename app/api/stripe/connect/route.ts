import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  const { userId, email } = await req.json()

  // 1. Create a Stripe Express Account for them
  const account = await stripe.accounts.create({
    type: 'express',
    email: email,
    capabilities: { transfers: { requested: true } },
  })

  // 2. Save their Stripe ID to your DB immediately
  await supabase.from('users').update({ stripe_account_id: account.id }).eq('id', userId)

  // 3. Generate the Onboarding Link (Bank Info Form)
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/affiliate`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/affiliate?setup=success`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}