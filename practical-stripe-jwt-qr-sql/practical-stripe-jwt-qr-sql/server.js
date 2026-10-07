require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const webhookRoutes = require('./routes/webhook');

const app = express();
app.use(cors());

// Mounted BEFORE express.json() because Stripe needs the raw, unparsed body
app.use('/api/payment/webhook', webhookRoutes);

app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes); 
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
