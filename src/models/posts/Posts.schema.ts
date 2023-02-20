import mongoose from "mongoose";
import Groups from "../groups/Groups.schema";
import UserProfile from "../Userprofile.schema";
import User from "../Signup.schema";


interface posts{
    user_profile:mongoose.Schema.Types.ObjectId |string| typeof User;
    title:string;
    brief:string;
    recipe?:string;
    image:string;
    comments:Number;
    shares:Number;
    groupid?:mongoose.Schema.Types.ObjectId |string| typeof Groups;
}


const postSchema = new mongoose.Schema<posts>({
    user_profile:{
        type: String,
        ref:'userprofile',
        required:false,
    },
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
    },
    groupid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Groups,
        required:false,
    }
},{timestamps:true});


const Post = mongoose.model('post', postSchema);

export default Post;