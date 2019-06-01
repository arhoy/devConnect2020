const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../../middleware/auth');

const User = require('../../../models/User');
const Post = require('../../../models/Post');
const Profile = require('../../../models/Profile');
const Comment = require('../../../models/Comment');

// route: api/comments/test
// type: GET
// Test Route
// access: public
router.get('/test', (req, res) => res.json({ msg: "Comments route is working" }));

// route: api/comments/:post_id
// type: POST
// description: create a comment on the specified post
// access: user auth required.
router.post(
    '/:post_id',
    auth,
    [
        check('text','Text is required').not().isEmpty()
    ],
   async (req,res) => {
       const errors = validationResult(req);
       if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});

       try {
           const user = await User.findById(req.user.id).select('-password');
           const post = await Post.findById(req.params.post_id);
           const { text } = req.body;
           // get and store comment fields
           const commentFields = {
               text,
               name: user.name,
               avatar:user.avatar,
               user:req.user.id,
               post:req.params.post_id
           }
           // create new comment
           const comment = new Comment(commentFields);
           // save comment
           await comment.save();

           // return post
           res.json(post);
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server Error');
       }
       
})

// route: api/comments/:comment_id
// type: DELETE
// description: delete comment.
// only auth user who created comment can delete it!
router.delete('/comment_id', auth, async (req,res) => {
    try {
        await Comment.findOneAndRemove(req.params.comment_id);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// route: api/comments/:post_id
// type: GET
// description: get all comments on a specific post
// access: public
router.get('/:post_id', async (req,res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if(!post) return res.status(400).json({msg:'Post was not found!'});
        let comments = await Comment.find();
        if(!comments) res.status(400).json({msg:'Comments was not found!'});
        comments = comments.filter( comment => comment.post.toString() === req.params.post_id );
        res.json(comments);
    } catch (err) {
        console.error(err.message);
    }
})

// route: api/comments/like/:comment_id
// type PUT
// description: like a specific comment
// access: auth user can like comment, but not their own comment.
router.put('/like/:comment_id', auth, async (req,res) => {
    try {
        const comment = await Comment.findById(req.params.comment_id);
        if(!comment) return res.status(400).json({msg:'Comment not found!'});
        // like the comment
        comment.likes.unshift({user:req.user.id});

        /** TO DO make sure user cannot like there own comment */
        // save the comments
        await comment.save();
        // return the comment
        res.json(comment);
    } catch (err) {
        console.error(err.message);
    }
})

// route: api/comments/unlike/:comment_id
// type PUT
// description: like a specific comment
// access: auth user can unlike comment, but not their own comment.
router.put('/unlike/:comment_id',auth, async (req,res) => {
    try {
        const comment = await Comment.findById(req.params.comment_id);
        if(!comment) return res.status(400).json({msg:'Comment is not found!'});
        // check to see if they have liked
        if( comment.likes.filter(comment => comment.user.toString() === req.user.id).length === 0 ) return res.status(400).json({msg:'You have not liked yet!'});
        // unlike the comment
        comment.likes = comment.likes.filter(comment => comment.user.toString() !== req.user.id )
        // save the comment
        await comment.save();
        // return the comment
        res.json(comment);
    } catch (err) {
        console.error(err.message);
    }
})


module.exports = router;