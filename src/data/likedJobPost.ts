import { getLike } from "../database/database.js";
import {ObjectId, WithId} from 'mongodb';
import { JobPostLike } from "../types/likedJobPost.js";
/*
1. 유저가 해당 post를 좋아요 누른 기록이 없을 경우
- 새로운 document 생성
2. 유저가 해당 post를 좋아요 누른 기록이 있을 경우
- 해당 document의 isLike를 반대로 설정
*/
export async function getIsLike(jobPostId:string, userId:string):Promise<boolean>{
    return getLike()
    .findOne({jobPostId,userId: new ObjectId(userId)})
    .then((data:WithId<JobPostLike> | null)=>{
        if(data){
            return data.isLike;
        }else{
            return false;
        }
    });
}
export async function updateJobPostLike(jobPost:JobPostLike,userId:ObjectId):Promise<boolean>{
    return getLike().findOneAndUpdate(
        {jobPostId:jobPost.jobPostId,userId},
        {$set:jobPost},
        {upsert:true}
    )
    .then((data:any)=>{
        if(data.lastErrorObject.updatedExisting){
            return data.value.isLike;
        }else{
            return true;
        }
    });
}

export async function getLikedList(userId:ObjectId):Promise<JobPostLike[]>{
    return getLike().find(
        {userId,
        isLike:true}
    )
    .toArray()
    .then(mapOptionalLike);
}

function mapOptionalLike(data:JobPostLike[]):JobPostLike[]{
    return data.map((value:JobPostLike, index:number):JobPostLike=>{
        data[index]._id = data[index].jobPostId;
        return data[index];
    })
}