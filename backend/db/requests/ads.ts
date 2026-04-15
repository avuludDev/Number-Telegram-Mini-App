import { Db, Collection, MongoClient, ServerSession, ClientSession } from "mongodb";
import { User } from "../models/user";
import { status, Transaction } from "../models/transactions";
import { INVOICE_WALLET_ADDRESS, orderId, txPayload } from "../../ton/generateTx";
import { Address } from "ton";
import { findTransactionWithPayload } from "../../ton/confirmTx";
import { UserInstance } from "./user";
import { Click } from "../models/ads";

export class AdsInstance {
    database: Db;
    collection: Collection<Click>;
    client: MongoClient;

    constructor(client: MongoClient) {
        this.database = client.db("Numbers");
        this.collection = this.database.collection("clicks");
        this.client = client;
    }

    async addClick(clickId: string, userId: number, status: string) {
        const click: Click = {
            clickId,
            userId,
            status,
            timestamp: Date.now()
        }
        const result = await this.collection.insertOne(click);
        return result;
    }

    async getClick(userId: number) {
        return (await this.collection.findOne({userId}))?.clickId;
    }

      
}