import mongoose from "mongoose";


interface likes{
    postid:string,
    likes:mongoose.Schema.Types.ObjectId[],
}




const likeSchema = new mongoose.Schema<likes>({
    postid:{
        type:String,
        required:true
    },
    likes:{
        type:[mongoose.Schema.Types.ObjectId],
    },
});


const Likes = mongoose.model('like', likeSchema);

export default Likes;