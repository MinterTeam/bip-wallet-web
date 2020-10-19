import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import MinterApi from "minter-js-sdk/src/api";
import PostTx from 'minter-js-sdk/src/api/post-tx';
// import GetCoinInfoById from 'minter-js-sdk/src/api/get-coin-info-by-id.js';
import EstimateCoinSell from 'minter-js-sdk/src/api/estimate-coin-sell';
import EstimateCoinBuy from 'minter-js-sdk/src/api/estimate-coin-buy';
import {ReplaceCoinSymbol, ReplaceCoinSymbolByPath} from 'minter-js-sdk/src/api/replace-coin.js';
import {GATE_API_URL, CHAIN_ID} from '~/assets/variables';

const minterApi = new MinterApi({
    apiType: 'gate',
    baseURL: GATE_API_URL,
    chainId: CHAIN_ID,
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});

export const postTx = PostTx(minterApi);

// export const getCoinInfoById = GetCoinInfoById(minterApi);

const estimateCache = new Cache({maxAge: 1 * 60 * 1000});
export const estimateCoinSell = (params, axiosOptions) => EstimateCoinSell(minterApi)(params, {...axiosOptions, cache: estimateCache});
export const estimateCoinBuy = (params, axiosOptions) => EstimateCoinBuy(minterApi)(params, {...axiosOptions, cache: estimateCache});

export const replaceCoinSymbol = ReplaceCoinSymbol(minterApi);
export const replaceCoinSymbolByPath = ReplaceCoinSymbolByPath(minterApi);


