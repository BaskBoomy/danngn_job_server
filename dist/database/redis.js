var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createClient } from 'redis';
import { config } from '../config.js';
let client;
export function connectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        client = createClient({
            legacyMode: true,
            url: `redis://${config.redis.username}:${config.redis.password}@${config.redis.host}:${config.redis.port}`,
            socket: {
                connectTimeout: 50000,
            },
        });
        client.on('error', (err) => console.log('Redis Client Error', err));
        client.connect().then(() => console.log('Redis Connected'));
    });
}
;
export function setKey(key, code) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.v4.set(key, code, { EX: 180 });
    });
}
export function getValue(key) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield client.v4.get(key);
    });
}
export function deleteKey(key) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.v4.del(key);
    });
}
export function disconnect() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.disconnect();
    });
}
