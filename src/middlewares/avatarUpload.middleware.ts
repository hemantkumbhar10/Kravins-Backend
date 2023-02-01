import { Request, Response } from "express";
import fs from 'fs';
import multer from "multer";
import { Buffer } from 'buffer'
import AzureStorageBlob, { BlockBlobClient } from '@azure/storage-blob';
import {BlobServiceClient} from '@azure/storage-blob';
import intoStream from "into-stream"
import UserProfile from "../models/Userprofile.schema";
// const intoStream = require('into-stream');
// const getStream = import('into-stream');
import { azureUploader } from "./azure.middleware";



const connection_string = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const account_name = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const container_name = process.env.AZURE_USER_PROFILE_CONTAINER_NAME!;


interface userprofile{
    fullname: string,
    birthdate: Date,
    profilepic:string
  
  }

interface UploaderArgs{
    containerName:string,
    userId:string
}



const avtarUploader = async(req:Request, res:Response)=>{
    const userid = res.locals.user;
    if(!userid){
        return res.status(401).json({message:'Unauthorized!'});
    }

    const uploaderArgs:UploaderArgs = {
        containerName: container_name,
        userId: userid
    }

    try{
        const response = await azureUploader(req, res,uploaderArgs );
        return res.status(200).send(response);
    }catch(e){
        return res.status(500).json({message:'Some error occured when uploading photo'});
    }
    
}

  
export { avtarUploader};



// const inMemoryStorage = multer.memoryStorage();
//     const uploadStrategy = multer({ storage: inMemoryStorage }).single('image')(req,res, async(err)=>{
//     // console.log(req.file);
//     const buf = req.file?.buffer!;
//     const binaryBuffer = Buffer.from(buf.toString('binary'),'base64');
//     const blobName = getBlobName(req.file?.originalname,userid);
//     const  blobService = new BlockBlobClient(connection_string,container_name,blobName)
//     const blobExists = await blobService.exists();
//     if (blobExists) {
//     await blobService.delete();
//     }
//     const url = blobService.url;
//     const id = {userid:userid}
//     const urlNow = `${url}?${Date.now()}`
//     const userprofile: userprofile | any = await UserProfile.findOneAndUpdate(id,{profilepic:urlNow},{new:true});
//     console.log(userprofile);
//     const stream = intoStream(binaryBuffer)
//     const streamLength = binaryBuffer.length;

//     blobService.uploadStream(stream, streamLength)
//     .then(
//         ()=>{
//             return res.status(200).send(`${url}?${Date.now()}`);
//         }
//     ).catch(
//         (err)=>{
//         if(err) {
//             return res.status(500).json({message:'Some error occured when uploading photo'});
//         }
//     })
//     });