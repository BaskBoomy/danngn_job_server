import { ObjectId } from "mongodb";
import { Image } from "./jobs";
import { Location } from "./location";
import { Document } from "mongodb";


export interface User extends Document {
    myPlace:Location;
    phoneNumber:string;
    image:Image;
    nickName:string;
    insertedId?:ObjectId;
    _id?:ObjectId;
    id?:string;
    borndate?: string; //생년
    gender?: string; //성별
    name?: string; //이름
    selfIntroduction?: string; //자기소개
    careers? : object;
}
export type Signature = {
    method:string;
    url:string; 
    timestamp:string; 
    ACCESS_KEY:string; 
    SECRET_KEY:string;
}

export type JSONResult = {
    statusCode: string;
}