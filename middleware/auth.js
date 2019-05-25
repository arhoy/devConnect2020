const jwt = require('jsonwebtoken');

const config = require('config');

module.exports = function (req,res,next){
    // get token from header
    const token = req.header('x-auth-token');

    // check if not token
    if(!token){
        return res.status(401).json({msg:'No token, auth denied'})
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user; // this is the user id from jwt.
        next();
    } catch(err) {
        res.status(401).json({ msg:'Token is not valid' });
    }

}