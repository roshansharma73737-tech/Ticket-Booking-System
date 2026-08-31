

require('dotenv').config();  // for the impoet the environment 
const express = require('express'); //  for the start the application 
const cors = require('cors ');  // for the fortend and backend connection 

const authroutes = require('./routes/authroutes');  // import the auth routes file  from  the middleware folder--->
const  paymentsroutes = require('./routes/payments');  // import the payments routes file  form the routes folder--->
const webhookroutes = require('./routes/webhook'); // import the webhook     routes file  form the routes folder--->



// create the server application -->
const app = express();

// for the particular the webhook   because the  strip needs the raw, unprased body ---> 
app.use('api/payment/webhook',webhookroutes);

app.use(express.json());
app.use(express.static('public'));

app.use('/api/payment/process',paymentsroutes);
app.use('/api/authentication',authroutes);  // start the server with the authentication function -->


const PORT =  proccess.env.PORT  || 3000;   
app.listen(PORT ,() => {
    console.log(`server running on the http://localhost:${PORT}`);
});