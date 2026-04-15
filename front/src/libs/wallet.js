import TonWeb from "tonweb";

export class Wallet {
    providerApi = 'afe3796906edbca388eccbf03e05fc85164cbecd9a6e8ab5adc0a8276b85777f'
    usdtAddress = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'

    constructor(address){
        this.wallet_address = address
        this.provider = new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {apiKey: this.providerApi})
        this.ton = new TonWeb(this.provider)
    }

    async getUSDTBalance() {
        try {
            // Get USDT wallet balance
            console.log()
            //const contract = new this.ton.Contract(this.provider, {address:this.usdtAddress});
            //const balance = await contract.methods.balanceOf(this.walletAddress);

            const jettonWallet = new TonWeb.token.jetton.JettonWallet(this.provider,{address: this.wallet_address});
            const data = await jettonWallet.getData();
            console.log('Jetton balance:', data.balance.toString());
            return data.balance.toString();
        } catch (error) {
            console.error('Error fetching USDT balance:', error);
        }
    }
}