let token = '';
let stripe, cardElement;
let currentTransactionId = null;

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();

  if (data.token) {
    token = data.token;
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('payment-box').style.display = 'block';
    // Set up Stripe.js once we're logged in
    const configRes = await fetch('/api/payment/config');
    const { publicKey } = await configRes.json();
    stripe = Stripe(publicKey);
  } else {
    document.getElementById('login-error').innerText = data.error;
  }
}


async function payNow() {
  const country = document.getElementById('country').value;
  const amount = Number(document.getElementById('amount').value);

  document.getElementById('upi-section').style.display = 'none';
  document.getElementById('card-section').style.display = 'none';
  document.getElementById('status').innerText = '';

  const res = await fetch('/api/payment/create-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount, country })
  });
  const data = await res.json();
  currentTransactionId = data.transactionId;

  if (data.method === 'upi') {
    document.getElementById('qr-image').src = data.qrDataUrl;
    document.getElementById('upi-section').style.display = 'block';
  } else if (data.method === 'stripe') {
    document.getElementById('card-section').style.display = 'block';

    const elements = stripe.elements({ clientSecret: data.clientSecret });
    cardElement = elements.create('payment');
    cardElement.mount('#card-element');

    window.currentElements = elements;
  }
}

async function confirmCardPayment() {
  const { error } = await stripe.confirmPayment({
    elements: window.currentElements,
    redirect: 'if_required'
  });

  if (error) {
    document.getElementById('status').innerText = error.message;
  } else {
    document.getElementById('status').innerText = 'Payment successful (confirmed by Stripe webhook shortly)';
  }
}

async function confirmUpi() {
  const res = await fetch(`/api/payment/confirm-upi/${currentTransactionId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  document.getElementById('status').innerText = `Status: ${data.status}`;
}

async function loadTransactions() {
  const res = await fetch('/api/payment/transactions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const rows = await res.json();

  const list = document.getElementById('transaction-list');
  list.innerHTML = '';
  rows.forEach(t => {
    const li = document.createElement('li');
    li.innerText = `#${t.id} — ${t.amount} ${t.currency.toUpperCase()} — ${t.method} — ${t.status}`;
    list.appendChild(li);
  });
}
