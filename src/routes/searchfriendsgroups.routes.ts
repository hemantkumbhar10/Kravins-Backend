import {Request,Response, NextFunction } from 'express';
const verifyToken = require('../auth/auth.middleware');
import userprofilecontrollers from '../controllers/userprofile.controller';
import { Application } from 'express';
import {SearchFriendsGroups} from '../controllers/SearchFriendsGroups.controller';



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
  app.get('/search', verifyToken, SearchFriendsGroups);
}; 
