import { beginCell, Address, TonClient, WalletContractV4, internal, external, storeMessage, toNano, JettonMaster, JettonWallet } from 'ton';
import { JETTON_TRANSFER_GAS_FEES, txPayload, USDT_MASTER_ADDRESS } from './generateTx';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { mnemonicToWalletKey, sha256 } from 'ton-crypto';




async function getUserJettonWalletAddress(client: TonClient, userAddress: string, jettonMasterAddress: Address) {
    const userAddressCell = beginCell().storeAddress(Address.parse(userAddress)).endCell();

    const response = await client.runMethod(jettonMasterAddress, 'get_wallet_address', [
        { type: 'slice', cell: userAddressCell },
    ]);

    return response.stack.readAddress();
}

export async function sendUSDT(payload: txPayload, mnemonic: string[]): Promise<boolean> {
    // Generate keyPair from mnemonic/secret key
    const endpoint = await getHttpEndpoint();
    const client = new TonClient({ endpoint });
    const key = await mnemonicToWalletKey(mnemonic);

    const workchain = 0; // Usually you need a workchain 0
    const wallet = WalletContractV4.create({ workchain, publicKey: key.publicKey });
    const address = wallet.address.toString({ urlSafe: true, bounceable: false, testOnly: false });
    const contract = client.open(wallet);

    const jettonMaster = client.open(
        JettonMaster.create(USDT_MASTER_ADDRESS)
    );
    const usersUsdtAddress = await jettonMaster.getWalletAddress(wallet.address);
    // creating and opening jetton wallet instance.
    // First argument (provider) will be automatically substituted in methods, which names starts with 'get' or 'send'
    const jettonWallet = client.open(
        JettonWallet.create(usersUsdtAddress)
    );
    const balanceUSDT = await jettonWallet.getBalance();

    const balance = await contract.getBalance();
    console.log({ address, balance });

    if (balance < toNano(0.01)) {
        console.log(`LOW BALANCE TON, have ${balance}`)
        return false;
    }
    if (balanceUSDT < payload.jettonAmount) {
        console.log(`LOW BALANCE USDT, need ${payload.jettonAmount}, have ${balanceUSDT}`)
        return false;
    }
    const seqno = await contract.getSeqno();

    const { init } = contract;
    const contractDeployed = await client.isContractDeployed(Address.parse(address));
    let neededInit: null | typeof init = null;

    if (init && !contractDeployed) {
        neededInit = init;
    }

    const jettonWalletAddress = await getUserJettonWalletAddress(client, address, USDT_MASTER_ADDRESS);

    const builder = beginCell()
        .storeUint(0x0f8a7ea5, 32) // opcode for transfer. 0xf8a7ea5 is used
        .storeUint(0, 64)
        .storeCoins(payload.jettonAmount) // jetton amount to transfer. Be aware of decimals. Almost all jettons has 9, but USDT has 6. More about decimals https://docs.ton.org/develop/dapps/asset-processing/metadata#jetton-metadata-attributes
        .storeAddress(Address.parse(payload.toAddress)) // jetton destination address. Use wallet address, not jetton address itself
        .storeAddress(wallet.address) // excesses address. Extra tons, sent with message, will be transferred here.
        .storeUint(0, 1) // custom payload. Empty in standard jettons
        .storeCoins(payload.fwdAmount); // notifications ton amount. In case of simple jetton transfer just 1 nanoTon is OK.

    // if comment needed, it stored as Cell ref
    if ('comment' in payload) {
        const commentPayload = beginCell()
            .storeUint(0, 32)
            .storeStringTail(payload.comment)
            .endCell();

        builder.storeBit(1);
        builder.storeRef(commentPayload);
    } else {
        builder.storeBit(0);
    }

    const internalMessage = internal({
        to: jettonWalletAddress,
        value: JETTON_TRANSFER_GAS_FEES,
        bounce: true,
        body: builder.endCell(),
    });

    const body = wallet.createTransfer({
        seqno,
        secretKey: key.secretKey,
        messages: [internalMessage],
    });

    const externalMessage = external({
        to: address,
        init: neededInit,
        body,
    });

    const externalMessageCell = beginCell().store(storeMessage(externalMessage)).endCell();

    const signedTransaction = externalMessageCell.toBoc();

    const hash = (await sha256(externalMessageCell.toBoc({ idx: false }))).toString('hex');

    console.log('hash:', hash);

    await client.sendFile(signedTransaction);

    return true;
};

