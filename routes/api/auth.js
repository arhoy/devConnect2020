const express = require("express");
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

// route: api/auth
// type: GET
// Test Route
// access: public
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){
        console.error(err.message);
        res.status(500).send('There was a server error');
    }
});

// route: api/auth
// type: POST
// desc: Login - Authenticate user and get token
// access: public
router.post(
    '/',
    [
      check('email', 'Email is not valid').isEmail(),
      check(
        'password',
        'Password is required'
      ).exists()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
  
      try {

        // see if the user exists
        let user = await User.findOne({ email });
        if (!user) {
           return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] });
        }

        // verify the password
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] });
        }
 

        // jwt related
        const payload = {
            user:{
              id:user.id
            }
        }
        // signs a jwt token with your user id created by the db and the jwtSecret.
        jwt.sign( 
          payload,
          config.get('jwtSecret'),
          {expiresIn:360000},
          (err,token) => {
              if(err) throw err;
              // send back token
              res.status(200).json({token}); // we get back this token that gets stored in local storage of the users machine so that they can access protected routes after they login
          })
        
  
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  );

module.exports = router;
