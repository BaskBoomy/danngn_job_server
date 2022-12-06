import { getUsers } from "../database/database.js";
import {ObjectId} from 'mongodb';
import { User } from "../types/auth.js";
import { Document } from "mongodb";

export async function findByPhoneNumber(phoneNumber:string):Promise<User>{
    return getUsers()
    .findOne({phoneNumber})
    .then((data)=>mapOptionalUser(data as User));
}

export async function createUser(user:User):Promise<string>{
    return getUsers()
    .insertOne(user)
    .then((data:Document)=>{
        return data.insertedId!.toString();
    })
}

export async function findById(id:string):Promise<User|undefined>{
    return getUsers()
    .findOne({_id:new ObjectId(id)})
    .then((data)=>mapOptionalUser(data as User));
}

export async function update(id:string,updateData:User):Promise<User>{
    return getUsers()
        .findOneAndUpdate(
            {_id: new ObjectId(id)},
            {$set:updateData},
            {returnDocument: 'after'}
        )
        .then((data:any) =>mapOptionalUser(data.value));
}

function mapOptionalUser(data:User):User{
    return data ? {...data, id: data._id as unknown as string} : data;
}