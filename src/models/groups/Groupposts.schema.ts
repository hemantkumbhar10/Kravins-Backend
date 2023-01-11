import mongoose from "mongoose";


interface grouppost{
    groupid:mongoose.Schema.Types.ObjectId;
    postid:mongoose.Schema.Types.ObjectId;
}



const groupPostSchema = new mongoose.Schema<grouppost>({
    groupid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    postid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
})


const Grouppost = mongoose.model('grouppost', groupPostSchema);

export default Grouppost;


