import { Request, Response, NextFunction } from "express";
import jwt, { JwtHeader, JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/Signup.schema";

const tokenkey = process.env.TOKEN_KEY!;

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token: any = req.cookies.jwt;

  if (!token) {
    return res
      .status(403)
      .send({ message: "You need to sign in before you eat this!" });
  }

  try {
    const decoded = jwt.verify(token, tokenkey)as {user_id:mongoose.Schema.Types.ObjectId, email?:string} | JwtPayload;
    res.locals.user = decoded.user_id
  } catch (err) {
    return res.status(401).send("Invalid Token!");
  }

  return next();
};



module.exports = verifyToken;

