const express = require('express');
const Stripe = require('stripe');
const { run } = require('../database/db');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe requires the RAW request body (not JSON-parsed) to verify the signature
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent( 
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send('Webhook signature verification failed');
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    await run("UPDATE transactions SET status = 'paid' WHERE reference_id = ?", [intent.id]);
  }

  res.json({ received: true });
});

module.exports = router;
