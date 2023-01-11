import mongoose from "mongoose";


interface posts{
    userid:mongoose.Schema.Types.ObjectId,
    description:string,
    image:string[],
    comments:Number,
    shares:Number,
}


const postSchema = new mongoose.Schema<posts>({
    description:{
        type:String,
        required:true,
        maxlength:250,
    },
    image:{
        type:[String],
    },
    comments:{
        type:Number,
        default:0
    },
    shares:{
        type:Number,
        default:0
    }
});


const Post = mongoose.model('post', postSchema);

export default Post;