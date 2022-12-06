var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { config } from '../config.js';
import MongoDB from 'mongodb';
let db;
export function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        return MongoDB.MongoClient.connect(config.db.host)
            .then((client) => {
            db = client.db('carrot-job');
        });
    });
}
export function getUsers() {
    return db.collection('users');
}
export function getLocations() {
    return db.collection('location');
}
export function getJobs() {
    return db.collection('jobs');
}
export function getLike() {
    return db.collection('like');
}
