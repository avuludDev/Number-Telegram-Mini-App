import { getHttpEndpoint } from "@orbs-network/ton-access";
import { truncateSync } from "fs";
import { Address, Slice, TonClient, Transaction } from "ton";



async function getRecentTransactions(address: string): Promise<Transaction[]> {
  try {
    const endpoint = await getHttpEndpoint();
    const tonClient = new TonClient({ endpoint: endpoint });
    const transactions = await tonClient.getTransactions(Address.parse(address), { limit: 20 })
    return transactions;
  } catch (e) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return await getRecentTransactions(address);
  }
}

async function getHashTransaction(address: string, hash: string, lt: string) {
  const endpoint = await getHttpEndpoint();
  const tonClient = new TonClient({ endpoint: endpoint });
  const transaction = await tonClient.getTransactions(Address.parse(address), { limit: 1, lt })


  return transaction;
}

export async function findTransactionWithPayload(walletAddress: string, targetPayload: string) {
  const transactions = await getRecentTransactions(walletAddress);
  for (let i = 0; i < transactions.length; i++) {
    try {
      const tx = transactions[i] as any;
      const payload = transactions[i].inMessage?.body.beginParse().loadStringRefTail().toString(); // Adjust decoding as needed
      if (payload && (targetPayload.includes(payload) || payload.includes(targetPayload))) {
        console.log(transactions[i].hash().toString('hex'))
        if (tx.description.destroyed) {
          console.log("Transaction destroyed", tx);
          return 'Cancel';
        }
        const txHash = tx.hash().toString('hex');
        return (txHash);
      }
    } catch (error) {
      continue;
    }
  }
  return false;
}