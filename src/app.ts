import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import postRouter from './router/jobs.js';
import authRouter from './router/auth.js';
import locationRouter from './router/location.js';
import {config} from './config.js';
import 'express-async-errors'; //비동기 처리함수를 가장 마지막 error처리하는 middleware로 전달하기위한 라이브러리
import {connectDB} from './database/database.js';
import {connectRedis} from './database/redis.js';

const app = express();
const corsOption = {
    origin: config.cors.allowedOrigin,
    optionsSuccessStatus: 200,
    credentials: true, // allow the Access-Control-Allow-Credentials
};
app.use(cors(corsOption));
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));

app.use('/auth', authRouter);
app.use('/location', locationRouter);
app.use('/jobs',postRouter);

app.post('/test',(req : Request,res: Response)=>{
    const time = req.body.time;
    const result = parseInt(time.split(':')[0]);
    res.json(result);
})
app.get('/', (req : Request,res: Response, next: NextFunction)=>{
    res.send('Welcome to Carrot-Job Project.');
})

app.use((req : Request,res: Response, next: NextFunction)=>{
    res.status(404).send('Not available!!');
})
app.use((error: ErrorRequestHandler, req : Request,res: Response, next: NextFunction)=>{
    console.error(error);
    res.status(500).json({message: 'Error!!'});
})

connectDB().then(db=>{
    console.log('DB에 연결되었습니다.');
    connectRedis();
    app.listen(config.host.port);
})
.catch(console.error);