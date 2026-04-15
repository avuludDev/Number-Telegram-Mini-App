import { ClientSession, Collection, Db, InsertOneResult, MongoClient, ObjectId, WithId } from "mongodb";
import {Wallet} from "../models/wallets";
import { generateTonWallet } from "../../ton/generateWallet";
import { txPayload } from "../../ton/generateTx";

export class WalletsInstance {
    database: Db;
    collection: Collection<Wallet>;

    constructor(client: MongoClient) {
        this.database = client.db("Wallets");
        this.collection = this.database.collection("wallets");
    }

    async createWallet() {
        const wallet: Wallet = await generateTonWallet();
        const result = await this.collection.insertOne(wallet);
        return wallet;
    }

    async getWallet() {
        const lastWallet = await this.collection.findOne({}, { sort: { _id: -1 }}, );
        return lastWallet;
    }

    async getSafeWallet() {
        let lastWallet: WithId<Wallet> | Wallet | null = await this.collection.findOne({}, { sort: { _id: -1 } });
        if(!lastWallet || lastWallet === null){
            lastWallet = await this.createWallet();
        }
        return lastWallet?.addressPublic;
    }

    async sendTransaction(payload: txPayload) {
        const sender = await this.getWallet();
        

    }
}
