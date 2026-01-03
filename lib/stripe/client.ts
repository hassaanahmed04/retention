import Stripe from "stripe"

let stripeInstance: Stripe | null = null

export function getStripeClient(): Stripe {
  if (stripeInstance) return stripeInstance

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set")
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: "2023-10-16",
    typescript: true,
  })

  return stripeInstance
}

// Stripe Connect helpers for affiliate payouts
export async function createConnectAccount(email: string, country = "US") {
  const stripe = getStripeClient()

  return stripe.accounts.create({
    type: "express",
    country,
    email,
    capabilities: {
      transfers: { requested: true },
    },
  })
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const stripe = getStripeClient()

  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  })
}

export async function createPayout(accountId: string, amount: number, currency = "usd") {
  const stripe = getStripeClient()

  return stripe.transfers.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    destination: accountId,
  })
}

export async function getAccountBalance(accountId: string) {
  const stripe = getStripeClient()

  return stripe.balance.retrieve({
    stripeAccount: accountId,
  })
}

// Subscription management
export async function createSubscription(customerId: string, priceId: string) {
  const stripe = getStripeClient()

  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  })
}

export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripeClient()

  return stripe.subscriptions.cancel(subscriptionId)
}
