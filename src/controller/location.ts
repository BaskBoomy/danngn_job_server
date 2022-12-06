import { getLocations } from "../database/database.js";
import { Request, Response } from 'express';
import { convertGRSToWGS, getNearAddressByCoordinate} from "../data/location.js";
import { KoreaLocation, Location } from "../types/location.js";
import { Document } from "mongodb";


export async function getNearAddress(req: Request, res: Response): Promise<void> {
    const x = req.query.x as string;
    const y = req.query.y as string;
    const result = await getNearAddressByCoordinate(x, y);
    res.status(200).json(result);
}

export async function search(req: Request, res: Response): Promise<void> {
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
    await getLocations()
        .aggregate(pipeline)
        .toArray()
        .then((data: Document[]) => {
            res.status(200).json(mapOptionalLocation(data));
        })
}

function mapOptionalLocation(data: Document[]):Location[] {
    return data.map((value: Document):Location => {
        const current = convertGRSToWGS(value.X, value.Y);
        return {
            X: value.X,
            Y: value.Y,
            address: value.ADMNM,
            currentX: current![0],
            currentY: current![1],
        }
    })
}