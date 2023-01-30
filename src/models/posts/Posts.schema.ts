import mongoose from "mongoose";


interface posts{
    userid:mongoose.Schema.Types.ObjectId,
    title:string,
    brief:string,
    recipe?:string,
    image:string,
    comments:Number,
    shares:Number,
}


const postSchema = new mongoose.Schema<posts>({
    title:{
        type:String,
        required:true
    },
    brief:{
        type:String,
        required:false
    },
    recipe:{
        type:String,
        required:false,
    },
    image:{
        type:String,
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