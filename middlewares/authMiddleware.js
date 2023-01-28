const jwt = require('jsonwebtoken')

const requireAuth = (req,res,next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token,'secretkey',(err,decoded)=>{
            if(err){
                console.log(err);
                res.sendStatus(401);
            }
            else{
                console.log(decoded);
                next()
            }
        })
    }
    else{
        res.sendStatus(401)
    }
}

module.exports= {requireAuth}