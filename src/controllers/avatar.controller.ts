import { Request, Response } from "express";
import UserProfile from "../models/Userprofile.schema";

import { azureUploader } from "../middlewares/azure.middleware";

const container_name = process.env.AZURE_USER_PROFILE_CONTAINER_NAME!;

interface UploaderArgs {
  containerName: string;
  userId: string;
  isAvatar:boolean;
}

interface userprofile{
    fullname: string,
    birthdate: Date,
    profilepic:string
  
  }

const uploadAvatar = async (req: Request, res: Response) => {
  const userid = res.locals.user;
  if (!userid) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  const uploaderArgs: UploaderArgs = {
    containerName: container_name,
    userId: userid,
    isAvatar:true,
  };

  const id = {userid:userid};

  try {
    const response = await azureUploader(req, res, uploaderArgs);
    const userprofile: userprofile | any = await UserProfile.findOneAndUpdate(id,{profilepic:response},{new:true})
    return res.status(200).send(response);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Some error occured when uploading photo" });
  }
};

export { uploadAvatar };
