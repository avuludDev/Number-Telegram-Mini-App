import { ObjectId } from "mongodb";
import { Refferal } from "./refferals";

export interface User {
    username: string,
    tgId: number,
    locale: string,
    wallet_address: string,
    balance: number,
    refferalCode: string[],
    refferals:  {[tgId: number]: Refferal} ,
    refferedBy: string | null,
    _id?: ObjectId
}