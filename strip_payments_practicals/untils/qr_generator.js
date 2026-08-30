const qrcode = require('qrcode');    // import the QR  code  genration of the url 

// create the [ UPI ] statement  and its convert into the  the QRcode  form  from the merchant id  using store in the [ dotenv ] file -->

async function genrerate_upi_QR(amount , order_Id){
    const VPA = process.env.UPI_MEERCHANT_VPA;
    const name = encodeURIComponent(process.env.UPI_MERCHANT_NAME);

    const upistring = `upi://pay?payment=${VPA}&pay=${name}&ru${amount}INR=order${order_Id}`;
    const   qrdataurl = await qrcode.toDataURL(upistring);

    return { upistring , qrdataurl };
}

module.exports = { genrerate_upi_QR };