export const MAINNET = 'mainnet';
export const TESTNET = 'testnet';
export const NETWORK = process.env.APP_ENV === MAINNET ? MAINNET : TESTNET;
export const BASE_TITLE = 'Bip Wallet';
export const BASE_DESCRIPTION = '';
export const ACCOUNTS_API_URL = process.env.APP_ACCOUNTS_API_URL;
export const EXPLORER_HOST = process.env.APP_EXPLORER_HOST;
export const EXPLORER_API_URL = process.env.APP_EXPLORER_API_URL;
export const EXPLORER_RTM_URL = process.env.APP_EXPLORER_RTM_URL;
export const GATE_API_URL = process.env.APP_GATE_API_URL;
export const BASE_COIN = NETWORK === MAINNET ? 'BIP' : 'MNT';
export const COIN_NAME = BASE_COIN;
export const CHAIN_ID = NETWORK === MAINNET ? 1 : 2;

export const STAKE_RECALCULATE_BLOCK_COUNT = 720;
/* 3 year mainnet, 1 hour testnet */
export const LOCK_STAKE_PERIOD = NETWORK === MAINNET ? 18921600 : 2920 * 2;
