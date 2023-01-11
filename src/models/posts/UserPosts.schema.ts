import mongoose from "mongoose";


interface userposts{
    userid:mongoose.Schema.Types.ObjectId,
    postid:mongoose.Schema.Types.ObjectId[],
}


const userPostSchema = new mongoose.Schema<userposts>({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    postid:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    }]
},{timestamps:true});


const UserPost = mongoose.model('userpost', userPostSchema);

export default UserPost;