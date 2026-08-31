

const express =require('express');      // import the express
const Stripe  =require('stripe');    // import the stripe of the webhook or payment 
const { run }= require('../database/db');  // import the function  from the database/db.js 


// create the router for the http request sent to server 
const router = express.router();
const stripe = stripe(process.env.STRIPE_SECRET_KEY);   // import the secret_key from the  dotenv-->

// the stipe the is work on the  original  raw data bytes not [in the json]--->
// important

router.post('/',express.raw({ type :'application/json ' }), async ( req,res )=> {
    let event;

    try {
        event = stripe.webhooks.constructevent(
            req.body,
            req.headers['stripe-signature'],
            process.env.STRIPE_SECRET_KEY
        );
    }catch (err){
        return res.status (400).send('webhook signature verification failed ');
    }


    if (event.type ===  'payment_intent.successeded') {
        const intent  = event.data.object;
        await run("UPDATE transctions SET status = 'paid' WHERE reference_id = ?",[intent.id]);
    }
    res.json({recevied :true});
});
module.exports = router;
