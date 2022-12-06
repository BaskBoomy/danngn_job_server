import { ObjectId } from "mongodb";
import { Image, JobOfferer, Place } from "./jobs";

export type JobPostLike = {
    _id?:ObjectId|string;
    jobPostId:string;
    userId?:ObjectId;
    title:string;
    place:Place;
    updatedFromUser:boolean;
    salary:'월급'|'시급'|'일급'|'건당';
    pay:number;
    date:string;
    time:string;
    images:Array<Image>;
    isLike:boolean;
}
