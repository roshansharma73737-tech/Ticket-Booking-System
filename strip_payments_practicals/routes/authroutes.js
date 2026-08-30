
// import the  main thing  like :- express , jsonwebtoken,  get{function }-->

const  express = require('express');
const jwt = require('jsonwebtoken');
const{get} = require('../database/db');

// create  the router the for  the api-->
const router = express.router();

router.post('/login' , async (req ,  res ,) =>{
    const {username  , password  }  = req.body;

    const user = await get (
        'SELECT * FROM users WHERE username  = ?  AND password = ?  ',
        [username, password ]
    );
    if (!user) return req.status(404).json({message : 'invalid credentials'});

    const token = jwt.sign({id:user.id,username: user.username},process.env.JWT_SECRET,{expiresIn: ' 2h'});
    req.json({token }); 
});

module.exports = router;