import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import * as userRepository from '../data/auth.js';
import { config } from '../config.js';
import { NextFunction, Request, Response } from 'express';

type Error = {
    message: string;
}
type RequestData = Request & {
    userId?: string;
    token?: JwtPayload | string;
}

const AUTH_ERROR: Error = { message: 'Authentication Error' };

export const isAuth = async (req: RequestData, res: Response, next: NextFunction) => {
    // 1. Browser : Cookie가 header에 있는지 확인
    // 2. Non-Browser : Header 검사

    let token;
    // header 검사
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // header에 token이 없다면 cookie 확인
    if (!token) {
        token = req.cookies['token'];
    }

    console.log(token);
    
    if (!token) {
        return res.status(401).json(AUTH_ERROR);
    }

    jwt.verify(
        token,
        config.jwt.secretKey,
        async (error: any, decoded: any)=> {
            if (error) {
                console.log(error);                
                res.status(401).json(AUTH_ERROR);
            }else{
                const user = await userRepository.findById(decoded!.id);
                if (!user) {
                    res.status(401).json(AUTH_ERROR);
                }else{
                    req.userId = user.id;
                    next();
                }
            }
        }
    )
}

export const authHandler = async (req: RequestData) => {
    const authHeader = req.get('Authorization');
    const token = authHeader!.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.secretKey) as JwtPayload;
        const user = await userRepository.findById(decoded.id);
        if (!user) {
            throw { status: 401, ...AUTH_ERROR };
        }
        req.userId = user.id;
        req.token = decoded;
        return true;
    } catch (err) {
        console.error(err);
        throw { status: 401, ...AUTH_ERROR };
    }
}