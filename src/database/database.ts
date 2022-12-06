import {config} from '../config.js';
import MongoDB, { Collection, Db } from 'mongodb';
import { Job } from '../types/jobs.js';
import { KoreaLocation, Location } from '../types/location.js';
import { User } from '../types/auth.js';
import { JobPostLike } from '../types/likedJobPost.js';

let db: Db;
export async function connectDB(){
    return MongoDB.MongoClient.connect(config.db.host)
    .then((client) =>{
        db = client.db('carrot-job');
    });
}

export function getUsers(){
    return db.collection<User>('users');
}
export function getLocations(){
    return db.collection<KoreaLocation>('location');
}
export function getJobs(){
    return db.collection<Job>('jobs');
}
export function getLike(){
    return db.collection<JobPostLike>('like');
}