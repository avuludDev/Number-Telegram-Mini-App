export const separateTonAddress = (address) => `${address.slice(0, 4)}...${address.slice(-4)}`;

export const calculateUsdtAmount = (usdCents) => BigInt(usdCents * 10000);

export const calculateUsdFromUsdt = (usdtAmount) => Math.round((Number(usdtAmount) / 1000000) * 100) / 100;

export const isUUID = (uuid) => uuid.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$') !== null;

export const generateReferralCode = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let referralCode = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }
  return referralCode;
}


export async function wait(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export async function retry(fn, options) {
  let lastError;
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Error) {
        lastError = e;
      }
      await wait(options.delay);
    }
  }
  throw lastError;
}


