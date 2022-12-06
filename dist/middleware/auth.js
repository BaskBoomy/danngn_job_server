var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from 'jsonwebtoken';
import * as userRepository from '../data/auth.js';
import { config } from '../config.js';
const AUTH_ERROR = { message: 'Authentication Error' };
export const isAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (!token) {
        return res.status(401).json(AUTH_ERROR);
    }
    jwt.verify(token, config.jwt.secretKey, (error, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            res.status(401).json(AUTH_ERROR);
        }
        else {
            const user = yield userRepository.findById(decoded.id);
            if (!user) {
                res.status(401).json(AUTH_ERROR);
            }
            else {
                req.userId = user.id;
                next();
            }
        }
    }));
});
export const authHandler = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.jwt.secretKey);
        const user = yield userRepository.findById(decoded.id);
        if (!user) {
            throw Object.assign({ status: 401 }, AUTH_ERROR);
        }
        req.userId = user.id;
        req.token = decoded;
        return true;
    }
    catch (err) {
        console.error(err);
        throw Object.assign({ status: 401 }, AUTH_ERROR);
    }
});
