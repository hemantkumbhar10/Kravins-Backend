import mongoose from 'mongoose';

const uri:any = process.env.MONGO_URI;


async function main(){
    await mongoose.connect(uri);
    console.log("Kravin' locked and loaded all the food");
};

main().catch((err:Error)=>{
    console.log(err);
});