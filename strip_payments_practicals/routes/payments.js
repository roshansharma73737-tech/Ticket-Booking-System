
const express = require('express');                              // import the express
const stripe = require('stripe');                               // import the stripe  for the payment 
const verifytoken = require('../middleware/auth');             // import the function of the middleware/auth.js
const {genrerate_upi_QR } = require('../untils/qr_generator');// import  the QR generate upi function form the  untils/qr_generator.js
const { run , all} = require('../database/db');              // import the  two function  run and all  from the  database/db.js

const router = express();              // create the router for the  api endpoints request handle -->
const stripe = stripe(process.env.STRIPE_SECRET_KEY);   // import the secret key  form the dotenv-->


// create the upi string for the only indian currency  ever other country supported routes  totcard payment -->
const CURRENCY_BY_COUNRY =  {
    IND : 'inr',
    US : 'usd',
    GB : 'gbp',
    AE : 'aed'
};

// expose the public key for the genral user -->
router.get('/config' ,(req,res) =>{
    req.json({public_key : process.env.STRIPI_PIBLIC_KEY});
});
 

router.post('/payment_section', verifytoken, async (req ,res )=> {
    const { amount ,  country } = req.body;
    const  currency = CURRENCY_BY_COUNRY[country];
    
    if (!currency) return  res.status(400).json({message : 'unsupported currecy -! '});

    if (country === 'IND') {

        //  UPI QR path ---
        const  insert = await run(
            `INSERT INTO transctions (user_id ,amount ,currency ,country ,method ,status)
            VALUES(?,?,?,?, 'upi_qr',pending)`,
            [req.user.id, amount,currency, country]

        );

        const  { qrdataurl , upistring} = await genrerate_upi_QR({amount , order_ID: insert.lastID});
        await run('UPDATE transctions SET  reference _id = ? WHERE id = ?',[upistring,insert.lastID]);

        return res.json({method : 'upi', transactionID :insert.lastID,qrdataurl
        });
     }

     // strip card path ( any other supported country currency ) ---> 

    const paymentIndent =  await stripe.paymentIndent.create({
        amount : Math.round(amount * 100),
        currency,
        automatic_payment_methods: {enable: true}
    });

    
    const insert = await run(`
    INSERT  INTO transctions (user_id , amount , currency, country, method, status, reference _id )
    VALUES (?,?,?,?, 'stripe_card','pending',?)`, [req.user.id,amount,currency,country,paymentIndent.id]);

    res.json({ method :'stripe' , transactionID: insert.lastID,clientsecret : paymentIndent.clientsecret});


});


router.post('/confirm-upi/:transactionId', verifytoken, async (req,res)=>{
    await run("UPDATE transctions  SET status = 'paid' WHERE  id =  ?", [req.params.transactionId]);
    res.json({status : 'paid'});
});

router.get('/transactions', verifytoken , async (req,res )=>{
    const rows = await all(
        'SELECT  * FROM transctions WHERE user_id  = ? order BY created_at DESC ',
    [req.user.id]
    );
    res.json(rows);
});

module.exports = router;