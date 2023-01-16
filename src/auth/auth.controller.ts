import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

import User from "../models/Signup.schema";
import UserProfile from "../models/Userprofile.schema";
import { ObjectId } from "mongoose";
const checkJWTExpiry = require('./auth.middleware');


interface usertype {
  _id?: any;
  username?: string;
  email: string;
  password: string;
  token?: string | null;
  verificationquestion?: {question:string, answer:string};
}

interface usersignintype {
  _id?: any;
  email: string;
  password: string;
  token?: string | null;
  verificationquestion?: {question:string, answer:string};
}

interface userprofile{
  userid:ObjectId,
  fullname: string,
  birthdate?: Date | undefined,
  profilepic:string

}

interface TypedRequestBody<T> extends Request {
  body: T;
}

const tokenkey = process.env.TOKEN_KEY!;
const forgot_password_token_key = process.env.FORGOTPASSWORD_TOKEN!;

const signup = async (req: TypedRequestBody<usertype>, res: Response) => {
  let token: any;
  
  try {
    //fetching user data from body
    const { username, email, password, verificationquestion } = req.body;
  

    //if data is null, sending appropriate feedback
    if (!(username && email && password && verificationquestion)) {
      return res.status(400).json({message:"Please fill out all inputs!"});
    }

    var _email = email.toLowerCase();
    verificationquestion.question =verificationquestion.question.replace(/\s+/g, '').toLowerCase();
    verificationquestion.answer = verificationquestion.answer.replace(/\s+/g, '').toLowerCase();
   
    if(username.trim().length > 15){
      return res.status(400).json({message:'Username is too big!'});
    }

  const mailFormat:RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const passwordFormat:RegExp = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;  
  const isEmailValid = _email.match(mailFormat);
  const isPasswordValid = password.match(passwordFormat);

  if(!isEmailValid){
    return res.status(400).json({message:'Please enter valid email address!'});
  }
  if(!isPasswordValid){
    return res.status(400).json({message:'Password must include 7 to 15 characters which contain at least one numeric digit and a special character'})
  }

    const oldUsermail: string | null = await User.findOne({ email:_email });
    const oldUserusername: string | null = await User.findOne({ username });

    ///if username and email alreayd exists in db then sending appropriate feedback
    if (oldUsermail || oldUserusername) {
      return res.status(409).json({message:"User already exists!"});
    }

    // encrypt password
    const encryptedPassword: string = await bcrypt.hash(password, 10);

    //grab all the data above and create new user
    const user: usertype = await User.create({
      username,
      email: _email.toLowerCase(),
      password: encryptedPassword,
      verificationquestion: verificationquestion,
    });

    // const userprofile: userprofile = await UserProfile.create({
    //   userid: user._id,
    //   fullname: "",
    //   profilepic:"",
    // });

    const userprofile = new UserProfile<userprofile>({
      userid: user._id,
      fullname: "",
      profilepic: "",
    });
    await userprofile.save();

    const profilepic = userprofile.profilepic;
    

    // console.log(UserProfile);

    //create token for session for user to stay without having to login again
    token = jwt.sign({ user_id: user._id, _email }, tokenkey, {
      expiresIn: "2d",
    });
    const decoded= jwt.verify(token, tokenkey) as {exp:number}
    user.token = token;
    const expiresAt = decoded.exp;
    //return created user


    const userInfo = Object.assign({}, {username, _email,profilepic});

    res.cookie("jwt", token, { httpOnly: true });

    res.status(200).send(
      {
        message:'New user created!',
        userInfo,
        token,
        expiresAt,
      }
    );



  } catch (err) {

    return res.status(400).json({message:'There has been a problem creating your account, try again!'});
  }
};

