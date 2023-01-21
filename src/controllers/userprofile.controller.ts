import {Request, Response} from 'express';
import mongoose from 'mongoose';
import User from '../models/Signup.schema';
import UserProfile from "../models/Userprofile.schema";
import moment from 'moment';


interface userprofile{
  fullname: string,
  birthdate: Date,
  profilepic:string

}

interface usersignintype {
  _id?: any;
  email: string;
  password: string;
  username:string;
  token?: string | null;
  verificationquestion?: string;
}


const getUserProfile = async(req:Request, res:Response)=>{

  try{
    const id = res.locals.user;

    if(!id){
      return res.status(401).send('Please Sign in to see your profile')
    }
    const getuser:usersignintype | null = await User.findById(id);
    const userid = {userid:id};
    const userprofile: userprofile | null = await UserProfile.findOne(userid);
    const userInfo={
      email:getuser?.email,
      username:getuser?.username,
      fullname:userprofile?.fullname,
      birthdate:userprofile?.birthdate,
      profilepic:userprofile?.profilepic,

    }
    return res.status(200).send(JSON.stringify(userInfo));
  }catch(err){
    return res.status(500).json({message:'oops! some error occured!'});
  }
}


const updateUserProfile =async (req:Request,res:Response)=>{
  

  const csrftoken = res.locals._csrf;
  
  try {
    //fetching user data from body
    const { username, email, fullname, birthdate, profilepic } = req.body;

    // console.log(new Date(birthdate).toISOString());

    //if data is null, sending appropriate feedback
    if (!(username && email)) {
      return res.status(400).send("Please fill out this input!"); 
    }

  const mailFormat:RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  
  const isEmailValid = email.match(mailFormat);

  if(!isEmailValid){
    return res.status(400).send('Please enter valid email address!');
  }


  const id = res.locals.user;

  if(!id){
    return res.status(401).json({message: "Please login first!"});
  }

    //grab all the data above and create new user
    const user: {email:string, username:string} | any= await User.findByIdAndUpdate(id, {email:email,username:username}, {new:true});

    if(!user){
      return res.status(404).json({message:'User not found!'});
    }

    const userid = {userid:id};

    const update_user_profile_data = {
      fullname: fullname,
      birthdate: new Date(birthdate).toISOString(),
      profilepic: profilepic
    }

    const userprofile: userprofile | any = await UserProfile.findOneAndUpdate(userid,update_user_profile_data,{new:true});
    const userdata=[user,userprofile];

    return res.status(200).send(JSON.stringify(userdata));
  } catch (err) {
    return res.status(500).json({message:"Something went wrong!"});
  }

}


const deleteUserProfile = async(req:Request,res:Response)=>{
  try{

    const id = res.locals.user;

    if(!id){
      res.status(401).send('Please Sign in to see your profile')
    }

    const getuser:usersignintype | null = await User.findByIdAndDelete(id);
    const userid = {userid:id};
    const userprofile: userprofile | any = await UserProfile.findOneAndDelete(userid);

    return res.status(200).clearCookie("jwt", { httpOnly: true }).send('Im feeling sad to see you go!');
  }catch(err){
    return res.status(500).send(err);
  }
}

export default {getUserProfile,updateUserProfile,deleteUserProfile};