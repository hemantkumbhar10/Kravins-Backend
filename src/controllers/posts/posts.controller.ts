import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../../models/posts/Posts.schema";
import UserPost from "../../models/posts/UserPosts.schema";
import Likes from "../../models/posts/Likes.schema";
import Comments from "../../models/posts/Comments.schema";
import Grouppost from "../../models/groups/Groupposts.schema";

interface TypedPostsBody<T> extends Request {
  body: T;
}

interface posts {
  title:string,
  brief:string,
  description?: string;
  image: string;
  comments: Number;
  shares: Number;
  groupid?:mongoose.Schema.Types.ObjectId,
}

interface updatepost {
  postid: mongoose.Schema.Types.ObjectId;
  title?:string,
  brief?:string,
  description?: string;
  image?: File | string;
}


const createPost = async (req: TypedPostsBody<posts>, res: Response) => {
  // try {
    const {title, brief, description, image, comments, shares, groupid} = req.body;

    const userid = res.locals.user;

    // if (!title) {
    //   return res
    //     .status(400)
    //     .send("Empty post is like empty stomach, hurts to see one!");
    // }

    console.log(image);

  //   const post = await Post.create({
  //     title:title,
  //     brief:brief,
  //     description: description,
  //     image: image,
  //     comments: comments,
  //     shares: shares,
  //   });

  //   const likes = await Likes.create({
  //     postid:post._id});

  //   const id = { userid: userid };

  //   const isPostexists = await UserPost.findOne(id);

  //   // console.log(isPostexists);

  //   let userpost;

  //   if (isPostexists === null) {
  //     userpost = await UserPost.create({
  //       userid: userid,
  //       postid: post._id,
  //     });
  //   } else {
  //     const id = isPostexists._id;
  //     userpost = await UserPost.findByIdAndUpdate(
  //       id,
  //       {
  //         $push: { postid: post._id },
  //       },
  //       { new: true }
  //     );
  //   }

  //   if(groupid){
  //     const group_post = await Grouppost.create({
  //       groupid:groupid,
  //       postid:post._id
  //     })
  //   }

  //   const userdata = [userpost, post];

  //   return res.status(200).send(userdata);
  // } catch (error) {
  //   return res.status(500).send(error);
  // }
};

const getUsersAllPosts = async (req: Request, res: Response) => {
  try {
    const userid = res.locals.user;

    const id = { userid: userid };
    const user = await UserPost.findOne(id);

    if (!user) {
      return res.status(404).send("No posts found!");
    }

    const postids = user.postid;

    const posts = await Post.find({ _id: { $in: postids } });

    const userwithpost = [user, posts];

    return res.status(200).send(userwithpost);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const updateUserPost = async (
  req: TypedPostsBody<updatepost>,
  res: Response
) => {
  try {
    const { postid, description, image } = req.body;

    const userid = res.locals.user;

    const id = { userid: userid };

    const userPosts = await UserPost.findOne(id);

    const postids = userPosts?.postid;

    const isUserValidToUpdatePost = postids?.includes(postid);

    if (!isUserValidToUpdatePost) {
      return res.status(401).send("You can't make changes to this post");
    }

    const updatedpost = await Post.findByIdAndUpdate<posts>(
      postid,
      {
        description: description,
        image: image,
      },
      { new: true }
    );

    // console.log(updatedpost);

    return res.status(200).send(updatedpost);
  } catch (error) {
    return res.status(500).send(error);
  }
}


const deletePost = async(req:TypedPostsBody<{postid:mongoose.Schema.Types.ObjectId}>, res:Response)=>{

  try {
    
    const {postid} = req.body;
    const userid = res.locals.user;

    const id = { userid: userid };

    const userPosts = await UserPost.findOne(id);

    const postids = userPosts?.postid;

    const isUserValidToUpdatePost = postids?.includes(postid);

    if (!isUserValidToUpdatePost) {
      return res.status(401).send("You can't make changes to this post");
    }

    const deletedPost = await Post.findByIdAndDelete(postid);
    const deletedDocUserPosts =  await UserPost.findOneAndUpdate(id, {$pull:{postid:postid}}, {new:true});
    const cid = {postid:postid};
    const deleted_comments_for_this_post = await Comments.deleteMany(cid);
    const deleted_likes_for_this_post = await Likes.findOneAndDelete(cid);

    return res.status(200).send("Post successfully deleted");

  } catch (error) {
    return res.status(500).send(error);
  }

}
const dummyPost = async(req:TypedPostsBody<{postid:mongoose.Schema.Types.ObjectId}>, res:Response)=>{

  try {
    return res.status(200).send("This is Protected route");

  } catch (error) {
    return res.status(500).send(error);
  }

}





export default { createPost, getUsersAllPosts,updateUserPost,deletePost,dummyPost};
