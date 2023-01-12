import mongoose from 'mongoose';
mongoose.set('strictQuery', true);

const uri:any = process.env.MONGO_URI;


async function main(){
    try {
        await mongoose.connect(uri);
        console.log("Kravin' locked and loaded all the food");
    } catch (err) {
        console.log('Error connecting to MongoDB: ' + err);
    }
}

main();