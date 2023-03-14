const expressJwt = require('express-jwt');

function authJwt(){
    const secret = process.env.PASS_SEC;
    return expressJwt(
        {
            secret:secret,
            algorithms: ['HS256']
        }
    )
}

module.exports = authJwt;