import { NextFunction, Request, Response } from "express";
import multer from "multer";




const uploadStrategy = async(req:Request, res:Response, next:NextFunction)=>{
    const inMemoryStorage = multer.memoryStorage();
    multer({ storage: inMemoryStorage }).single('image')(req,res, (err)=>{
        if(!err){
            next()
        }
    });
}

export {uploadStrategy}