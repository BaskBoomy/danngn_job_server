var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import crypto from 'crypto';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import * as userRepository from '../data/auth.js';
import * as likedJobPostRepository from '../data/likedJobPost.js';
import * as Redis from '../database/redis.js';
export function signUp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { myPlace, phoneNumber, image, nickName } = req.body;
        const found = yield userRepository.findByPhoneNumber(phoneNumber);
        if (found) {
            res.json({ message: `${phoneNumber}로 등록된 사용자가 이미 존재합니다.` });
        }
        else {
            const userId = yield userRepository.createUser({
                myPlace, phoneNumber, image, nickName
            });
            const user = { userId, myPlace, phoneNumber, image, nickName };
            console.log(user);
            const token = createJwtToken(userId);
            setToken(res, token);
            res.status(201).json({ user, token });
        }
    });
}
export function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { phoneNumber } = req.body;
        const user = yield userRepository.findByPhoneNumber(phoneNumber);
        if (!user) {
            res.json({ message: '등록되지 않은 사용자입니다.' });
        }
        else {
            const token = createJwtToken(user.id);
            setToken(res, token);
            res.status(200).json({ user, token });
        }
    });
}
export function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.cookie('token', '');
        res.status(200).json({ message: '로그아웃 성공!' });
    });
}
export function me(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userRepository.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: '사용자를 찾을 수 없습니다!' });
        }
        else {
            res.status(200).json(user);
        }
    });
}
export function update(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield userRepository.findById(req.userId);
            const updateData = req.body.updateData;
            if (!user) {
                res.status(404).json({ message: '사용자를 찾을 수 없습니다!' });
            }
            else {
                const updated = yield userRepository.update(req.userId, updateData);
                res.status(200).json(updated);
            }
        }
        catch (e) {
            console.log(e);
        }
    });
}
export function sendSMSCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const to = req.body.number.replace(/-/g, "");
        const code = create6DigitCode();
        yield saveAuthCode(`sms-code-${to}`, code)
            .then(() => __awaiter(this, void 0, void 0, function* () {
            console.log(code);
            return res.status(200).send({ result: 200 });
            // const result = await sendMessage(to, code);
            // if (result) {
            //     return res.status(200).send({ message: "문자 발송 완료", result:200 });
            // } else {
            //     return res.status(500).send({ message: "문자 발송 실패", result:500 });
            // }
        }));
    });
}
export function verifySMSCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = req.body.code;
        const to = req.body.to.replace(/-/g, "");
        const result = yield compareAuthCode(`sms-code-${to}`, code.toString());
        if (result) {
            res.status(200).send({ message: "확인 완료", result: 200 });
        }
        else {
            res.status(203).send({ message: "번호가 일치하지 않습니다.", result: 203 });
        }
    });
}
export function getCurrentJobPostLikeStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const jobPostId = req.query.jobPostId;
        const userId = req.userId;
        const isLike = yield likedJobPostRepository.getIsLike(jobPostId, userId);
        res.status(200).json(isLike);
    });
}
export function updateJobPostLike(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const jobPost = req.body.jobPost;
        const newJobPost = {
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
        };
        const userId = req.userId;
        const result = yield likedJobPostRepository.updateJobPostLike(newJobPost, userId);
        res.status(200).json(result);
    });
}
export function getLikedList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        const result = yield likedJobPostRepository.getLikedList(userId);
        if (result) {
            res.status(200).json(result);
        }
    });
}
//6자리 random 숫자 생성
const create6DigitCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code + "";
};
// redis에 key-value 형태로 저장 : 3분후에 exprire
const saveAuthCode = (key, code) => __awaiter(void 0, void 0, void 0, function* () {
    yield Redis.setKey(key, code);
});
const compareAuthCode = (key, code) => __awaiter(void 0, void 0, void 0, function* () {
    const value = yield Redis.getValue(key);
    if (code == value) {
        yield Redis.deleteKey(key);
        return true;
    }
    else {
        return false;
    }
});
const makeSignature = (signature) => {
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
};
const sendMessage = (to, code) => __awaiter(void 0, void 0, void 0, function* () {
    const SERVICE_ID = config.naverCloud.serviceId;
    const signatureParams = {
        method: 'POST',
        url: `/sms/v2/services/${SERVICE_ID}/messages`,
        timestamp: Date.now() + "",
        ACCESS_KEY: config.naverCloud.accessKey,
        SECRET_KEY: config.naverCloud.secretKey,
    };
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
    const response = yield fetch(`https://sens.apigw.ntruss.com/sms/v2/services/${SERVICE_ID}/messages`, {
        method: signatureParams.method,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-ncp-apigw-timestamp": signatureParams.timestamp,
            "x-ncp-iam-access-key": signatureParams.ACCESS_KEY,
            "x-ncp-apigw-signature-v2": signature,
        },
        body: body,
    });
    if (!response.ok) {
        throw new Error('Sending Message Error');
    }
    const result = yield response.json();
    if (result.statusCode === "202") {
        console.info("문자 전송 성공");
        return true;
    }
    else {
        console.error("문자 전송 실패");
        return false;
    }
});
function createJwtToken(id) {
    return jwt.sign({ id }, config.jwt.secretKey, { expiresIn: config.jwt.expiresInSec });
}
function setToken(res, token) {
    const options = {
        maxAge: config.jwt.expiresInSec * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true
    };
    res.cookie('token', token, options);
}
//# sourceMappingURL=auth.js.map