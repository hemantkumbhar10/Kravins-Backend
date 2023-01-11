import {Request,Response, NextFunction } from 'express';
import auth from '../auth/auth.controller';
const verifyToken = require('../auth/auth.middleware');



module.exports = function(app:any) {
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

  app.post('/signup', auth.signup);

  app.post('/login', auth.signin);
  
  app.post('/logout', verifyToken, auth.signout);
  app.post('/requestpasswordreset', auth.requestPasswordUpdate);
  app.put('/resetpassword', auth.forgotpassword);
};

