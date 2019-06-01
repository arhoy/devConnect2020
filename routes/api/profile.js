const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator/check')

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const config = require('config');
const request = require('request');


// route: api/profile
// Test Route
// access: public
router.get('/test', (req, res) => res.json({ msg: "Users route is working" }));


// route: api/profile/me
// desc: Get the current users profile
// access: Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user:req.user.id}).populate('user',['name','avatar'])
        
        if(!profile){
            return res.status(400).json({msg:'There was no profile found'})
        }
        return res.json(profile)
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
})


// route: api/profile
// desc: Get all the profiles
// access: Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user',['name','avatar'])
        
        return res.json(profiles);
    } catch(err){
        console.error(err.message);
        return res.status(500).send('Server error');
    }
})

// route: api/profile/user/:user_id
// desc: Get profile by the user id
// access: Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar'])
        if(!profile) return res.status(400).json({msg:'Profile not found'})

        res.json(profile);
    } catch(err){
        if(err.kind === 'ObjectId') return res.status(400).json({msg:'Profile not found'});
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

// route: api/profile
// type : DELETE
// desc: delete the user's full profile
// access: Private
router.delete('/', auth, async (req,res) => {
    try {
      await Profile.findOneAndRemove({ user:req.user.id });  
      res.json({ msg:'User has been deleted!' });
    } catch (err) {
        res.status(400).json({msg:'Cannot delete user at this time!'});
    }
})


// route: api/profile/
// type : POST
// desc: create or update the user profile
// access: Private
router
    .post('/',
     auth,
     [
         check('status','Status is required!').not().isEmpty(),
         check('skills','Please enter one or more skills seperated by commas').not().isEmpty()
     ], 
    async (req,res)=> {
        try {
            const errors = validationResult(req); // from check middleware above
            if(!errors.isEmpty()){
                return res.status(400).json({ errors: errors.array() }); // get back an errors array from this middleware
            } 
            // build user profile based on the req.body (user form input)
            const { company, website,location,bio,status,githubusername,skills,youtube,facebook,twitter,instagram,linkedin } = req.body;
            // initialize profile fields object. Manipulate user response to store in db
            const profileFields = {};
            profileFields.user = req.user.id;
            if(company) profileFields.company = company;
            if(website) profileFields.website = website;
            if(location) profileFields.location = location;
            if(bio) profileFields.bio = bio;
            if(status) profileFields.status = status;
            if(githubusername) profileFields.githubusername = githubusername;
            if(skills) {
                profileFields.skills = skills.split(',').map(skill=> skill.trim())
            }

            // initialize the social fields object since this is an object inside object.
            profileFields.social = {};
            if(twitter) profileFields.social.twitter = twitter;
            if(linkedin) profileFields.social.linkedin = linkedin;
            if(instagram) profileFields.social.instagram = instagram;
            if(facebook) profileFields.social.facebook = facebook;
            if(youtube) profileFields.social.youtube = youtube;
            
            // update the profile
            try {
                let profile = await Profile.findOne({user:req.user.id})
                if(!profile){
                    // create profile
                    profile = new Profile(profileFields);
                    await profile.save();
                    return res.json(profile);
                    
                }
                profile = await Profile.findOneAndUpdate(
                    { user:req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                // save profile
                await profile.save()
                res.json(profile);
            } catch (err){
                console.error(err.message);
                res.status(500).send('Server Error');
            }


        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
})

// route: api/profile/github/:username
// type : GET
// desc: grab github username and repo info
// access: Public
router.get('/github/:username', (req,res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method:'GET',
            headers: {'user-agent':'node.js'}
        }
        request(options,(error,response,body)=> {
            if(error) console.error(error);
            if(response.statusCode !== 200) return res.status(404).json({msg:'No Github profile found!'});
            // return the body of the response.
            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;
