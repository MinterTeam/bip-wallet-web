export const BASE_TITLE = 'Bip Wallet';
export const BASE_DESCRIPTION = '';
export const MINTERORG_API_URL = (process.env.APP_MINTERORG_URL || 'https://my.minter.network') + '/api/v1/';
export const EXPLORER_URL = process.env.APP_EXPLORER_URL || 'https://explorer.minter.network';
export const EXPLORER_API_URL = EXPLORER_URL + '/api/v1/';
export const MINTER_URL = process.env.APP_MINTER_URL || 'https://testnet.explorer.minter.network';
export const COIN_NAME = process.env.APP_ENV === 'production' ? 'BIP' : 'MNT';
export const TX_TYPES = {
    SEND: 'send',
    SELL_COIN: 'sellCoin',
    SELL_ALL_COIN: 'sellAllCoin',
    BUY_COIN: 'buyCoin',
    CREATE_COIN: 'createCoin',
    DECLARE_CANDIDACY: 'declareCandidacy',
    DELEGATE: 'delegate',
    UNBOND: 'unbond',
    REDEEM_CHECK: 'redeemCheckData',
    SET_CANDIDATE_ONLINE: 'setCandidateOnData',
    SET_CANDIDATE_OFFLINE: 'setCandidateOffData',
};
