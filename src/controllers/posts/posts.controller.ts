import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../../models/posts/Posts.schema";
import UserPost from "../../models/posts/UserPosts.schema";
import Likes from "../../models/posts/Likes.schema";
import Comments from "../../models/posts/Comments.schema";
import Grouppost from "../../models/groups/Groupposts.schema";
import multer from "multer";
import { azureUploader } from "../../middlewares/azure.middleware";


interface TypedPostsBody<T> extends Request {
  body: T;
}

interface UploaderArgs {
  containerName: string;
  userId: string;
  postId?: string;
  isAvatar?:boolean;
  isPersonalPost?:boolean;
  isGroupPosts?:boolean;
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

const userpost_container_name = process.env.AZURE_USER_POSTS_CONTAINER_NAME!;


const createPost = async (req: Request, res: Response) => {
  // try {
    const inMemoryStorage = multer.memoryStorage();
    const uploadStrategy = multer({ storage: inMemoryStorage }).single('image')(req,res, async(err)=>{
    const userid = res.locals.user;

    if (!req.body.title) {
      return res
        .status(400)
        .send("Empty post is like empty stomach, hurts to see one!");
    }

    const newPost = await Post.create({
      title:req.body.title,
      brief:req.body.brief,
      recipe: req.body.description,
      image:'',
      comments: '',
      shares: '',
    });

    try{
    const imageUrl = await azureUploader(req, res, {
      containerName: userpost_container_name,
      userId: userid,
      isPersonalPost: true,
    });
    const post = await newPost.updateOne({
      image:imageUrl,
    });
    const userpost = await UserPost.create({
      userid: userid,
      postid: newPost._id,
    });

    console.log(post);
    console.log('user info for post-------------->', userpost)

    const likes = await Likes.create({
      postid:newPost._id});

      return res.status(200).send('successful')
  }catch(e){
    await newPost.delete();
    console.log(e);
    return res.status(500).json({message:'something went wrong!'})
  }

    

    

    
    


    
    
    
    })
    
    // console.log(image);

    

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
