import {Request, Response} from 'express';
import mongoose from 'mongoose';

import Groups from "../../models/groups/Groups.schema";
import User from '../../models/Signup.schema';



interface TypedRequestBody<T> extends Request{
    body:T
}


interface group{
    groupname:string,
    groupimage:string,
    groupbio:string,
    groupowner:string,
    ownerid:mongoose.Schema.Types.ObjectId,
    groupid?:mongoose.Schema.Types.ObjectId
}



const createGroup = async(req:TypedRequestBody<group>, res:Response)=>{
    try {

        const {groupname, groupimage, groupbio} = req.body;

        if(!(groupname || groupimage || groupbio)){
            return res.status(400).send('Bad input, all fields are required!');
        }

        const userid = res.locals.user;
        const user = await User.findById(userid);

        const username = user?.username;

        const created_group = await Groups.create({
            groupname:groupname,
            groupimage:groupimage,
            groupbio:groupbio,
            groupowner:username,
            ownerid:userid
        })

        return res.status(200).send(created_group);        
    } catch (error) {
        return res.status(500).send(error);
    }
} 


const updateGroup = async(req:TypedRequestBody<group>,res:Response)=>{
    try {
        const {groupname, groupimage, groupbio, groupid} = req.body;

        if(!(groupname || groupimage || groupbio)){
            return res.status(400).send('Bad input, all fields are required!');
        }

        const userid = res.locals.user;
        // const cid = {ownerid:userid};
        const user = await Groups.findById(groupid);

        const is_owner = user?.ownerid.valueOf();


        if(is_owner !== userid){
            return res.status(401).send('You cannot make changes to this group!');
        }

        const updated_group_data = await Groups.findByIdAndUpdate(groupid,{
            groupname:groupname,
            groupimage:groupimage,
            groupbio:groupbio,
        },{new:true})

        return res.status(200).send(updated_group_data);
    } catch (error) {
        return res.status(500).send(error);
    }

}


const getAllGroups = async(req:Request,res:Response)=>{
    try {
        const userid = res.locals.user;
    const cid = {ownerid:userid};

    const owners_all_groups = await Groups.find(cid);

    if(!owners_all_groups){
        return res.status(404).send('Owner does not have any groups');
    }

    return res.status(200).send(owners_all_groups);
    } catch (error) {
        return res.status(500).send(error);
    }
}


const getGroupById = async(req:TypedRequestBody<{groupid:mongoose.Schema.Types.ObjectId}>, res:Response)=>{
    try {

        const {groupid} = req.body;

        const get_one_group = await Groups.findById(groupid);
        if(!get_one_group){
            return res.status(404).send('No group with this id');
        }
        return res.status(200).send(get_one_group);
    } catch (error) {
        return res.status(500).send(error);
    }
}

const deleteGroup = async(req:TypedRequestBody<{groupid:mongoose.Schema.Types.ObjectId}>, res:Response)=>{
    try {

        const {groupid} = req.body;

        const userid = res.locals.user;
        // const cid = {ownerid:userid};
        const user = await Groups.findById(groupid);

        const is_owner = user?.ownerid.valueOf();


        if(is_owner !== userid){
            return res.status(401).send('You cannot make changes to this group!');
        }

        const deleted_group = await Groups.findByIdAndDelete(groupid);

        return res.status(200).send('group deleted'+ deleted_group);
    } catch (error) {
        return res.status(500).send(error);
    }
}


export default {createGroup, updateGroup, getAllGroups, getGroupById, deleteGroup};