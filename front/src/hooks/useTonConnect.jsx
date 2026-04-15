import {  useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import {  useTonClient } from '../context/ton-client-context';


export const useTonConnect = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const { tonClient } = useTonClient()

  const walletAddress = wallet?.account?.address ? Address.parse(wallet.account.address) : undefined;

  return {
    sender: {
      send: async (args) => {
        await tonConnectUI.sendTransaction({
          messages: [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
              payload: args.body?.toBoc()?.toString('base64'),
            },
          ],
          validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
        });
      },
      address: walletAddress,
    },

    connected: !!wallet?.account?.address,
    walletAddress: walletAddress ?? null,
    network: wallet?.account?.chain ?? null,
    tonConnectUI,
    tonClient
  };
};