const signin = async (req: TypedRequestBody<usersignintype>, res: Response) => {

  let token: string;
  try {
    const emailid= req.body.email;
    const passwordid = req.body.password;
    if (!(emailid && passwordid)) {
      return res.status(400).json({message:"Please fill all empty inputs!"});
    }

    const _email = emailid.toLowerCase();
    const isUser: usertype | null = await User.findOne({ email:_email });
    if(!isUser){
      return res.status(401).json({message:'User does not exists! Please create account'})
    }

    const userprofile: userprofile | null = await UserProfile.findOne({ userid: isUser._id });

    const profilepic = userprofile ?  userprofile.profilepic : '';

    const passwordValid = await bcrypt.compare(passwordid, isUser?.password);

    if(!passwordValid){
      return res.status(403).json({message:'Invalid Credentials'});
    }


      token = jwt.sign({ user_id: isUser._id, _email }, tokenkey, {
        expiresIn: "2d",
      })
  
    const decoded = jwt.verify(token, tokenkey) as {exp:number};
   
      const {username, email,} = isUser;
      isUser.token = token;
  
      const expiresAt = decoded.exp;

      const userInfo = Object.assign({}, {username, email,profilepic});


      res.cookie("jwt", token, {httpOnly:true});

      res.status(200).send(
        {
          message:'Login Successful!',
          userInfo,
          token,
          expiresAt,
        }
      )
    }
     catch (err) {

    return res.status(500).send({message: "Somethings wrong, please try again!"});
  }
};

const requestPasswordUpdate = async (
  req: TypedRequestBody<{ email: string; verificationquestion: {question:string, answer:string} }>,
  res: Response,
  next: NextFunction
) => {
  const { email, verificationquestion } = req.body;

  if (!(email && verificationquestion)) {
    return res.status(400).send("Please fill all the inputs first");
  }
  

  ///remember to give question to user first in order to get answer
  
  const user: usersignintype | null = await User.findOne({ email });

  if (!user) {
    return res.status(400).send("Invalid email or verification answer!");
  }

  try {

    if (user && verificationquestion.answer=== user.verificationquestion?.answer) {
      const forgotpasstoken = await jwt.sign({ email }, forgot_password_token_key, {
        expiresIn: "120s",
      });
      return res.redirect(`/resetpassword?token=${forgotpasstoken}&email=${email}`);
    }
    return res.status(400).send("Wrong email or verification answer!");
  } catch (err) {
    return res.status(500).send("Sorry,I smell something wrong!");
  }
};

const forgotpassword = async (
  req: TypedRequestBody<{ password: string; repeatpassword: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const querydata = req.query;

    const email: any = querydata.email!;
    const forgotpasstoken: any = querydata.token!;

    const isValidUser = jwt.verify(forgotpasstoken, forgot_password_token_key);

    if (!isValidUser) {
      return res
        .status(400)
        .send("Invalid request or token is expired, try again!");
    }

    const { password, repeatpassword } = req.body;

    if (!(password && repeatpassword)) {
      return res.status(400).send("Please fill out all inputs!");
    }

    if(password !== repeatpassword){
      return res.status(400).send('Passwords do not match!');
    }

      const encryptedPassword: string = await bcrypt.hash(password, 10);

      const user: usersignintype | null = await User.findOneAndUpdate({
        email: email.toLowerCase(),
        $set: { password: encryptedPassword },
      });
      const reToken = jwt.sign({ user_id: user?._id, email }, tokenkey, {
        expiresIn: "2d",
      });

      if (user) {
        user.token = reToken;
      }
      //return created user
      const maxAge = 2 * 24 * 60 * 60;
      if (req.cookies.jwt) {
        res.clearCookie("jwt", { httpOnly: true });
        res.cookie("jwt", reToken, { httpOnly: true, maxAge: maxAge * 1000 });
      }
      res.cookie("jwt", reToken, { httpOnly: true, maxAge: maxAge * 1000 });

      return res.status(200).send(user);

  } catch (err) {
    return res.status(500).send('You did not responded in time, try again!');
  }
};

const signout = async(req: Request, res: Response, next: NextFunction) => {
  try {
    return res
      .status(200)
      .clearCookie("jwt", {httpOnly:true})
      .json({message:"You have successfully logged out"});
  } catch (err) {
    console.log(err)
    return res.status(500).json({messsage:"Something went wrong!, Please try again!"});
  }
};

export default {
  signup,
  signin,
  requestPasswordUpdate,
  forgotpassword,
  signout,
};
