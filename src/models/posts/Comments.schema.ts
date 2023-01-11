import mongoose from "mongoose";



interface comments{
    postid:mongoose.Schema.Types.ObjectId,
    userid:mongoose.Schema.Types.ObjectId,
    username:string,
    mention:string,
    comment:string,
    reply:Object[]
}



const commentSchema = new mongoose.Schema<comments>({
    postid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    mention:{
        type:String,
        maxlength:25
    },
    username:{
        type:String,
        required:true,
    },
    comment:{
        type:String,
        required:true,
        maxlength:250
    },
}, {timestamps:true});


const Comments = mongoose.model('comment', commentSchema);

export default Comments;