import { Request, Response, NextFunction } from "express";
import jwt, { JwtHeader, JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/Signup.schema";

const tokenkey = process.env.TOKEN_KEY!;


// function checkJWTExpiry(req: Request, res: Response, next: NextFunction) {
//   const jwt = req.cookies.jwt;
  
//     // Verify the JWT and check the expiration time
//     const decoded = jwt.verify(jwt, tokenkey)as {exp:number};
//     if (decoded.exp < Date.now() / 1000) {
//       // JWT has expired, return error
//       return res.status(401).json({ error: 'Token expired' });
//     }
//     // JWT is valid, proceed to the next middleware
//     next();
// }


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
// module.exports = checkJWTExpiry;

