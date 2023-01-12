import mongoose from 'mongoose';
import { Schema } from 'mongoose';

interface usertype {
    username: string;
    email: string;
    password: string;
    token:string | null;
    verificationquestion:{question:string,answer:string};
  }

const signupSchema = new Schema<usertype>({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String
    },
    verificationquestion:{
        type:Object,
        required:true
    },
},
{timestamps:true}
);

const User = mongoose.model('user', signupSchema);
export default User
