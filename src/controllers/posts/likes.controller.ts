import { Request, Response } from "express";
import Post from "../../models/posts/Posts.schema";
import Likes from "../../models/posts/Likes.schema";

interface TypedRequestBody<T> extends Request {
  body: T;
}

interface likes {
  postid: string;
}

const updateLikes = async (req: TypedRequestBody<likes>, res: Response) => {
    try {
        
    
  const userid = res.locals.user;

  const { postid } = req.body;

  const id = { postid: postid };

  const doc_likes = await Likes.findOne(id);

  if (!doc_likes) {
    console.log(doc_likes);
    return res.status(404).send("Post does not exists");
  }else{

  const post_id_for_validation = doc_likes?.likes;

  const is_liked_already = post_id_for_validation?.includes(userid);

  if (is_liked_already) {
    const removeLike = await Likes.findOneAndUpdate(
        id,
        {
          $pull: { likes: userid },
        },
        { new: true }
      );
      const likes = removeLike?.likes.length;
      return res.status(200).send(`${likes}`);
  }else{

      
      const likeIt = await Likes.findOneAndUpdate(
          id,
          {
              $push: { likes: userid },
            },
            { new: true }
            );
            const likes = likeIt?.likes.length;
            return res.status(200).send(`${likes}`);
        }
    }
} catch (error) {
    return res.status(500).send(error);       
}
};


export default {updateLikes};