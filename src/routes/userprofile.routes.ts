import {Request,Response, NextFunction } from 'express';
const verifyToken = require('../auth/auth.middleware');
import userprofilecontrollers from '../controllers/userprofile.controller';
import { Application } from 'express';
import { uploadavatar } from '../middlewares/avatarUpload.middleware';
const csrfProtection = require('../auth/csrf.middleware');



module.exports = function(app:Application) {
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
  app.get('/myprofile', verifyToken, userprofilecontrollers.getUserProfile);
  // app.post('/uploadavatar', verifyToken, )
  app.patch('/myprofile', verifyToken, userprofilecontrollers.updateUserProfile);
  app.delete('/myprofile', verifyToken, userprofilecontrollers.deleteUserProfile);

};

