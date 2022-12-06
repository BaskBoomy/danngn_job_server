import { Request, Response } from 'express';
import { Document } from 'mongodb';
import * as jobRepository from '../data/jobs.js';
import { getJobs } from "../database/database.js";

export async function createJob(req: Request, res: Response): Promise<void> {
    const job = req.body.job;
    try {
        const jobId = await jobRepository.createJob(job);
        res.status(201).json(jobId);
    } catch (e) {
        console.log(e)
    }
}

export async function getJobslist(req: Request, res: Response): Promise<void> {
    const jobs = await jobRepository.getJobslist();
    res.status(200).json(jobs);
}

export async function getJobById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const job = await jobRepository.getJobById(id);

    if (job) {
        res.status(200).json(job);
    } else {
        res.status(404).json({ message: `job Id:${id} not found` });
    }
}

export async function search(req: Request, res: Response): Promise<void> {
    const searchType:string = req.body.searchType;

    //조건이 존재하지 않을 경우
    if (Object.keys(searchType).length <= 0) {
        const jobs = await jobRepository.getJobslist();
        res.status(200).json(jobs);
    } else {
        //Atlas Query
        const query = jobRepository.getSearchSetting(searchType);
        const pipeline = [
            {
                "$search": {
                    "index": "searchJobs",
                    "compound": {
                        "must": query
                    }
                }
            }
        ]

        //Get Result
        await getJobs()
            .aggregate(pipeline)
            .toArray()
            .then((result:Document) => {
                res.status(200).json(result);
            })
            .catch((err:any) => {
                console.log(err);
            })
    }
}