import {Request,Response, NextFunction } from 'express';
import auth from '../auth/auth.controller';
const verifyToken = require('../auth/auth.middleware');



module.exports = function(app:any) {
  app.use(function(req:Request, res:Response, next:NextFunction) {
    res.header(
      "Access-Control-Allow-Headers",
      "X-Access-Token, Origin, Content-Type, Accept"
    );
    res.header(
      "Content-Type",
      "application/json"
    );
    res.header(
      "Access-Control-Allow-Credentials",
      "true"
    );
    next();
  });

  app.post('/signup', auth.signup);

  app.post('/login', auth.signin);
  
  app.post('*logout', auth.signout);
  app.post('/requestpasswordreset', auth.requestPasswordUpdate);
  app.put('/resetpassword', auth.forgotpassword);
};

