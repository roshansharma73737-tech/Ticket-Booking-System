

// import the jsonweb token 
const jwt = require('jsonwebtoken');

function verifytoken(req, res,next){
    const authheader = req.headers['Authentication'];
    const token = authheader &&  authheader.split(' ')[1];

    if (!token) {
        return  res.status(402).json({error : 'message the in no given '});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err ,decoded) =>{
        if (err) {
            return res.status(403).json({error :' TOken is Invalid  or Expire  '});
        }
        req.user = decoded;
        next();
    });
}

module.exports = verifytoken;