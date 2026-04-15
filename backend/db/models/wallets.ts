import { ObjectId } from "mongodb";

export interface Wallet {
    mnemonic: string [],
    address: string, // Base64 address
    addressPublic: string,
    publicKey: string,
    privateKey: string,
    _id?: ObjectId
}