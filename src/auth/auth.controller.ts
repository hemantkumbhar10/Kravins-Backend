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
  birthdate: Date | undefined,
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
      return res.status(400).send("Please fill out all inputs!");
    }

  const mailFormat:RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const passwordFormat:RegExp = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;  
  

  const isEmailValid = email.match(mailFormat);
  // console.log(isEmailValid);
  const isPasswordValid = password.match(passwordFormat);

  if(!isEmailValid){
    return res.status(400).send('Please enter valid email address!');
  }
  if(!isPasswordValid){
    return res.status(400).send('Password must include 7 to 15 characters which contain at least one numeric digit and a special character')
  }


    const oldUsermail: string | null = await User.findOne({ email });
    const oldUserusername: string | null = await User.findOne({ username });

    ///if username and email alreayd exists in db then sending appropriate feedback
    if (oldUsermail || oldUserusername) {
      return res.status(409).send("User already exists!");
    }

    // encrypt password
    const encryptedPassword: string = await bcrypt.hash(password, 10);

    //grab all the data above and create new user
    const user: usertype = await User.create({
      username,
      email: email.toLowerCase(),
      password: encryptedPassword,
      verificationquestion: verificationquestion,
    });

    const userprofile: userprofile = await UserProfile.create({
      userid: user._id,
      fullname: 'Jhon Doe',
      profilepic:'this is my image',
    });

    // console.log(UserProfile);

    //create token for session for user to stay without having to login again
    token = jwt.sign({ user_id: user._id, email }, tokenkey, {
      expiresIn: "2d",
    });
    const decoded= jwt.verify(token, tokenkey) as {exp:number}
    user.token = token;
    const expiresAt = decoded.exp;
    //return created user


    const userInfo = Object.assign({}, {username, email});

    const userdata={
      userInfo,
      token,
      expiresAt
    };


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
    return res.status(400).send({message:'There has been a problem creating your account!'});
  }
};

const signin = async (req: TypedRequestBody<usersignintype>, res: Response) => {
  let token: string;
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).send("Please fill out all inputs!");
    }

    const isUser: usersignintype | null = await User.findOne({ email });

    if(!isUser){
      return res.status(401).send('User does not exists! Please create account')
    }

    if (isUser && (await bcrypt.compare(password, isUser?.password))) {
      token = await jwt.sign({ user_id: isUser._id, email }, tokenkey, {
        expiresIn: "10h",
      });

      isUser.token = token;
      const maxAge = 2 * 24 * 60 * 60;
      return res
        .status(200)
        .cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 })
        .send(isUser);
      // return res.status(200).setHeader("Authorization", 'Bearer ' +token).send(isUser);
    }
    return res.status(400).send("Invalid Credentials");
  } catch (err) {
    return res.status(500).send(err);
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

const signout = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res
      .status(200)
      .clearCookie("jwt", { httpOnly: true })
      .send("You have successfully logged out");
  } catch (err) {
    return res.status(500).send(err);
  }
};

export default {
  signup,
  signin,
  requestPasswordUpdate,
  forgotpassword,
  signout,
};
