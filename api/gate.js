import MinterApi from "minter-js-sdk/src/api";
import PostTx from 'minter-js-sdk/src/api/post-tx';
import EstimateCoinSell from 'minter-js-sdk/src/api/estimate-coin-sell';
import EstimateCoinBuy from 'minter-js-sdk/src/api/estimate-coin-buy';
import {GATE_API_URL, CHAIN_ID} from '~/assets/variables';

const minterApi = new MinterApi({apiType: 'gate', baseURL: GATE_API_URL, chainId: CHAIN_ID});

export const postTx = PostTx(minterApi);

export const estimateCoinSell = EstimateCoinSell(minterApi);

export const estimateCoinBuy = EstimateCoinBuy(minterApi);



