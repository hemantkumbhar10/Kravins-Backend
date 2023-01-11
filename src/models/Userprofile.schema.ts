import mongoose, { ObjectId } from "mongoose";

import {Schema} from 'mongoose';


interface userprofile{
    userid:ObjectId,
    fullname: string,
    birthdate: Date | undefined,
    profilepic:string

}


const userSchema = new Schema<userprofile>({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    fullname:{
        type:String,
        required:true,
    },
    birthdate:{
        type:Date,
        default:new Date('01/04/2004').toISOString()
    },
    profilepic:{
        type:String,
        required:true,
    },
},{timestamps:true});

const UserProfile = mongoose.model('userprofile', userSchema);

export default UserProfile;