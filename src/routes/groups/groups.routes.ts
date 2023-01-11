import { Request,Response, NextFunction } from "express";

const verifyToken = require('../../auth/auth.middleware');
import groupsController from "../../controllers/groups/groups.controller";




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
    app.post('/mygroup', verifyToken, groupsController.createGroup);
    app.put('/mygroup', verifyToken, groupsController.updateGroup);
    app.get('/groups', groupsController.getAllGroups);
    app.get('/group', groupsController.getGroupById);
    app.delete('/deletegroup',verifyToken, groupsController.deleteGroup);
  
  };