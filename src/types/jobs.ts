import { ObjectId } from "mongodb";


export type Image = {
    fileURL:string;
    public_id:string;
}
export type Place = {
    zoncode:string;
    address:string;
    jibunAddress:string;
    dong:string;
    x:number;
    y:number;
}
export type JobOfferer={
    _id: string;
    myplace: Location;
    phoneNumber:string;
    image: Image;
    nickname:string;
    id:string;
}
export type Job = {
    _id?:ObjectId|string;
    id?:string;
    insertedId?:ObjectId;
    title:string;
    place:Place;
    updatedFromUser:boolean;
    salary:'월급'|'시급'|'일급'|'건당';
    pay:number;
    date:string;
    time:string;
    images:Array<Image>;
    detailcontent:string;
    workCategory:string[];
    jobOfferer:JobOfferer;
    isShortJob:boolean;
}

export type Time = [
    {
        range:{
            path:string;
            gte:string;
        }
    },
    {
        range:{
            path:string;
            lte:string;
        }
    }
]