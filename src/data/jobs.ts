import { getJobs } from "../database/database.js";
import { InsertOneResult, ObjectId } from 'mongodb';
import { Job,Time } from "../types/jobs.js";
export async function createJob(job:Job):Promise<Job> {
    return getJobs()
        .insertOne(job)
        .then((data:InsertOneResult<Job>) => mapOptionalJob({ ...job, _id: data.insertedId }));
}

export async function getJobslist():Promise<Job[]> {
    return await getJobs()
        .find()
        .toArray();
}

export async function getJobById(id:string):Promise<Job> {
    return getJobs()
        .findOne({ _id: new ObjectId(id) })
        .then((data)=>mapOptionalJob(data!));
}

const types = ['isShortJob', 'place', 'workCategory', 'dates', 'time', 'text'];

export function getSearchSetting(searchType:any) {
    let setting:any = [];
    types.map(data => {
        if (data === 'time' && 'time' in searchType) {
            const query = getQuery(data.toString(), searchType[data.toString()]) as Time;
            setting.push(query[0], query[1]);
        } else {
            data.toString() in searchType && setting.push(getQuery(data.toString(), searchType[data.toString()]));
        }
    })
    return setting;
}

function getQuery(type:string, data:any):any {
    switch (type) {
        case 'isShortJob':
            return {
                "equals": {
                    "path": "isShortJob",
                    "value": data,
                }
            };
        case 'place':
            return {
                "text": {
                    "query": data,
                    "path": ["place.dong", "place.hname"]
                }
            };
        case 'workCategory':
            return {
                "text": {
                    "query": data,
                    "path": "workCategory"
                }
            };
        case 'dates':
            return {
                "text": {
                    "query": data,
                    "path": "dateSearch"
                }
            };
        case 'time':
            return [
                {
                    "range": {
                        "path": "startTime",
                        "gte": data.startTime
                    }
                },
                {
                    "range": {
                        "path": "endTime",
                        "lte": data.endTime
                    }
                }
            ];
        case 'text':
            return {
                "text": {
                    "query": data,
                    "path": {
                        "wildcard": "*"
                    }
                }
            }
    }
}

function mapOptionalJob(data:Job) {
    return data ? { ...data, id: data._id as unknown as string } : data;
}

function mapOptionalJobs(data:Job[]) {
    return data ? data.map((value:Job,index:number)=>{
        data[index].id = data[index]._id as string;
    }) : data;
}