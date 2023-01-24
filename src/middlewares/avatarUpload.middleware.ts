import { Request, Response } from "express";
import multer from "multer";


    const multerStorage = multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,"public");
        },
        filename:(req,file,cb)=>{
            console.log('mime..', file.mimetype);
            const ext = file.mimetype.split('/')[1];
            cb(null, `files/admin-${file.filename}-${Date.now()}.${ext}`);
        }
    })
    // const multerFilter = (req, file, cb) => {
    //     if (file.mimetype.split("/")[1] === "pdf") {
    //       cb(null, true);
    //     } else {
    //       cb(new Error("Not a PDF File!!"), false);
    //     }
    //   };

export const uploadavatar = multer({
    storage:multerStorage,
    fileFilter:(req,file,cb)=>{
        if(file.mimetype=='image/png' || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
            cb(null,true)
        }else{
            cb(null,false);
            return cb(new Error("Only .png .jpg and .jpeg formats are allowed"));
        }
    }
})




// const DIR = './public/';
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, DIR);
//     },
//     filename: (req, file, cb) => {
//         const fileName = file.originalname.toLowerCase().split(' ').join('-');
//         cb(null, uuidv4() + '-' + fileName)
//     }
// });
// var upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
//             cb(null, true);
//         } else {
//             cb(null, false);
//             return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
//         }
//     }
// });