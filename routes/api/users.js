const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

// route: api/users
// Test Route
// access: public
router.get('/', (req, res) => res.json({ msg: 'Users route is working' }));

router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Email is not valid').isEmail(),
    check(
      'password',
      'Please enter a valid password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // see if the user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{msg: 'User Already Exists'}] });
      }
      // get the users gravatar
      const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });

      // create a new instance of the user
      user = new User({ name, email, avatar, password });

      // Encrypt password using Bcrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // save user to the database
      await user.save();

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
