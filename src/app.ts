import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import jobRouter from './router/jobs.js';
import authRouter from './router/auth.js';
import locationRouter from './router/location.js';
import {config} from './config.js';
import 'express-async-errors'; //비동기 처리함수를 가장 마지막 error처리하는 middleware로 전달하기위한 라이브러리
import {connectDB} from './database/database.js';
import {connectRedis} from './database/redis.js';

const app = express();
const whitelist:string[] = ['http://localhost:3000'];
const blacklist:string[] = ['http://172.21.160.1:3000'];
const corsOption = {
    origin: (requestOrigin:string | undefined, callback : (error:null, origin:boolean)=>void)=>{ 
        // 요청 ip가 blacklist에 존재하지 않으면(index 못찾음->-1반환) white
        var isWhitelisted = blacklist.indexOf(requestOrigin as string) === -1;
        callback(null, isWhitelisted); 
    },
    optionsSuccessStatus: 200,
    credentials: true, // allow the Access-Control-Allow-Credentials
};
const version = '1';
app.use(cors(corsOption));
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));

app.use('/auth', authRouter);
app.use('/location', locationRouter);
app.use('/jobs',jobRouter);

app.post('/test',(req : Request,res: Response)=>{
    const time = req.body.time;
    const result = parseInt(time.split(':')[0]);
    res.json(result);
})
app.get('/', (req : Request,res: Response, next: NextFunction)=>{
    res.send(`<html>
    <body>
        <h1 style="color:#FF7E36;text-align: center;margin-top: 100px;"> Welcome to Danngn-Job Project!</h1>
        <h3 style="color:#FF7E36;text-align: center;margin-top: 100px;"> Nodejs Project -> Github -> AWS -> Code Fix</h1>
    </body>
   </html>`);
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
    app.listen(config.host.port, ()=>{
        console.log(`[Version ${version}]: listening on port ${config.host.port}`);
    });
})
.catch(console.error);
