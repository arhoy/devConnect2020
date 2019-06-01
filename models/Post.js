const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    avatar:{
        type:String
    },
    likes:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'user'
            }
        }
    ],
    date:{
        type:Date,
        default:Date.now
    }

});

module.exports = Post = mongoose.model('post',PostSchema);