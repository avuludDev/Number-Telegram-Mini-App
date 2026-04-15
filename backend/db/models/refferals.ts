import { ObjectId } from "mongodb";

export interface Refferal {
    name: string,
    rewards: number,
    refferedBy: ObjectId
}