import {Request,Response, NextFunction } from 'express';
const verifyToken = require('../../auth/auth.middleware');
import postsController from '../../controllers/posts/posts.controller';



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
  app.post('/mypost', verifyToken, postsController.createPost);
  app.get('/mypost', verifyToken, postsController.getUsersAllPosts);
  app.get('/pagination', verifyToken, postsController.pagination);
  app.put('/mypost', verifyToken, postsController.updateUserPost);
  app.delete('/mypost', verifyToken, postsController.deletePost);
  app.get('/dummy', verifyToken, postsController.dummyPost);

};