const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../../middleware/auth');
const User = require('../../../models/User');
const Post = require('../../../models/Post');
const Profile = require('../../../models/Profile');
const Comment = require('../../../models/Comment');

// route: api/posts/test
// type: GET
// Test Route
// access: public
router.get('/test', (req, res) => res.json({ msg: "Posts route is working" }));

// route: api/posts
// type: GET
// desc: Get all the routes for the posts
// access: public
router.get('/', async (req,res)=>{
    try {
        const posts = await Post.find().sort({date:-1});
        res.json(posts);
    } catch (err) {
        console.error(err.message);
    }
})

// route: api/posts/post_id
// type: GET
// desc: Get a specific post
// access: public
router.get('/:post_id', async (req,res) =>{
    try {
        const post = await Post.findById(req.params.post_id);
        if(!post) return res.status(400).json({msg:'Post is not found'});
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') return res.status(400).json({msg:'Post is not found'});
    }
})
// route: api/posts/post_id
// type:DELETE
// desc Delete a specific post by id
// access Private (only created user can delete his/her post)
router.delete('/:post_id', auth, async (req,res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        // user must have created post
        if(post.user.toString() !== req.user.id) return res.status(401).json({msg:'Access denied!'});

        // post does not exist
        if(!post) return res.status(400).json({msg:'Post is not found'});

        // delete the post
        await Post.findByIdAndDelete(req.params.post_id);

        res.json({msg:'Post Deleted'})
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') return res.status(400).json({msg:'Post is not found'});
    }
})

// route: api/posts/like/:post_id
// type: POST
// description: create a post
// access: any auth user
router.put('/like/:post_id', auth, async (req,res)=> {
    try {
        const post = await Post.findById(req.params.post_id);
        if(!post) return res.status(400).json({msg:'Could not like this post!'});
        if ( post.likes.filter(like => like.user.toString() === req.user.id ).length > 0) return res.status(401).json({msg:'You have already like this post!'})
        
        // add the like
        post.likes.unshift({user:req.user.id});
        
        // save the updated post
        await post.save();

        // return the array of likes
        res.json(post.likes);

    } catch (err) {
        if(err.kind === 'ObjectId') return res.status(400).json({'msg':'Post is not found'});
        console.error(err.message);
        res.status(500).json({msg:'Server Error'});
    }
})

// route: api/posts/unlike/:post_id
// type: POST
// desc: Unlike a post
// access: any auth user
router.put('/unlike/:post_id',auth, async (req,res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if(!post) return res.status(400).json({msg:'Post not found'});
        // check if the post has been liked.
        if( post.likes.filter(like=> like.user.toString() === req.user.id).length === 0 ) return res.status(400).json({msg:'You have not liked the post yet!'})
        
        // remove the like from the post
        post.likes = post.likes.filter( like => like.user.toString() !==req.user.id );

        // save the updated post
        await post.save();

        // return the updated array of likes
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({msg:'Server Error'});
    }
})

// route: api/posts
// type: POST
// description: create a post
// access: public
router.post(
     '/',
     auth,
     [
         check('text','Text is required').not().isEmpty()
     ],
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});

        try {
            const user = await User.findById(req.user.id).select('-password');
            const { text } = req.body;
            // create new post
            const postFields = {
                text,
                name: user.name,
                avatar:user.avatar,
                user:req.user.id
            }
            
            const post = new Post(postFields);
            await post.save();
            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
        
})

module.exports = router;
