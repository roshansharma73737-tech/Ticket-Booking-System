

require('dotenv').config();  // for the impoet the environment 
const express = require('express'); //  for the start the application 
const cors = require('cors ');  // for the fortend and backend connection 

const authroutes = require('./routes/authroutes');  // import the auth routes file  with the server -->



// create the server application -->
const app = express();



app.use(express.json());


app.use('/api/authentication',authroutes);  // start the server with the authentication function -->


const PORT =  proccess.env.PORT  || 3000;   
app.listen(PORT ,() => {
    console.log(`server running on the http://localhost:${PORT}`);
});