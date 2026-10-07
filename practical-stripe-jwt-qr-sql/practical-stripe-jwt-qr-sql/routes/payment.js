const express = require('express');
const Stripe = require('stripe');
const verifyToken = require('../middleware/auth');
const { generateUpiQr } = require('../utils/qrGenerator')
const { run, all } = require('../database/db');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// India routes to UPI QR; every other supported country routes to Stripe card payment
const CURRENCY_BY_COUNTRY = {
  IN: 'inr',
  US: 'usd',
  GB: 'gbp',
  AE: 'aed'
};

// Publishable key is safe to expose to the browser
router.get('/config', (req, res) => {
  res.json({ publicKey: process.env.STRIPE_PUBLIC_KEY });
});

router.post('/create-payment', verifyToken, async (req, res) => {
  const { amount, country } = req.body;
  const currency = CURRENCY_BY_COUNTRY[country];

  if (!currency) return res.status(400).json({ error: 'Unsupported country' });

  if (country === 'IN') {
    // --- UPI QR path ---
    const insert = await run(
      `INSERT INTO transactions (user_id, amount, currency, country, method, status)
       VALUES (?, ?, ?, ?, 'upi_qr', 'pending')`,
      [req.user.id, amount, currency, country]
    );

    const { qrDataUrl, upiString } = await generateUpiQr({ amount, orderId: insert.lastID });
    await run('UPDATE transactions SET reference_id = ? WHERE id = ?', [upiString, insert.lastID]);

    return res.json({ method: 'upi', transactionId: insert.lastID, qrDataUrl });
  }

  // --- Stripe card path (any other supported country/currency) ---
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: { enabled: true }
  });

  const insert = await run(
    `INSERT INTO transactions (user_id, amount, currency, country, method, status, reference_id)
     VALUES (?, ?, ?, ?, 'stripe_card', 'pending', ?)`,
    [req.user.id, amount, currency, country, paymentIntent.id]
  );

  res.json({ method: 'stripe', transactionId: insert.lastID, clientSecret: paymentIntent.client_secret });
});

// Demo-only: simulates a UPI app confirming payment.
// A production UPI integration confirms this via your PSP/bank's webhook instead.
router.post('/confirm-upi/:transactionId', verifyToken, async (req, res) => {
  await run("UPDATE transactions SET status = 'paid' WHERE id = ?", [req.params.transactionId]);
  res.json({ status: 'paid' });
});

router.get('/transactions', verifyToken, async (req, res) => {
  const rows = await all(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

module.exports = router; 
