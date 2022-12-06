import { ObjectId } from "mongodb";

export type KoreaLocation = {
    _id: ObjectId;
    SERIAL: string;
    ADMCD: string;
    ADMNM: string;
    X: string;
    Y: string;
} 
export type Location = {
    X: string;
    Y: string;
    address: string;
    currentX: number;
    currentY: number;
    directDistance?:number;
}