import { ObjectId } from "mongodb";
import { Transaction } from "./transactions";
import { User } from "./user";

export interface Click {
    _id?: ObjectId,
    clickId: string,
    userId: number,
    status: string,
    timestamp: number
}
