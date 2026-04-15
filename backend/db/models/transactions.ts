import { ObjectId } from "mongodb";
import { orderId } from "../../ton/generateTx";

export interface Transaction {
    _id?: ObjectId,
    hash?: string,
    deposit: boolean,
    from: string,
    to: string,
    userId: string,
    amount: number,
    orderId: orderId,
    status: status,
    timestamp: number
}

export type status = 'Create' | 'Pending' | 'Confirm' | 'Cancel';