require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

// ─── Validation ───────────────────────────────────────────────────────────────
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY is not set. Copy server/.env.example to server/.env and fill in your keys.')
  process.exit(1)
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const app = express()
const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// ─── Simple JSON file "database" ─────────────────────────────────────────────
// Stores { [userId]: { stripeCustomerId, tier, status } }
// Replace with a real DB (Postgres/MongoDB) for production.
const DB_PATH = path.join(__dirname, 'subscriptions.json')

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) }
  catch { return {} }
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// ─── Stripe price ID map ──────────────────────────────────────────────────────
const PRICE_IDS = {
  basic:   process.env.STRIPE_PRICE_BASIC,
  premium: process.env.STRIPE_PRICE_PREMIUM,
  extreme: process.env.STRIPE_PRICE_EXTREME,
}

// ─── Middleware ───────────────────────────────────────────────────────────────
// Webhook route needs raw body — must be registered BEFORE express.json()
app.use('/api/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ ok: true }))

// ─── Create Stripe Checkout Session ──────────────────────────────────────────
// Called by frontend when user clicks "Subscribe"
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { tier, userId, userEmail } = req.body
    if (!tier || !userId || !userEmail) return res.status(400).json({ error: 'Missing tier, userId, or userEmail' })

    const priceId = PRICE_IDS[tier]
    if (!priceId) return res.status(400).json({ error: `No price configured for tier "${tier}". Set STRIPE_PRICE_${tier.toUpperCase()} in server/.env` })

    const db = readDB()

    // Reuse existing Stripe customer if we already created one for this user
    let customerId = db[userId]?.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      })
      customerId = customer.id
      db[userId] = { ...(db[userId] || {}), stripeCustomerId: customerId }
      writeDB(db)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${CLIENT_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}&tier=${tier}`,
      cancel_url: `${CLIENT_URL}/subscribe?canceled=true`,
      subscription_data: {
        metadata: { userId, tier },
      },
      metadata: { userId, tier },
      allow_promotion_codes: true,
    })

    console.log(`[create-checkout-session] sessionId=${session.id} userId=${userId} email=${userEmail} tier=${tier} customerId=${customerId}`)
    res.json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Verify Checkout Session (called on success redirect) ────────────────────
app.get('/api/verify-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ['subscription'],
    })
    const paid = session.payment_status === 'paid'
    const tier = session.metadata?.tier || null
    const userId = session.metadata?.userId || null
    const renewalDate = session.subscription?.current_period_end
      ? new Date(session.subscription.current_period_end * 1000).toISOString()
      : null

    console.log(`[verify-session] sessionId=${req.params.sessionId} paid=${paid} userId=${userId} tier=${tier} customerId=${session.customer}`)

    if (paid && userId) {
      const db = readDB()
      db[userId] = { ...(db[userId] || {}), tier, status: 'active', renewalDate }
      writeDB(db)
      console.log(`[verify-session] Subscription assigned to userId=${userId} tier=${tier}`)
    } else if (paid && !userId) {
      console.error(`[verify-session] Payment confirmed but no userId in session metadata — cannot assign subscription. sessionId=${req.params.sessionId}`)
    }

    res.json({ paid, tier, userId, renewalDate })
  } catch (err) {
    console.error('verify-session error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Get Subscription Status ──────────────────────────────────────────────────
app.get('/api/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    console.log(`[subscription-check] Fetching subscription for userId=${userId}`)
    const db = readDB()
    const record = db[userId]

    if (!record?.stripeCustomerId) {
      console.log(`[subscription-check] No Stripe customer found for userId=${userId} — returning tier=null`)
      return res.json({ tier: null, status: 'none', renewalDate: null })
    }

    const subs = await stripe.subscriptions.list({
      customer: record.stripeCustomerId,
      status: 'active',
      limit: 1,
      expand: ['data.items.data.price'],
    })

    if (!subs.data.length) {
      // Also check canceled subs still in period
      const all = await stripe.subscriptions.list({ customer: record.stripeCustomerId, limit: 1 })
      if (!all.data.length) return res.json({ tier: null, status: 'none', renewalDate: null })
      const sub = all.data[0]
      return res.json({
        tier: sub.metadata.tier || null,
        status: sub.status,
        renewalDate: new Date(sub.current_period_end * 1000).toISOString(),
        subscriptionId: sub.id,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      })
    }

    const sub = subs.data[0]
    console.log(`[subscription-check] Found active subscription for userId=${userId} tier=${sub.metadata.tier} status=${sub.status}`)
    res.json({
      tier: sub.metadata.tier || null,
      status: sub.status,
      renewalDate: new Date(sub.current_period_end * 1000).toISOString(),
      subscriptionId: sub.id,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    })
  } catch (err) {
    console.error('[subscription-check] Error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Create Stripe Customer Portal Session ────────────────────────────────────
// Lets users manage billing themselves (update card, download invoices, etc.)
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { userId } = req.body
    const db = readDB()
    const customerId = db[userId]?.stripeCustomerId
    if (!customerId) return res.status(400).json({ error: 'No Stripe customer found for this user.' })

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${CLIENT_URL}/profile`,
    })
    res.json({ url: session.url })
  } catch (err) {
    console.error('portal session error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Cancel Subscription ──────────────────────────────────────────────────────
// Cancels at period end (user keeps access until billing date)
app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body
    const db = readDB()
    const customerId = db[userId]?.stripeCustomerId
    if (!customerId) return res.status(400).json({ error: 'No customer found.' })

    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 })
    if (!subs.data.length) return res.status(400).json({ error: 'No active subscription.' })

    const updated = await stripe.subscriptions.update(subs.data[0].id, {
      cancel_at_period_end: true,
    })
    res.json({
      success: true,
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      renewalDate: new Date(updated.current_period_end * 1000).toISOString(),
    })
  } catch (err) {
    console.error('cancel-subscription error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Reactivate Subscription ──────────────────────────────────────────────────
app.post('/api/reactivate-subscription', async (req, res) => {
  try {
    const { userId } = req.body
    const db = readDB()
    const customerId = db[userId]?.stripeCustomerId
    if (!customerId) return res.status(400).json({ error: 'No customer found.' })

    const subs = await stripe.subscriptions.list({ customer: customerId, limit: 1 })
    if (!subs.data.length) return res.status(400).json({ error: 'No subscription found.' })

    const updated = await stripe.subscriptions.update(subs.data[0].id, {
      cancel_at_period_end: false,
    })
    res.json({ success: true, cancelAtPeriodEnd: updated.cancel_at_period_end })
  } catch (err) {
    console.error('reactivate error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Payment History ──────────────────────────────────────────────────────────
app.get('/api/payment-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const db = readDB()
    const customerId = db[userId]?.stripeCustomerId
    if (!customerId) return res.json({ invoices: [] })

    const invoices = await stripe.invoices.list({ customer: customerId, limit: 12 })
    res.json({
      invoices: invoices.data.map(inv => ({
        id: inv.id,
        amount: (inv.amount_paid / 100).toFixed(2),
        currency: inv.currency.toUpperCase(),
        status: inv.status,
        date: new Date(inv.created * 1000).toISOString(),
        description: inv.lines?.data[0]?.description || 'Subscription',
        pdfUrl: inv.invoice_pdf,
      })),
    })
  } catch (err) {
    console.error('payment-history error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Stripe Webhook ───────────────────────────────────────────────────────────
// Stripe sends events here for reliable async processing.
// Set your webhook URL in Stripe Dashboard: https://dashboard.stripe.com/webhooks
// Endpoint URL: https://YOUR_DOMAIN/api/webhook
// Events to listen for: checkout.session.completed, customer.subscription.updated,
//                        customer.subscription.deleted, invoice.payment_failed
app.post('/api/webhook', (req, res) => {
  const sig = req.headers['stripe-signature']
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('STRIPE_WEBHOOK_SECRET not set — skipping webhook verification')
    return res.json({ received: true })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const db = readDB()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.userId
      const tier = session.metadata?.tier
      console.log(`[webhook] checkout.session.completed — sessionId=${session.id} userId=${userId} tier=${tier}`)
      if (userId) {
        db[userId] = { ...(db[userId] || {}), tier, status: 'active' }
        writeDB(db)
        console.log(`✓ Subscription activated: user=${userId} tier=${tier}`)
      } else {
        console.error(`[webhook] checkout.session.completed — missing userId in metadata. sessionId=${session.id}`)
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object
      const userId = sub.metadata?.userId
      if (userId) {
        db[userId] = { ...(db[userId] || {}), status: sub.status }
        writeDB(db)
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const userId = sub.metadata?.userId
      if (userId) {
        db[userId] = { ...(db[userId] || {}), tier: null, status: 'canceled' }
        writeDB(db)
        console.log(`✓ Subscription canceled: user=${userId}`)
      }
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object
      console.warn(`Payment failed for customer: ${invoice.customer}`)
      break
    }
    default:
      break
  }

  res.json({ received: true })
})

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nYoJaz Elite backend running on http://localhost:${PORT}`)
  console.log(`Stripe mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'}\n`)
})
