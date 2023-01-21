 import {Request, Response, NextFunction, response} from 'express';

 module.exports = function(app:any){
    app.use(function(req:Request, res:Response, next:NextFunction){
        res.header(
            "Allow-Access-Allow-Headers",
            "X-Access-Token, origin, Content-Type, Accept"
        );
        next();
    });

    app.get('/csrf-token',(req:Request,res:Response)=>{
        res.json({csrfToken:req.csrfToken()});
    });
 }