var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as jobRepository from '../data/jobs.js';
import { getJobs } from "../database/database.js";
export function createJob(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const job = req.body.job;
        try {
            const jobId = yield jobRepository.createJob(job);
            res.status(201).json(jobId);
        }
        catch (e) {
            console.log(e);
        }
    });
}
export function getJobslist(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const jobs = yield jobRepository.getJobslist();
        res.status(200).json(jobs);
    });
}
export function getJobById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.params.id;
        const job = yield jobRepository.getJobById(id);
        if (job) {
            res.status(200).json(job);
        }
        else {
            res.status(404).json({ message: `job Id:${id} not found` });
        }
    });
}
export function search(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const searchType = req.body.searchType;
        //조건이 존재하지 않을 경우
        if (Object.keys(searchType).length <= 0) {
            const jobs = yield jobRepository.getJobslist();
            res.status(200).json(jobs);
        }
        else {
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
            ];
            //Get Result
            yield getJobs()
                .aggregate(pipeline)
                .toArray()
                .then((result) => {
                res.status(200).json(result);
            })
                .catch((err) => {
                console.log(err);
            });
        }
    });
}
