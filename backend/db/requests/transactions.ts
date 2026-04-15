import { Db, Collection, MongoClient, ServerSession, ClientSession } from "mongodb";
import { User } from "../models/user";
import { status, Transaction } from "../models/transactions";
import { INVOICE_WALLET_ADDRESS, orderId, txPayload } from "../../ton/generateTx";
import { Address } from "ton";
import { findTransactionWithPayload } from "../../ton/confirmTx";
import { UserInstance } from "./user";

export class TransactionInstance {
    database: Db;
    collection: Collection<Transaction>;
    client: MongoClient;

    constructor(client: MongoClient) {
        this.database = client.db("Numbers");
        this.collection = this.database.collection("transactions");
        this.client = client;
    }

    async createOrder(deposit: boolean, tx: txPayload, user: User, depositAddress: string, session?: ClientSession) {
        const transaction: Transaction = {
            deposit: deposit,
            from: deposit ? user.wallet_address : depositAddress,
            to: tx.toAddress.toString(),
            userId: user._id?.toString() ?? user.tgId.toString(),
            amount: Number(tx.jettonAmount),
            orderId: tx.comment,
            status: "Create",
            timestamp: Date.now()
        }
        const result = await this.collection.insertOne(transaction,{session});
        return result;
    }

    async updateOrder(orderId: orderId, status: status, session: ClientSession,tx_hash?: string) {
        const tx = await this.getTxByOrderId(orderId, session);
        if (!tx) return;

        const result = await this.collection.updateOne(
            { orderId: orderId },
            { $set: { status: status, hash: tx_hash } },
            {session: session}
        );
        return result
    }

    async getTxByOrderId(orderId: orderId, session: ClientSession): Promise<Transaction | false> {
        const tx = await this.collection.findOne({ orderId: orderId }, {session: session});
        if (!tx) {
            return false
        }
        return tx as Transaction;
    }

    async getTxsByWalletAddress(wallet_address: string): Promise<Transaction[]> {
        const userTxsDep = await this.collection
            .find({ from: wallet_address })
            .toArray();
        const userTxsWith = await this.collection
            .find({ to: Address.parse(wallet_address).toString() })
            .toArray();
        const userTxs = userTxsDep.concat(userTxsWith);
        return userTxs.sort((a, b) => b.timestamp - a.timestamp);
    }

    async checkOrderSuccess(orderId: orderId, session: ClientSession) {
      
        try {
          const tx = await this.getTxByOrderId(orderId, session)
          console.log(`Check order: ${orderId}`);
          
          if (tx) {
    
            const confirm = await findTransactionWithPayload(tx.to, tx.orderId);
            console.log(`Result ${orderId}: ${confirm}`);
      
            if (confirm) {
              if (confirm === 'Cancel') {
                await this.updateOrder(orderId, 'Cancel', session);
                return false;
              } else {
                await this.updateOrder(orderId, 'Confirm', session, confirm.toString());
                return true;
              }
            } else {
              await this.updateOrder(orderId, 'Create', session)
            }
          }
          return false;
        } catch (error) {
          console.error(`Error in checkOrderSuccess: ${error}`);
          throw new Error(String(error));
        } 
      }
      
}