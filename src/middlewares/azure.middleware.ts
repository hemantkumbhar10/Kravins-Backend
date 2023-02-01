import { Request, Response, NextFunction, response } from 'express';
import multer from 'multer';
import {Buffer} from 'buffer';
import { BlockBlobClient } from '@azure/storage-blob';
import intoStream from 'into-stream';



const connection_string = process.env.AZURE_STORAGE_CONNECTION_STRING!;

interface UploaderArgs{
    containerName : string,
    originalName:any,
    userId:string,
}


const getBlobName = (originalName : any, userId: string) =>{
    return `${userId}-${originalName}`;
}


const azureUploader = async(req:Request,res:Response, uploaderArgs:UploaderArgs)=>{
    const inMemoryStorage = multer.memoryStorage();
    const uploadStrategy = multer({storage:inMemoryStorage}).single('image')(req, res, async(err)=>{
        //console.log(req.file);
        const buf = req.file?.buffer!;
        const binaryBuffer = Buffer.from(buf.toString('binary'),'base64');
        const blobName=getBlobName(req.file?.originalname,uploaderArgs.userId);

        const blobService = new BlockBlobClient(connection_string, uploaderArgs.containerName, blobName);
        const blobExists = await blobService.exists();

        if(blobExists){
            await blobService.delete();
        }

        const url = blobService.url;
        const id = {userid:uploaderArgs.userId};

        const newUrl = `${url}?${Date.now()}`;

        const stream = intoStream(binaryBuffer);
        const streamlength = binaryBuffer.length;

        blobService.uploadStream(stream, streamlength).then(()=>{
            return newUrl;
        }).catch((err)=>{
            if(err){
                return err;
            }
        })
    })
}



export {azureUploader};