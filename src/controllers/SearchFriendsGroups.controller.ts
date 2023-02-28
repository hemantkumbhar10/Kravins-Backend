import { Request, Response } from "express";
import Groups from "../models/groups/Groups.schema";
import UserProfile from "../models/Userprofile.schema";








const SearchFriendsGroups = async (req: Request, res: Response) => {

    const current_user = res.locals.user;

    const { fg_name } = req.query;

    if (!fg_name) {
        return res.status(400).json({ message: 'Input is empty!' });
    }

    try {
        const groups_found = await Groups.find({ groupname: { $regex: fg_name, $options: 'i' } });

        const users = await UserProfile.aggregate([{
            $match: {
                $or: [{ username: { $regex: fg_name, $options: 'i' } }, { fullname: { $regex: fg_name, $options: 'i' } }]
            }
        },
            {
                $lookup:{
                    from:'signups',
                    localField:'user',
                    foreignField:'_id',
                    as:'signup',
                }
            },
            {
                $group:{
                    _id:'$user',
                    username:{$first:'$signup.username'},
                    fullname:{$first:'$fullname'},
                }
            }
        ]);


        //Combine results from groups and users

        const results = {
            groups:groups_found,
            users:users.map(user=>({id:user._id,username:user.username, fullname:user.fullname}))
        }

        return res.status(200).json(results);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Server Error Occurred!' });
    }
}

export {SearchFriendsGroups};