const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator/check')

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// route: api/profile/experience
// type: PUT
// desc: Add a profile experience to the list of your experiences.
// access: Private
router
    .put('/experience',
    auth,
    [
        check('title','Your current position/role is required!').not().isEmpty(),
        check('company','Your company name is required!').not().isEmpty(),
        check('from','Starting date of position is required!').not().isEmpty()
    ],
    async (req,res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    // destructure and build out new experience based on the form fields
    const {title,company,location,to,from, current, description} = req.body;
    // init the newExperience object.
    const newExp = {title,company,location,to,from,current,description};
    try {
        let profile = await Profile.findOne({user:req.user.id});
        if(!profile) return res.status(400).json({msg: 'Profile is not found'})

        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// route: api/profile/experience/experience_id
// type: DELETE
// desc: Delete the specified experience from your profile.
// access: Private
router.delete('/experience/:exp_id',auth, async (req,res) => {
    try {
        let profile = await Profile.findOne({user:req.user.id});
        if(!profile) return res.status(400).json({msg: 'Sorry user not found'});
        profile.experience = profile.experience.filter( exp => exp._id.toString() !== req.params.exp_id.toString() );
        await profile.save();
        res.json(profile);
    } catch (err) {
        if(err.kind === 'ObjectId') return res.status(400).json({msg:'Profile not found'});
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})


module.exports = router;
