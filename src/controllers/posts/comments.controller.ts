import {Request, Response} from 'express';
import mongoose from 'mongoose';


import Comments from '../../models/posts/Comments.schema';
import Post from '../../models/posts/Posts.schema';
import User from '../../models/Signup.schema';


interface TypedRequestBody<T> extends Response {
    body: T
}


interface comments{
    postid:mongoose.Schema.Types.ObjectId,
    userid:mongoose.Schema.Types.ObjectId,
    mention?:string,
    comment:string,
}




const createComment = async(req:TypedRequestBody<comments>, res:Response)=>{

    try {        
    const {postid, comment,mention} = req.body;

    if(!(postid&&comment)){
        return res.status(400).send('Comment or postid cant be empty!');
    }

    const userid = res.locals.user;

    const post = await Post.findById(postid);
    if(!post){
        return res.status(400).send("Cannot comment, post doesn't exist!");
    }

    const user = await User.findById(userid);
    const username = user?.username;

        const post_comment = await Comments.create({
            postid:postid,
            userid:userid,
            mention:mention,
            username:username,
            comment:comment        
        })
        return res.status(200).send(post_comment);

    } catch (error) {
        return res.status(500).send(error);
    }
}



const updateComment = async(req:TypedRequestBody<{commentid:string, comment:string}>, res:Response)=>{

    try {
        const {commentid, comment} = req.body;

        // const comment = await Comments.findById(commentid)

        // if(!comment){
        //     return res.status(404).send('Comment doest not exist!');
        // }

        const updated_comment = await Comments.findByIdAndUpdate(commentid,{
            comment:comment},{new:true});
            
        return res.status(200).send(updated_comment);

    } catch (error) {
        return res.status(500).send(error);        
    }
}


const getAllComments = async(req:TypedRequestBody<{postid:mongoose.Schema.Types.ObjectId}>, res:Response)=>{
    try {
            const {postid} = req.body;

            const id = {postid:postid};

            const all_comments = await Comments.find(id);

            return res.status(200).send(all_comments);
    } catch (error) {
        return res.status(500).send(error);
    }
}


const deleteComment = async(req:TypedRequestBody<{commentid:mongoose.Schema.Types.ObjectId}>, res:Response)=>{
    try {
            const {commentid} = req.body;

            const authorid = res.locals.user;

            const id = commentid;

        const comment = await Comments.findById(id);

            const is_author = comment?.userid.valueOf();
            // console.log(is_author);
            // console.log(authorid);

            if(authorid !==is_author){
                return res.status(401).send('You cant delete this post!');
            }else{

           
            const deleted_comment = await Comments.findByIdAndDelete(id);

            return res.status(200).send(deleted_comment);
        }

    } catch (error) {
        return res.status(500).send(error);
    }
}





export default {createComment, updateComment, getAllComments, deleteComment};