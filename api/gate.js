import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import MinterApi from "minter-js-sdk/src/api";
import PostTx from 'minter-js-sdk/src/api/post-tx';
import EstimateCoinSell from 'minter-js-sdk/src/api/estimate-coin-sell';
import EstimateCoinSellAll from 'minter-js-sdk/src/api/estimate-coin-sell-all.js';
import EstimateCoinBuy from 'minter-js-sdk/src/api/estimate-coin-buy';
import EstimateTxCommission from 'minter-js-sdk/src/api/estimate-tx-commission.js';
import {ESTIMATE_SWAP_TYPE} from 'minter-js-sdk/src/variables.js';
import {ReplaceCoinSymbol, ReplaceCoinSymbolByPath} from 'minter-js-sdk/src/api/replace-coin.js';
import {GATE_API_URL, CHAIN_ID} from '~/assets/variables.js';
import debounceAdapter from '~/assets/axios-debounce.js';
import {getSwapEstimate as explorerGetSwapEstimate} from '~/api/explorer.js';

const adapter = (($ = axios.defaults.adapter) => {
    $ = cacheAdapterEnhancer($, { enabledByDefault: false});
    $ = debounceAdapter($, {time: 500, leading: false});
    return $;
})();

const minterApi = new MinterApi({
    apiType: 'gate',
    baseURL: GATE_API_URL,
    chainId: CHAIN_ID,
    adapter,
});

export const postTx = PostTx(minterApi);

const estimateCache = new Cache({maxAge: 5 * 1000});
const _estimateCoinSell = (params, axiosOptions) => params.sellAll
    ? EstimateCoinSellAll(minterApi)(params, {...axiosOptions, cache: estimateCache})
    : EstimateCoinSell(minterApi)(params, {...axiosOptions, cache: estimateCache});
const _estimateCoinBuy = (params, axiosOptions) => EstimateCoinBuy(minterApi)(params, {...axiosOptions, cache: estimateCache});
export function estimateCoinSell(params, axiosOptions) {
    // 0, '0', false, undefined
    if (!params.valueToSell || !Number(params.valueToSell)) {
        return Promise.reject(new Error('Value to sell not specified'));
    }
    if (params.findRoute && params.swapFrom !== ESTIMATE_SWAP_TYPE.BANCOR) {
        return explorerGetSwapEstimate(params.coinToSell, params.coinToBuy, {sellAmount: params.valueToSell, swapFrom: params.swapFrom}, {...axiosOptions, cache: estimateCache})
            .then((explorerEstimation) => {
                return Promise.all([
                    _estimateCoinSell({
                        ...params,
                        // remove first and last items, keep only intermediate items
                        route: explorerEstimation.coins?.map((coin) => coin.id).slice(1, -1),
                        swapFrom: explorerEstimation.swapType,
                    }, axiosOptions),
                    Promise.resolve(explorerEstimation.coins),
                ]);
            })
            .then(([estimateRouteData, route]) => {
                return {
                    ...estimateRouteData,
                    route,
                };
            });
    } else {
        return _estimateCoinSell(params, axiosOptions);
    }
}
export function estimateCoinBuy(params, axiosOptions) {
    // 0, '0', false, undefined
    if (!params.valueToBuy || !Number(params.valueToBuy)) {
        return Promise.reject(new Error('Value to buy not specified'));
    }
    if (params.findRoute && params.swapFrom !== ESTIMATE_SWAP_TYPE.BANCOR) {
        return explorerGetSwapEstimate(params.coinToSell, params.coinToBuy, {buyAmount: params.valueToBuy, swapFrom: params.swapFrom}, {...axiosOptions, cache: estimateCache})
            .then((explorerEstimation) => {
                return Promise.all([
                    _estimateCoinBuy({
                        ...params,
                        // remove first and last items, keep only intermediate items
                        route: explorerEstimation.coins?.map((coin) => coin.id).slice(1, -1),
                        swapFrom: explorerEstimation.swapType,
                    }, axiosOptions),
                    Promise.resolve(explorerEstimation.coins),
                ]);
            })
            .then(([estimateRouteData, route]) => {
                return {
                    ...estimateRouteData,
                    route,
                };
            });
    } else {
        return _estimateCoinBuy(params, axiosOptions);
    }
}

export const estimateTxCommission = (params, options, axiosOptions) => EstimateTxCommission(minterApi)(params, {loose: true, ...options}, {...axiosOptions, cache: estimateCache});

export const replaceCoinSymbol = ReplaceCoinSymbol(minterApi);
export const replaceCoinSymbolByPath = ReplaceCoinSymbolByPath(minterApi);
