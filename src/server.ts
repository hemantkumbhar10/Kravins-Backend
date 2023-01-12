import express,{Request, Response, NextFunction} from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();
// import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const verifyToken = require('./auth/auth.middleware');




const app = express();

const clien_url = `http://localhost:${process.env.CLIENT_PORT}`;

app.use(express.json());
// app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());




app.use(cors({
    origin:clien_url,
    methods:["GET","POST","PUT","DELETE","PATCH"],
    allowedHeaders:['X-Access-Token', 'Content-Type', 'Authorization']
}));




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



app.listen(process.env.BACKEND_PORT || 8082, ()=>{
    console.log("Kravin' app started");
})