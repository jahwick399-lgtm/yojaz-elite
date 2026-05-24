# Stripe Setup Guide — YoJaz Elite

This guide walks you through connecting real Stripe payments to YoJaz Elite. Follow each step in order.

---

## Step 1 — Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and sign up (or log in).
2. Complete your account verification if you plan to accept live payments.
3. For testing, you can use **Test mode** immediately — no verification needed.

> Make sure you're in **Test mode** (toggle in the top-left of the Stripe Dashboard) while setting things up.

---

## Step 2 — Get Your API Keys

1. In the Stripe Dashboard, go to **Developers → API keys**.
2. Copy your keys:
   - **Publishable key** — starts with `pk_test_...` (used by the frontend, currently unused but good to note)
   - **Secret key** — starts with `sk_test_...` — **keep this private, never share it**

You'll paste the **Secret key** into `server/.env` in Step 4.

---

## Step 3 — Create Your Products & Prices

You need to create 3 subscription products in Stripe — one for each coaching tier.

1. In the Stripe Dashboard, go to **Products → Add product**.

**Basic Coaching**
- Name: `Basic Coaching`
- Pricing: Recurring, `$7.99` per month
- Click **Save product**
- Copy the **Price ID** — it starts with `price_...`

**Premium Coaching**
- Name: `Premium Coaching`
- Pricing: Recurring, `$12.99` per month
- Copy the **Price ID**

**Extreme Coaching**
- Name: `Extreme Coaching`
- Pricing: Recurring, `$19.99` per month
- Copy the **Price ID**

You'll paste these 3 Price IDs into `server/.env` in the next step.

---

## Step 4 — Configure the Backend (.env)

1. In the `server/` folder, copy `.env.example` to a new file named `.env`:
   ```
   cp server/.env.example server/.env
   ```
   Or on Windows:
   ```
   copy server\.env.example server\.env
   ```

2. Open `server/.env` and fill in your values:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   STRIPE_PRICE_BASIC=price_YOUR_BASIC_PRICE_ID
   STRIPE_PRICE_PREMIUM=price_YOUR_PREMIUM_PRICE_ID
   STRIPE_PRICE_EXTREME=price_YOUR_EXTREME_PRICE_ID
   CLIENT_URL=http://localhost:5173
   PORT=3001
   ```

   - Replace `sk_test_YOUR_SECRET_KEY_HERE` with your **Secret key** from Step 2
   - Replace each `price_YOUR_*_PRICE_ID` with the Price IDs from Step 3
   - Leave `STRIPE_WEBHOOK_SECRET` blank for now — you'll fill it in after Step 5

---

## Step 5 — Set Up the Webhook (Local Testing with Stripe CLI)

Webhooks let Stripe notify your backend when payments succeed, subscriptions change, etc.

### For local development (Stripe CLI):

1. Install the Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Log in:
   ```
   stripe login
   ```
3. Forward events to your local server:
   ```
   stripe listen --forward-to localhost:3001/api/webhook
   ```
4. The CLI will print a webhook signing secret like `whsec_...`
5. Copy that value into `server/.env` as `STRIPE_WEBHOOK_SECRET=whsec_...`

### For production (live server):

1. In the Stripe Dashboard, go to **Developers → Webhooks → Add endpoint**.
2. Set the endpoint URL to: `https://yourdomain.com/api/webhook`
3. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**, then reveal and copy the **Signing secret** (`whsec_...`)
5. Paste it into `server/.env` as `STRIPE_WEBHOOK_SECRET`

---

## Step 6 — Configure the Frontend (.env)

1. In the root project folder, copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. The default `VITE_API_URL=http://localhost:3001` is correct for local development.
3. For production, change it to your deployed backend URL:
   ```
   VITE_API_URL=https://api.yourdomain.com
   ```

---

## Step 7 — Run the Backend

```bash
cd server
npm install
npm run dev
```

You should see:
```
YoJaz Elite backend running on http://localhost:3001
Stripe mode: TEST
```

Keep this terminal open while using the app.

---

## Step 8 — Run the Frontend

In a separate terminal, from the project root:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Step 9 — Test a Payment

1. Log in to the app (or create an account)
2. Go to **Subscribe** and pick a plan
3. You'll be redirected to Stripe Checkout
4. Use Stripe's test card: `4242 4242 4242 4242` with any future expiry and any CVC
5. Complete the checkout — you should land on the success page with your tier activated

More test cards: [https://stripe.com/docs/testing#cards](https://stripe.com/docs/testing#cards)

---

## Going Live

When you're ready to accept real payments:

1. In the Stripe Dashboard, switch from **Test mode** to **Live mode**
2. Get your **live** Secret key (`sk_live_...`) from **Developers → API keys**
3. Create the same 3 products again in live mode and copy the live Price IDs
4. Update `server/.env` with the live keys
5. Set up a new production webhook endpoint pointing at your live domain
6. Deploy the backend server to a hosting provider (Railway, Render, Fly.io, etc.)
7. Update `VITE_API_URL` in the frontend `.env` (or your hosting platform's env vars) to your live backend URL
8. Rebuild and redeploy the frontend

> **Never commit `.env` files to git.** Both `server/.env` and the root `.env` are gitignored by default.

---

## File Summary

| File | What goes in it |
|------|----------------|
| `server/.env` | Stripe secret key, webhook secret, price IDs |
| `.env` (root) | Frontend API URL (`VITE_API_URL`) |
| `server/.env.example` | Template — safe to commit, no real keys |
| `.env.example` (root) | Template — safe to commit, no real keys |
