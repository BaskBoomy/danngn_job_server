var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getJobs } from "../database/database.js";
import { ObjectId } from 'mongodb';
export function createJob(job) {
    return __awaiter(this, void 0, void 0, function* () {
        return getJobs()
            .insertOne(job)
            .then((data) => mapOptionalJob(Object.assign(Object.assign({}, job), { _id: data.insertedId })));
    });
}
export function getJobslist() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getJobs()
            .find()
            .toArray();
    });
}
export function getJobById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getJobs()
            .findOne({ _id: new ObjectId(id) })
            .then((data) => mapOptionalJob(data));
    });
}
const types = ['isShortJob', 'place', 'workCategory', 'dates', 'time', 'text'];
export function getSearchSetting(searchType) {
    let setting = [];
    types.map(data => {
        if (data === 'time' && 'time' in searchType) {
            const query = getQuery(data.toString(), searchType[data.toString()]);
            setting.push(query[0], query[1]);
        }
        else {
            data.toString() in searchType && setting.push(getQuery(data.toString(), searchType[data.toString()]));
        }
    });
    return setting;
}
function getQuery(type, data) {
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
            };
    }
}
function mapOptionalJob(data) {
    return data ? Object.assign(Object.assign({}, data), { id: data._id }) : data;
}
function mapOptionalJobs(data) {
    return data ? data.map((value, index) => {
        data[index].id = data[index]._id;
    }) : data;
}
//# sourceMappingURL=jobs.js.map