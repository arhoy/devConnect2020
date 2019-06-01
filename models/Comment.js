const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    post: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    },
    name: {
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    commentDate:{
        type:Date,
        default:Date.now
    },
    likes:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref: 'user'
            }
        }   
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
});

module.exports = Comment = mongoose.model('comment',CommentSchema);


