import { Address, toNano } from "ton";
import { randomUUID } from "crypto";


export const USDT_MASTER_ADDRESS = Address.parse(
    "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"
);
export const INVOICE_WALLET_ADDRESS = Address.parse(
    "UQAO0AE5VZeyKIn0E5jcieSAaX2jpOHKhT4vfMAij81dSh3c"
);
export const JETTON_TRANSFER_GAS_FEES = toNano("0.038");

export type orderId = `${string}-${string}-${string}-${string}-${string}`


export interface txPayload {
    fwdAmount: number,
    comment: orderId,
    jettonAmount: number,
    toAddress: string,
    value: number
}

export const generateTx = (value: number, deposit: boolean, to: string): txPayload => {
    if(!deposit){
        return {
            fwdAmount: 1,
            comment: randomUUID(),
            jettonAmount: value*10**6,
            toAddress: Address.parse(to).toString(),
            value: Number(JETTON_TRANSFER_GAS_FEES)
        }
    }
    return {
        fwdAmount: 1,
        comment: randomUUID(),
        jettonAmount: value,
        toAddress: Address.parse(to).toString(),
        value: Number(JETTON_TRANSFER_GAS_FEES)
    }
}
