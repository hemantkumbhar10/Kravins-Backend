import {Request,Response, NextFunction } from 'express';
import { Application } from 'express';
import csrf from 'csurf';



module.exports = function(app:Application) {
const csrfProtection= csrf({cookie:{httpOnly:true}})
  app.use(function(req:Request, res:Response, next:NextFunction) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    res.header(
      "Content-Type",
      "application/json"
    );
    next();
  });
  
  app.get('/api/csrf-prot',(req:Request, res:Response)=>{
    app.use(csrfProtection);
    res.json({csrfToken:req.csrfToken()});
})

};

