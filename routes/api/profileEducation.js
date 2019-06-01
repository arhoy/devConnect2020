const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator/check')

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// route: api/profile/education
// type: PUT
// desc: Add a profile education to the list of your educations.
// access: Private
router
    .put('/education',
    auth,
    [
        check('school','Specify your school please!').not().isEmpty(),
        check('degree','Your degree is required!').not().isEmpty(),
        check('fieldofstudy','Field of study is required!').not().isEmpty(),
        check('from','Starting date of position is required!').not().isEmpty()
    ],
    async (req,res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    // destructure and build out new education based on the form fields
    const {school,degree,fieldofstudy,to,from, current, description} = req.body;
    // init the neweducation object.
    const newEdu = {school,degree,fieldofstudy,to,from,current,description};
    try {
        let profile = await Profile.findOne({user:req.user.id});
        if(!profile) return res.status(400).json({msg: 'Profile is not found'})

        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// route: api/profile/education/education_id
// type: DELETE
// desc: Delete the specified education from your profile.
// access: Private
router.delete('/education/:edu_id',auth, async (req,res) => {
    try {
        let profile = await Profile.findOne({user:req.user.id});
        if(!profile) return res.status(400).json({msg: 'Sorry user not found'});
        profile.education = profile.education.filter( edu => edu._id.toString() !== req.params.edu_id.toString() );
        await profile.save();
        res.json(profile);
    } catch (err) {
        if(err.kind === 'ObjectId') return res.status(400).json({msg:'Profile not found'});
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})


module.exports = router;
