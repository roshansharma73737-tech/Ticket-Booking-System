# Practical: Stripe + JWT + Country-based QR/UPI + SQL

## What this demonstrates
1. User logs in → server checks the SQL `users` table → issues a **JWT**.
2. User picks a country + amount. The JWT is required for every payment call.
3. **Routing logic**:
   - Country = India → generate a **UPI QR code** (scan-to-pay) using the `qrcode` package.
   - Any other supported country → create a **Stripe PaymentIntent** in that country's currency.
4. Every attempt is written to the SQL `transactions` table as `pending`.
5. Confirmation:
   - Stripe path: a **webhook** (`payment_intent.succeeded`) updates the row to `paid`.
   - UPI path: a demo "I've paid" button simulates the confirmation a real UPI PSP webhook would send.
6. `GET /api/payment/transactions` runs a real `SELECT` to show the logged-in user's history.

## Setup
```bash
npm install
cp .env.example .env
# edit .env: add Stripe test keys, a JWT secret, and your UPI VPA
npm start
```
Open http://localhost:3000. Demo login: `student` / `college123`

To test the Stripe webhook locally, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

## Concepts covered (for viva/practical writeup)
- JWT signing/verification and protected routes
- Stripe PaymentIntents + webhook signature verification (raw body vs JSON body)
- QR code generation from a UPI deep link (`upi://pay?pa=...&am=...&cu=INR`)
- Conditional payment routing based on country/currency
- SQL: schema design, `INSERT`, `UPDATE`, parameterized `SELECT` queries (SQLite)

## File structure
```
practical-stripe-jwt-qr-sql/
├── package.json
├── .env.example
├── server.js                 Express entry point (webhook mounted before JSON parser)
├── database/
│   ├── schema.sql            users + transactions table definitions
│   └── db.js                 SQLite connection, seed data, query helpers
├── middleware/
│   └── auth.js               JWT verification middleware
├── utils/
│   └── qrGenerator.js        builds UPI link + QR image
├── routes/
│   ├── auth.js                POST /api/auth/login
│   ├── payment.js             GET  /api/payment/config
│   │                          POST /api/payment/create-payment   (JWT protected)
│   │                          POST /api/payment/confirm-upi/:id  (JWT protected, demo only)
│   │                          GET  /api/payment/transactions     (JWT protected)
│   └── webhook.js             POST /api/payment/webhook (Stripe signature verified)
└── public/
    ├── index.html             login + country/amount form + QR/card sections
    ├── style.css
    └── script.js               login, payment routing, Stripe.js, transaction list
```

## Notes for submission
- `practical.db` (the SQLite file) is created automatically on first run — you can open it with any SQLite viewer to show your DB structure in the viva.
- Never commit your real `.env` — only `.env.example`.
- Screenshot ideas: login screen, UPI QR displayed, Stripe card element, transaction list, and the SQLite table opened in a DB browser.
