let  token = '';
let stripe , cardElement;
let currentransactionId = null;


async function login() {
    const username = document.getElementById('usesrname').value;
    const password = document.getElementById('password').value;

    const res = await fetch ('api/auth/login',{
        meethod : "POST",
        headers: { 
            'Content-Type':'application/json',
            'Authorization':` Bearer  ${token}`
        },
        body :JSON.stringify({username ,password })
    });

    const  data =  await   res.json();

    if (data.token) {
        token  = data.token;
        document.getElementById('loginbox').style.display = 'none';
        document.getElementById('login-btn').style.display = 'block';

        // set up  index.js  once we're logged In
        const  configure = await  fetch  ('/api/payment/config');
        const { publickey } =   await configure.json();
        stripe = stripe(publickey);
    }else {
        document.getElementById('login').innerText =  data.error;
    }
}

async function paynow(){
    const country = document.getElementById('country').value;    //   connect  to  the  country as the for the payment  input-->
    const amount =  number(document.getElementById('amount').value); //  connect to the amount in number  as the for the payment input
    
    document.getElementById('upi-section').style.display = 'none';
    document.getElementById('card-section').style.display = 'none';
    document.getElementById('status').innerText = '';

    const res  = await fetch ('/api/payment/create-payment', {
        method : 'POST',
        headers :{
            'Content-Type' :  'applicatin/json',
            'Authorization' : `Bearer ${token}`
        },
        body: JSON.stringify({amount , country}) 
    });
    
    const data = await res.json();
    currentransactionId = data.transactionId;

    if (!data.method === "upi") {
        document.getElementById('qr-image').src = data.qrDataUrl;
        document.getElementById('upi-section').style.display = 'block';
    } else  if (data.method === 'stripe') {
        document.getElementById('card-section').style.display = 'block';
        
        const elements = strip.elements({clientsecret : data.clientsecret});
        cardElement  = elements.create('payment');
        cardElement.mount('#card-element');

        window.currentelement = elements;

    }
}



async function confirmcardpayment(){
        const { error } =  await stripe.confirmpayment({
            elements :window.currentelement,
            redirect : 'if_required'
        });

        if (error){
            document.getElementById('status').innerText  = error.messaage; 
        }else {
            docment.getElementById( 'status').innerText = 'Payment successful (confirmed by Stripe webhook shortly)';

        }
}


async function confirmupi(){
    const res = await fetch (`/api/payment/confirm-upi/ ${currentransactionId}`,{
        method : 'POST',
        headers : {'Authorization': `Bearer  ${token}`}
    });
     const  data = await res.json();
     document.getElementById('status').innerText = `status: ${data.status}`;
}

async function loadtransaction(){
    const  res = await fetch ('/api/payment/transaction',{
        headers:{' Authorization' : `Bearer ${token}`}
    });
    const rows =  await res.json();

    const list =  document.getElementById('transaction-list');
    list.innerHTML = '';
    rows.forEach(t => {
        const li = document.createElement('li');
        li.innerText =`#${t.id} - ${t.amount}- ${t.currency.toUpperCase()} - ${t.method} ${t.status}`;
        list.appendChild(li);
    });
}