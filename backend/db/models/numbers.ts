import { ObjectId } from "mongodb";
import { Transaction } from "./transactions";
import { User } from "./user";

export interface Numbers {
    _id?: ObjectId,
    number: number,
    closedBy: ObjectId | null,
    payoutTo: ObjectId,
}


