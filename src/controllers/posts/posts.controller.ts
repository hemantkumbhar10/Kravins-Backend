import { Request, Response } from "express";
import mongoose, { model } from "mongoose";
import Post from "../../models/posts/Posts.schema";
import UserPost from "../../models/posts/UserPosts.schema";
import Likes from "../../models/posts/Likes.schema";
import Comments from "../../models/posts/Comments.schema";
import Grouppost from "../../models/groups/Groupposts.schema";
import multer from "multer";
import { azureUploader } from "../../middlewares/azure.middleware";
import UserProfile from "../../models/Userprofile.schema";
import { BlobServiceClient } from "@azure/storage-blob";


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
  groupid?:string,
}

interface updatepost {
  postid: mongoose.Schema.Types.ObjectId;
  title?:string,
  brief?:string,
  recipe?: string;
  image?: File | string;
}

const userpost_container_name = process.env.AZURE_USER_POSTS_CONTAINER_NAME!;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!


const createPost = async (req: Request, res: Response) => {
  // try {
    const inMemoryStorage = multer.memoryStorage();
    const uploadStrategy = multer({ storage: inMemoryStorage }).single('image')(req,res, async(err)=>{
    const userid = res.locals.user;

    let userprofile =  await UserProfile.findOne({userid:userid});

    let userprofileid = userprofile?.id;
    


    if (!req.body.title) {
      return res
        .status(400)
        .send("Empty post is like empty stomach, hurts to see one!");
    }

    let newPost;
    // console.log('groupid ------------>',req.body.groupid);

    if(!req.body.groupid){
      console.log('id in create mode ------------>',userprofileid);
      newPost = await Post.create({
        user_profile:userprofileid,
        title:req.body.title,
        brief:req.body.brief,
        recipe: req.body.description,
        image:'',
        comments: '',
        shares: '',
      });
    }else{
      newPost = await Post.create({
        user_profile:userprofileid,
        title:req.body.title,
        brief:req.body.brief,
        recipe: req.body.description,
        image:'',
        comments: '',
        shares: '',
        groupid:req.body.groupid,
      });
    }

    try{
    const imageUrl = await azureUploader(req, res, {
      containerName: userpost_container_name,
      userId: userid,
      isPersonalPost: true,
    });
    const post = await newPost.updateOne({
      image:imageUrl,
    });


    let UsersPosts;

    if(req.body.groupid){
      UsersPosts = await Grouppost.create({
        groupid:req.body.groupid,
        postid:post._id
        })
     }else{
     UsersPosts = await UserPost.create({
        userid: userid,
        postid: newPost._id,
      });
     }
    

    console.log(post);
    console.log('user info for post-------------->', UsersPosts)

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

  const { postid, title, brief, recipe,} = req.body;

  if(!title){
    return res.status(500).json({message:"Title cannot be empty"});
  }

  try {
    const userid = res.locals.user;
    const updatedpost = await Post.findByIdAndUpdate<posts>(
      {_id:postid,user_profile: userid},
      {$set:{
        title:title,
        brief:brief,
        recipe:recipe,
        
      }},
      { new: true }
    );

    if(!updatedpost){
      return res.status(401).send("You can't make changes to this post");
    }
    // console.log(updatedpost);

    return res.status(200).send(updatedpost);
  } catch (error) {
    console.log(error)
    return res.status(500).send(error);
  }
}

const pagination = async(req:Request, res:Response)=>{
  const page:any = req.query.page || 1;
  const per_page = 5;

  try{
  const posts = await Post.find().populate({path:'user_profile groupid', select:'fullname profilepic groupname groupimage groupowner'}).sort({createdAt:-1}).skip((page-1) * per_page).limit(per_page);
  console.log(page);
  return res.status(200).json(posts);}catch(e){
    console.log('Error in pagination----->',e);
    return res.status(500).json({message:'Some error occured'})
  }
}


const deletePost = async(req:TypedPostsBody<{postid:mongoose.Schema.Types.ObjectId}>, res:Response)=>{

  try {
    
    const {postid} = req.query;
    const userid = res.locals.user;
    if(!postid){
      return res.status(500).json({message:'Something wrong happened!'})
    }


    const deletedPost = await Post.findByIdAndDelete(
      {_id:postid, user_profile:userid},);


    const imageUrl = deletedPost?.image;
    const path = new URL(imageUrl!).pathname;
    const [containerName, ...blobNameSegments] = path.split('/').filter(segment => segment !== '');
    const blobName = blobNameSegments.join('/');
    const blobname = decodeURIComponent(blobName);

   const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(userpost_container_name);
   const blobClient = containerClient.getBlobClient(blobname);

   await blobClient.delete();
    if (!deletedPost) {
      return res.status(401).send("You can't make changes to this post");
    }

    // const deleted_comments_for_this_post = await Comments.deleteMany(cid);
    // const deleted_likes_for_this_post = await Likes.findOneAndDelete(cid);

    return res.status(200).send("Post successfully deleted");

  } catch (error) {
    console.log(error);
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





export default { createPost, getUsersAllPosts,updateUserPost,deletePost,dummyPost, pagination};
