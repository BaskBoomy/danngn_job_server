import crypto, { Sign } from 'crypto';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import * as userRepository from '../data/auth.js';
import * as likedJobPostRepository from '../data/likedJobPost.js';
import * as Redis from '../database/redis.js';
import { CookieOptions, Request, Response } from 'express';
import { JSONResult, RequestWithUserId, Signature } from '../types/auth.js';
import { JobPostLike } from '../types/likedJobPost.js';
import { ObjectId } from 'mongodb';

export async function signUp(req: Request, res: Response):Promise<void> {
    const { myPlace, phoneNumber, image, nickName } = req.body;
    const found = await userRepository.findByPhoneNumber(phoneNumber);
    if (found) {
        res.json({ message: `${phoneNumber}로 등록된 사용자가 이미 존재합니다.` });
    }else{
        const userId = await userRepository.createUser({
            myPlace, phoneNumber, image, nickName
        })
        const user = { userId, myPlace, phoneNumber, image, nickName };
        console.log(user);
        const token = createJwtToken(userId);
        setToken(res, token);
        res.status(201).json({ user, token });
    }
}

export async function login(req: Request, res: Response):Promise<void> {
    const { phoneNumber } = req.body;
    const user = await userRepository.findByPhoneNumber(phoneNumber);
    if (!user) {
        res.json({ message: '등록되지 않은 사용자입니다.' });
    }else{
        const token = createJwtToken(user.id!);
        setToken(res, token);
        res.status(200).json({ user, token });
    }
}

export async function logout(req: Request, res: Response):Promise<void> {
    res.cookie('token', '');
    res.status(200).json({ message: '로그아웃 성공!' });
}

export async function me(req: RequestWithUserId, res: Response):Promise<void>{
    const user = await userRepository.findById(req.userId!);
    if (!user) {
        res.status(404).json({ message: '사용자를 찾을 수 없습니다!' });
    }else{
        res.status(200).json(user);
    }
}

export async function update(req: RequestWithUserId, res: Response):Promise<void> {
    try {
        const user = await userRepository.findById(req.userId!);
        const updateData = req.body.updateData;
        if (!user) {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다!' });
        }else{
            const updated = await userRepository.update(req.userId!, updateData);
            res.status(200).json(updated);
        }
    } catch (e) {
        console.log(e);
    }
}
export async function sendSMSCode(req: Request, res: Response):Promise<void> {
    const to = req.body.number.replace(/-/g, "");
    const code = create6DigitCode();
    await saveAuthCode(`sms-code-${to}`, code)
        .then(async () => {
            // Test Code...
            // console.log(code);
            // return res.status(200).send({ result: 200 });
            const result = await sendMessage(to, code);
            if (result) {
                return res.status(200).send({ message: "문자 발송 완료", result:200 });
            } else {
                return res.status(500).send({ message: "문자 발송 실패", result:500 });
            }
        });
}

export async function verifySMSCode(req: Request, res: Response):Promise<void> {
    const code = req.body.code;
    const to = req.body.to.replace(/-/g, "");


    const result = await compareAuthCode(`sms-code-${to}`, code.toString());

    if (result) {
        res.status(200).send({ message: "확인 완료", result: 200 });
    } else {
        res.status(203).send({ message: "번호가 일치하지 않습니다.", result: 203 });
    }
}


export async function getCurrentJobPostLikeStatus(req:RequestWithUserId, res: Response):Promise<void> {
    const jobPostId = req.query.jobPostId as string;
    const userId = req.userId as string;
    const isLike = await likedJobPostRepository.getIsLike(jobPostId, userId);
    res.status(200).json(isLike);
}

export async function updateJobPostLike(req: RequestWithUserId, res: Response):Promise<void>  {
    const jobPost = req.body.jobPost;
    const newJobPost:JobPostLike = {
        jobPostId: jobPost.id,
        title: jobPost.title,
        place: jobPost.place,
        updatedFromUser: jobPost.updatedFromUser,
        salary: jobPost.salary,
        pay: jobPost.pay,
        date: jobPost.date,
        time: jobPost.time,
        images: [jobPost.images[0]],
        isLike: jobPost.isLike
    }
    const userId = req.userId as unknown as ObjectId;
    const result = await likedJobPostRepository.updateJobPostLike(newJobPost, userId);
    res.status(200).json(result);
}

export async function getLikedList(req: RequestWithUserId, res: Response):Promise<void>  {
    const userId = req.userId as unknown as ObjectId;
    const result = await likedJobPostRepository.getLikedList(userId);
    if (result) {
        res.status(200).json(result);
    }
}

//6자리 random 숫자 생성
const create6DigitCode = ():string=> {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code + "";
}

// redis에 key-value 형태로 저장 : 3분후에 exprire
const saveAuthCode = async (key:string, code:string):Promise<void> => {
    await Redis.setKey(key, code);
};

const compareAuthCode = async (key:string, code:string):Promise<boolean>=> {
    const value = await Redis.getValue(key);
    if (code == value) {
        await Redis.deleteKey(key);
        return true;
    } else {
        return false;
    }
};

const makeSignature = (signature:Signature):string => {
    var space = " ";
    var newLine = "\n";

    const hmac = crypto.createHmac('SHA256', signature.SECRET_KEY);

    hmac.update(signature.method);
    hmac.update(space);
    hmac.update(signature.url);
    hmac.update(newLine);
    hmac.update(signature.timestamp);
    hmac.update(newLine);
    hmac.update(signature.ACCESS_KEY);

    return hmac.digest('base64');
}

const sendMessage = async (to:string, code:string):Promise<boolean> => {
    const SERVICE_ID = config.naverCloud.serviceId;
    const signatureParams: Signature = {
        method: 'POST',
        url: `/sms/v2/services/${SERVICE_ID}/messages`,
        timestamp: Date.now() + "",
        ACCESS_KEY: config.naverCloud.accessKey,
        SECRET_KEY: config.naverCloud.secretKey,
    }
    const body = JSON.stringify({
        "type": "SMS",
        "contentType": "COMM",
        "countryCode": "82",
        "from": "01097735873",
        "content": "SNS Authentication by Jack's personal node js backend server project",
        "messages": [
            {
                "to": to,
                "content": `[당근알바 프로젝트] 인증번호 [${code}]를 입력해주세요.`
            }
        ]
    });
    const signature = makeSignature(signatureParams);
    const response = await fetch(
        `https://sens.apigw.ntruss.com/sms/v2/services/${SERVICE_ID}/messages`,
        {
            method: signatureParams.method,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "x-ncp-apigw-timestamp": signatureParams.timestamp,
                "x-ncp-iam-access-key": signatureParams.ACCESS_KEY,
                "x-ncp-apigw-signature-v2": signature,
            },
            body: body,
        }
    );
    
    if(!response.ok){
        throw new Error('Sending Message Error');
    }

    const result = await response.json() as JSONResult;
    
    if (result!.statusCode === "202") {
        console.info("문자 전송 성공");
        return true;
    } else {
        console.error("문자 전송 실패");
        return false;
    }
    
}

function createJwtToken(id:string):string {
    return jwt.sign({ id }, config.jwt.secretKey, { expiresIn: config.jwt.expiresInSec });
}


function setToken(res: Response, token:string):void {
    const options:CookieOptions = {
        maxAge: config.jwt.expiresInSec * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true
    }
    res.cookie('token', token, options);
}