import { KeyPair, mnemonicToWalletKey, mnemonicNew } from "ton-crypto";
import { WalletContractV4, Address, TonClient } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

export async function generateTonWallet() {
  // Generate a new mnemonic
  const mnemonic = await mnemonicNew();

  // Derive a wallet key pair from the mnemonic
  const keyPair: KeyPair = await mnemonicToWalletKey(mnemonic);

  // Create a wallet contract instance (e.g., Wallet V3)
  const wallet = WalletContractV4.create({
    publicKey: keyPair.publicKey,
    workchain: 0, // Default workchain for wallets is 0
  });

  // Return wallet details
  return {
    mnemonic,
    address: wallet.address.toString(), // Base64 address
    addressPublic: convertAddress(wallet.address.toString()).nonBounceable,
    publicKey: keyPair.publicKey.toString("hex"),
    privateKey: keyPair.secretKey.toString("hex"),
  };
}

// async function deployWallet(mnemonic: string[]) {
//   // Step 1: Initialize TON Client
//   const endpoint = await getHttpEndpoint();
//   const tonClient = new TonClient({
//     endpoint: endpoint, // Use your preferred RPC endpoint
//   });

//   const keyPair = await mnemonicToWalletKey(mnemonic);

//   // Step 3: Create Wallet Contract
//   const wallet = WalletContractV4.create({
//     publicKey: keyPair.publicKey,
//     workchain: 0, // Typically 0 for mainnet
//   });

//   console.log('Wallet Address:', wallet.address.toString());

//   // Step 4: Fund the Wallet Address
//   // Before deploying, you need to fund the wallet with TON coins.
//   console.log(
//     `Fund this address: https://tonscan.org/address/${wallet.address.toString()}`
//   );

//   // Wait for funding...

//   // Step 5: Deploy the Wallet
//   const seqno = await wallet.getSeqno(tonClient); // Check wallet sequence number
//   console.log('Current seqno:', seqno);

//   const deploymentResult = await tonClient.sendExternalMessage(wallet, wallet.init(keyPair.secretKey));

//   console.log('Deployment result:', deploymentResult);

//   // Step 6: Confirm Deployment
//   console.log(`Wallet deployed! Check: https://tonscan.org/address/${wallet.address.toString()}`);
// }

function convertAddress(address: string): { bounceable: string; nonBounceable: string } {
  const parsedAddress = Address.parse(address);

  // Get Bounceable (user-friendly) and Non-Bounceable formats
  return {
    bounceable: parsedAddress.toString({ urlSafe: true, bounceable: true }),
    nonBounceable: parsedAddress.toString({ urlSafe: true, bounceable: false }),
  };
}


