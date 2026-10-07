const QRCode = require('qrcode');

// Builds the standard UPI deep link format that any UPI app can scan and pay
async function generateUpiQr({ amount, orderId }) {
  const vpa = process.env.UPI_MERCHANT_VPA;
  const name = encodeURIComponent(process.env.UPI_MERCHANT_NAME);

  const upiString = `upi://pay?pa=${vpa}&pn=${name}&am=${amount}&cu=INR&tr=${orderId}`;
  const qrDataUrl = await QRCode.toDataURL(upiString);

  return { upiString, qrDataUrl };
}

module.exports = { generateUpiQr };
 