var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getLocations } from "../database/database.js";
import { convertGRSToWGS, getNearAddressByCoordinate } from "../data/location.js";
export function getNearAddress(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const x = req.query.x;
        const y = req.query.y;
        const result = yield getNearAddressByCoordinate(x, y);
        res.status(200).json(result);
    });
}
export function search(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = req.query.searchText ? req.query.searchText : ' ';
        const pipeline = [
            {
                $search: {
                    "index": "location",
                    "autocomplete": {
                        "query": query,
                        "path": "ADMNM"
                    }
                }
            }
        ];
        yield getLocations()
            .aggregate(pipeline)
            .toArray()
            .then((data) => {
            res.status(200).json(mapOptionalLocation(data));
        });
    });
}
function mapOptionalLocation(data) {
    return data.map((value) => {
        const current = convertGRSToWGS(value.X, value.Y);
        return {
            X: value.X,
            Y: value.Y,
            address: value.ADMNM,
            currentX: current[0],
            currentY: current[1],
        };
    });
}
