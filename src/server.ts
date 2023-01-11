import express,{Request, Response, NextFunction} from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();
// import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const verifyToken = require('./auth/auth.middleware');


const corsOptions={
    origin: process.env.CLIENT_PORT
}


const app = express();

app.use(cors());
app.use(express.json());
// app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());




app.use(function (req:Request, res:Response, next:NextFunction) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );;
    next();
})

app.get('/posts',verifyToken,(req,res)=>{
    res.status(200).send(res.locals.user)
});



//connecting to database
require('./config/db');

require('./routes/auth.routes')(app);
require('./routes/userprofile.routes')(app);
require('./routes/posts/posts.route')(app);
require('./routes/posts/likes.route')(app);
require('./routes/posts/comments.routes')(app);
require('./routes/groups/groups.routes')(app);



app.listen(process.env.CLIENT_PORT || 8082, ()=>{
    console.log("Kravin' app started");
})