require('dotenv').config({ path: __dirname + '/.env' })
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('WARNING: STRIPE_SECRET_KEY missing — Stripe calls will fail')
}

const app = express()

const PORT = process.env.PORT || 10000

const CLIENT_URL =
  process.env.CLIENT_URL ||
  'https://yojaz-elite.vercel.app'

// ─── Simple JSON file database ────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'subscriptions.json')

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// ─── Stripe price IDs ─────────────────────────────────────────────────────────
const PRICE_IDS = {
  basic:   process.env.STRIPE_PRICE_BASIC    || 'price_1TaOuF3jbU404iXhrQGTW9wl',
  premium: process.env.STRIPE_PRICE_PREMIUM  || 'price_1TaOuk3jbU404iXhHNvTUbGw',
  extreme: process.env.STRIPE_PRICE_EXTREME  || 'price_1TaOv03jbU404iXhLZzHOk96',
}

// ─── Middleware ───────────────────────────────────────────────────────────────
// cors must be first so preflight OPTIONS requests get headers before anything else
app.use(cors({
  origin: [
    'https://yojaz-elite.vercel.app',
    /\.vercel\.app$/,
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))
app.options('*', cors())

// Log every request so Render logs show what's being hit
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} origin=${req.headers.origin || 'none'}`)
  next()
})

// Webhook route needs raw body — must be registered BEFORE express.json()
app.use('/api/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

// ─── Root + health ────────────────────────────────────────────────────────────
app.get('/', (_, res) => res.json({ status: 'online', service: 'YoJaz Elite API', version: '1.0' }))
app.get('/api/health', (_, res) => res.json({ ok: true }))
app.get('/api', (_, res) => res.json({ status: 'online', message: 'YoJaz Elite API working' }))

// ─── User auth store (file-persisted) ────────────────────────────────────────
const USERS_FILE = path.join(__dirname, 'users.json')
let authUsers = {}
try {
  if (fs.existsSync(USERS_FILE)) {
    authUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
    console.log(`[startup] Loaded ${Object.keys(authUsers).length} users from users.json`)
  }
} catch (e) { console.error('[startup] users.json load error:', e.message); authUsers = {} }

function persistAuthUsers() {
  try { fs.writeFileSync(USERS_FILE, JSON.stringify(authUsers, null, 2)) }
  catch (e) { console.error('[persist] Failed to save users.json:', e.message) }
}

const ADMIN_EMAIL_ENV = process.env.VITE_ADMIN_EMAIL || 'admin@yojazelite.gg'
const ADMIN_PASS_ENV  = process.env.VITE_ADMIN_PASSWORD || 'admin123'
const THIRTY_DAYS     = 30 * 24 * 60 * 60 * 1000

function genId() { return Math.random().toString(36).slice(2, 11) }

// ─── Auth endpoints ───────────────────────────────────────────────────────────

app.post('/api/auth/signup', (req, res) => {
  const { email, password, username } = req.body
  if (!email || !password || !username) return res.json({ success: false, error: 'Email, password, and username required.' })
  const key = email.trim().toLowerCase()
  if (authUsers[key]) return res.json({ success: false, error: 'An account with this email already exists.' })
  if (Object.values(authUsers).find(u => u.username?.toLowerCase() === username.trim().toLowerCase()))
    return res.json({ success: false, error: 'Username is already taken.' })
  const now = Date.now()
  authUsers[key] = {
    id: genId(), email: key, password: password.trim(),
    username: username.trim(), tier: null, role: 'user',
    createdAt: now, subscriptionActive: false,
  }
  persistAuthUsers()
  console.log(`[auth/signup] ${key} username=${username} — total: ${Object.keys(authUsers).length}`)
  const { password: _, ...safe } = authUsers[key]
  res.json({ success: true, user: safe })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.json({ success: false, error: 'Email and password required.' })
  const key = email.trim().toLowerCase()
  console.log(`[auth/login] ${key} — known: ${Object.keys(authUsers).length} users`)
  if (key === ADMIN_EMAIL_ENV.toLowerCase() && password.trim() === ADMIN_PASS_ENV)
    return res.json({ success: true, user: { id: 'admin', email: key, username: 'Admin', tier: 'extreme', role: 'admin' } })
  const u = authUsers[key]
  if (!u) return res.json({ success: false, error: 'No account found with that email.' })
  if (u.password !== password.trim()) return res.json({ success: false, error: 'Incorrect password. Try again.' })
  const { password: _, ...safe } = u
  console.log(`[auth/login] success: ${key} tier=${u.tier}`)
  res.json({ success: true, user: safe })
})

app.post('/api/auth/get-user', (req, res) => {
  const { email, id } = req.body
  const key = email?.trim().toLowerCase()
  console.log(`[auth/get-user] ${key || id} — total: ${Object.keys(authUsers).length}`)
  if (key === ADMIN_EMAIL_ENV.toLowerCase())
    return res.json({ success: true, user: { id: 'admin', email: key, username: 'Admin', tier: 'extreme', role: 'admin' } })
  const u = key ? authUsers[key] : Object.values(authUsers).find(u => u.id === id)
  if (!u) { console.log(`[auth/get-user] NOT FOUND: ${key || id}`); return res.json({ success: false }) }
  const { password: _, ...safe } = u
  res.json({ success: true, user: safe })
})

app.post('/api/auth/update-tier', (req, res) => {
  const { email, userId, tier, stripeSessionId } = req.body
  const key = email?.trim().toLowerCase() || Object.keys(authUsers).find(k => authUsers[k].id === userId)
  if (!key || !authUsers[key]) return res.json({ success: false, error: 'User not found.' })
  const now = Date.now()
  authUsers[key].tier = tier
  authUsers[key].subscriptionActive = true
  authUsers[key].subscriptionStart = now
  authUsers[key].subscriptionEnd = now + THIRTY_DAYS
  authUsers[key].paidAt = now
  if (stripeSessionId) authUsers[key].stripeSessionId = stripeSessionId
  persistAuthUsers()
  console.log(`[auth/update-tier] ${key} → ${tier}`)
  res.json({ success: true })
})

app.get('/api/auth/admin/users', (req, res) => {
  if (req.query.adminEmail?.toLowerCase() !== ADMIN_EMAIL_ENV.toLowerCase())
    return res.status(401).json({ error: 'Unauthorized' })
  res.json({ success: true, users: Object.values(authUsers).map(({ password: _, ...u }) => u) })
})

app.post('/api/auth/admin/update-user', (req, res) => {
  if (req.body.adminEmail?.toLowerCase() !== ADMIN_EMAIL_ENV.toLowerCase())
    return res.status(401).json({ error: 'Unauthorized' })
  const { email, userId, tier, action } = req.body
  const key = email?.trim().toLowerCase() || Object.keys(authUsers).find(k => authUsers[k].id === userId)
  if (!key || !authUsers[key]) return res.json({ success: false, error: 'User not found.' })
  const now = Date.now()
  if (action === 'extend') {
    const base = authUsers[key].subscriptionEnd && authUsers[key].subscriptionEnd > now ? authUsers[key].subscriptionEnd : now
    authUsers[key].subscriptionEnd = base + THIRTY_DAYS; authUsers[key].subscriptionActive = true
  } else if (action === 'lifetime') {
    authUsers[key].subscriptionEnd = new Date('2099-01-01').getTime(); authUsers[key].subscriptionActive = true
  } else if (action === 'reset') {
    authUsers[key].tier = null; authUsers[key].subscriptionActive = false
  } else if (tier) {
    authUsers[key].tier = tier
    if (tier) { authUsers[key].subscriptionEnd = now + THIRTY_DAYS; authUsers[key].subscriptionActive = true }
  }
  persistAuthUsers()
  res.json({ success: true })
})

// ─── Plans ────────────────────────────────────────────────────────────────────
app.get('/api/plans', (_, res) => {
  res.json([
    { id: 'console', name: 'Console Tweaks', price: 4.99 },
    { id: 'pc-basic', name: 'PC Tweaks', price: 9.99 },
    { id: 'pc-pro', name: 'PC Pro Tweaks', price: 14.99 },
  ])
})

// ─── Create Stripe Checkout Session ──────────────────────────────────────────
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { tier, userId, userEmail } = req.body
    if (!tier || !userId || !userEmail) return res.status(400).json({ error: 'Missing tier, userId, or userEmail' })

    const priceId = PRICE_IDS[tier]
    if (!priceId) return res.status(400).json({ error: `No price configured for tier "${tier}". Set STRIPE_PRICE_${tier.toUpperCase()} in server/.env` })

    const db = readDB()

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

// ─── Verify Checkout Session ──────────────────────────────────────────────────
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
// Webhook URL in Stripe Dashboard: https://yojaz-elite.onrender.com/api/webhook
// Events: checkout.session.completed, customer.subscription.updated,
//         customer.subscription.deleted, invoice.payment_failed
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

// ─── Global error handler — always returns JSON, never HTML ──────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`YoJaz Elite backend running on port ${PORT}`)
  console.log(`Client URL: ${CLIENT_URL}`)
  console.log(`Stripe mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'}`)
})
