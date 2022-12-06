var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getLike } from "../database/database.js";
import { ObjectId } from 'mongodb';
/*
1. 유저가 해당 post를 좋아요 누른 기록이 없을 경우
- 새로운 document 생성
2. 유저가 해당 post를 좋아요 누른 기록이 있을 경우
- 해당 document의 isLike를 반대로 설정
*/
export function getIsLike(jobPostId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return getLike()
            .findOne({ jobPostId, userId: new ObjectId(userId) })
            .then((data) => {
            if (data) {
                return data.isLike;
            }
            else {
                return false;
            }
        });
    });
}
export function updateJobPostLike(jobPost, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return getLike().findOneAndUpdate({ jobPostId: jobPost.jobPostId, userId }, { $set: jobPost }, { upsert: true })
            .then((data) => {
            if (data.lastErrorObject.updatedExisting) {
                return data.value.isLike;
            }
            else {
                return true;
            }
        });
    });
}
export function getLikedList(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return getLike().find({ userId,
            isLike: true })
            .toArray()
            .then(mapOptionalLike);
    });
}
function mapOptionalLike(data) {
    return data.map((value, index) => {
        data[index]._id = data[index].jobPostId;
        return data[index];
    });
}
//# sourceMappingURL=likedJobPost.js.map