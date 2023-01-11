import { Request, Response, NextFunction } from "express";
const verifyToken = require("../../auth/auth.middleware");
import commentsController from "../../controllers/posts/comments.controller";

module.exports = function (app: any) {
  app.use(function (req: Request, res: Response, next: NextFunction) {
    res.header(
      "Access-Control-Allow_Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    res.header("Content-Type", "application/json");
    next();
  });

  app.post('/comment', verifyToken, commentsController.createComment);
  app.put('/comment', verifyToken, commentsController.updateComment);
  app.get('/comment', commentsController.getAllComments);
  app.delete('/comment', verifyToken, commentsController.deleteComment)
};
