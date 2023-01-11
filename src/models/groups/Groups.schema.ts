import mongoose from "mongoose";


interface group{
    groupname:string,
    groupimage:string,
    groupbio:string,
    groupowner:string,
    ownerid:mongoose.Schema.Types.ObjectId,
}



const groupSchema = new mongoose.Schema<group>({
    groupname:{
        type:String,
        required:true,
        maxlength:25
    },
    groupimage:{
        type:String,
        required:true,
    },
    groupbio:{
        type:String,
        required:true,
        maxlength:250,
    },
    groupowner:{
        type:String,
        required:true,
    },
    ownerid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
});



const Groups = mongoose.model('group', groupSchema);

export default Groups;