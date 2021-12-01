import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import stripZeros from 'pretty-num/src/strip-zeros.js';
import {convertToPip} from 'minterjs-util';
import coinBlockList from 'minter-coin-block-list';
import {BASE_COIN, EXPLORER_API_URL} from "~/assets/variables";
import addToCamelInterceptor from '~/assets/to-camel.js';
import {addTimeInterceptor} from '~/assets/time-offset.js';


const coinBlockMap = Object.fromEntries(coinBlockList.map((symbol) => [symbol, true]));
function isBlocked(symbol) {
    // rely on api being already filtered
    return false;
    // eslint-disable-next-line no-unreachable
    return !!coinBlockMap[symbol.replace(/-\d+$/, '')];
}


const instance = axios.create({
    baseURL: EXPLORER_API_URL,
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),
});
const explorer = instance;
addToCamelInterceptor(explorer);
addTimeInterceptor(explorer);



/**
 * @typedef {Object} Status
 * @property {number} marketCap - in $
 * @property {number} bipPriceUsd
 * @property {number} bipPriceChange - in %
 * @property {number} latestBlockHeight - block count
 * @property {number} avgBlockTime - in seconds
 * @property {number} totalTransactions - tx count
 * @property {number} transactionsPerSecond - tps
 */

/**
 * @return {Promise<Status>}
 */
export function getStatus() {
    return instance.get('status')
        .then((response) => response.data.data);
}


/**
 * @typedef {Object} TransactionListInfo
 * @property {Array<Transaction>} data
 * @property {PaginationMeta} meta
 */

/**
 * @param {string} address
 * @param {Object} [params]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @return {Promise<TransactionListInfo>}
 */
export function getAddressTransactionList(address, params = {}) {
    return explorer.get(`addresses/${address}/transactions`, {params})
        .then((response) => response.data);
}

/**
 * @param addressHash
 * @return {Promise<{data: BalanceData, latestBlockTime: string}>}
 */
export function getBalance(addressHash) {
    return explorer.get('addresses/' + addressHash + '?with_sum=true')
        .then((response) => {
            response.data.data.balances = prepareBalance(response.data.data.balances);
            return response.data;
        });
}

/**
 * @typedef {Object} BalanceData
 * @property {string} totalBalanceSum
 * @property {string} totalBalanceSumUsd
 * @property {Array<BalanceItem>} balances
 */

/**
 * @typedef {Object} BalanceItem
 * @property {number|string} amount
 * @property {number|string} bipAmount
 * @property {Coin} coin
 */


/**
 *
 * @param {Array<BalanceItem>} balanceList
 * @return {Array<BalanceItem>}
 */
export function prepareBalance(balanceList) {
    return balanceList.sort((a, b) => {
            // set base coin first
            if (a.coin.symbol === BASE_COIN) {
                return -1;
            } else if (b.coin.symbol === BASE_COIN) {
                return 1;
            } else {
                // sort coins by name, instead of reserve
                return a.coin.symbol.localeCompare(b.coin.symbol);
            }
        })
        .map((coinItem) => {
            return {
                ...coinItem,
                amount: stripZeros(coinItem.amount),
            };
        });
}

// 1 min cache
const coinsCache = new Cache({maxAge: 1 * 60 * 1000});
/**
 * @return {Promise<Array<CoinItem>>}
 */
export function getCoinList() {
    return explorer.get('coins', {
        cache: coinsCache,
    })
        // .then((response) => response.data.data);
        // @TODO don't sort, coins should already be sorted by reserve
        .then((response) => {
            const coinList = response.data.data;
            return coinList
                .filter((coin) => !isBlocked(coin.symbol))
                .sort((a, b) => {
                    if (a.symbol === BASE_COIN) {
                        return -1;
                    } else if (b.symbol === BASE_COIN) {
                        return 1;
                    } else {
                        return 0;
                        // return a.symbol.localeCompare(b.symbol);
                    }
                });
        });
}

/**
 * @param {string|number} [coin]
 * @param {number} [depth]
 * @return {Promise<Array<CoinItem>>}
 */
export function getSwapCoinList(coin, depth) {
    const coinUrlSuffix = coin ? '/' + coin : '';
    return explorer.get('pools/list/coins' + coinUrlSuffix, {
            params: {depth},
            cache: coinsCache,
        })
        .then((response) => response.data.sort((a, b) => {
            return a.id - b.id;
        }));
}



/**
 * @typedef {Object} CoinItem
 * @property {number} id
 * @property {string} symbol
 * @property {string} type
 * @property {number} crr
 * @property {number|string} volume
 * @property {number|string} reserveBalance
 * @property {string} name
 * @property {boolean} mintable
 * @property {boolean} burnable
 */


/**
 * @param {string} address
 * @return {Promise<StakeListInfo>}
 */
export function getAddressStakeList(address) {
    return explorer.get(`addresses/${address}/delegations`, {params: {limit: 999}})
        .then((response) => response.data);
}

/**
 * @typedef {Object} StakeItem
 * @property {Validator} [validator]
 * @property {string} [address]
 * @property {string|number} value
 * @property {string|number} bipValue
 * @property {Coin} coin
 * @property {boolean} isWaitlisted
 */


/**
 * @typedef {Object} Validator
 * @property {string} publicKey
 * @property {string} name
 * @property {string} description
 * @property {string} iconUrl
 * @property {string} siteUrl
 * @property {number} status
 * @property {string|number} [stake]
 * @property {string|number} [part]
 * @property {number} [delegatorCount]
 * @property {Array<{coin: Coin, value: string, address: string}>} [delegatorList]
 */

/**
 * @typedef {Object} Block
 * @property {number} height
 * @property {string} timestamp
 * @property {number} transactionCount - tx count in the block
 * @property {number} size
 * @property {string} hash
 * @property {number} reward
 * @property {number} blockTime
 * @property {string} timestamp
 * @property {number} validatorsCount
 * @property {Array<ValidatorListItem>} [validators]
 */


/**
 * @param {Object} [params]
 * @param {string|number} [params.coin]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @return {Promise<PoolListInfo>}
 */
export function getPoolList(params) {
    return explorer.get('pools', {
            params,
        })
        .then((response) => response.data);
}


// 10s cache
const poolCache = new Cache({maxAge: 10 * 1000});

/**
 * @param {string|number} coin0
 * @param {string|number} coin1
 * @return {Promise<Pool>}
 */
export function getPool(coin0, coin1) {
    return explorer.get(`pools/coins/${coin0}/${coin1}`, {
            cache: poolCache,
        })
        .then((response) => response.data.data);
}

/**
 * @param {string} coin0
 * @param {string} coin1
 * @param {string} address
 * @return {Promise<Pool>}
 */
export function getPoolProvider(coin0, coin1, address) {
    return explorer.get(`pools/coins/${coin0}/${coin1}/providers/${address}`)
        .then((response) => response.data.data);
}

/**
 * @param {string} address
 * @param {Object} [params]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @return {Promise<ProviderPoolListInfo>}
 */
export function getProviderPoolList(address, params) {
    return explorer.get(`pools/providers/${address}`, {
            params,
        })
        .then((response) => response.data);
}

/**
 * @param {string} coin0
 * @param {string} coin1
 * @param {Object} amountOptions
 * @param {number|string} [amountOptions.buyAmount]
 * @param {number|string} [amountOptions.sellAmount]
 * @param {AxiosRequestConfig} [axiosOptions]
 * @return {Promise<{coins: Array<Coin>, amountIn: number|string, amountOut:number|string}>}
 */
export function getSwapRoute(coin0, coin1, {buyAmount, sellAmount}, axiosOptions) {
    const amount = convertToPip(buyAmount || sellAmount);
    let type;
    if (sellAmount) {
        type = 'input';
    }
    if (buyAmount) {
        type = 'output';
    }
    return explorer.get(`pools/coins/${coin0}/${coin1}/route?type=${type}&amount=${amount}`, axiosOptions)
        .then((response) => response.data);
}

/**
 * @typedef {Object} PoolListInfo
 * @property {Array<Pool>} data
 * @property {PaginationMeta} meta
 */

/**
 * @typedef {Object} ProviderPoolListInfo
 * @property {Array<PoolProvider>} data
 * @property {PaginationMeta} meta
 */

/**
 * @typedef {Object} Pool
 * @property {Coin} coin0
 * @property {Coin} coin1
 * @property {number|string} amount0
 * @property {number|string} amount1
 * @property {number|string} liquidity
 * @property {number|string} liquidityBip
 * @property {string} token
 * @property {number|string} tradeVolumeBip30D
 */

/**
 * @typedef {Object} PoolProvider
 * @property {string} address
 * @property {Coin} coin0
 * @property {Coin} coin1
 * @property {number|string} amount0
 * @property {number|string} amount1
 * @property {number|string} liquidity
 * @property {number|string} liquidityBip
 * @property {number|string} liquidityShare
 * @property {string} token
 */

/**
 * @typedef {Object} Transaction
 * @property {number} txn
 * @property {string} hash
 * @property {string} status
 * @property {number} nonce
 * @property {number} height
 * @property {string} from
 * @property {string} timestamp
 * @property {Coin} gasCoin
 * @property {number} commissionInBaseCoin
 * @property {number} commissionInGasCoin
 * @property {number} commissionPrice
 * @property {Coin} commissionPriceCoin
 * @property {number} type
 * @property {Object} data
 * -- type: TX_TYPE.SEND
 * @property {string} [data.to]
 * @property {Coin} [data.coin]
 * @property {number} [data.amount]
 * -- type: TX_TYPE.CONVERT
 * @property {Coin} [data.coinToSell]
 * @property {Coin} [data.coinToBuy]
 * @property {number} [data.valueToSell]
 * @property {number} [data.valueToBuy]
 * -- type: TX_TYPE.CREATE_COIN
 * @property {number} [data.createdCoinId]
 * @property {string} [data.name]
 * @property {string} [data.symbol]
 * @property {number} [data.initialAmount]
 * @property {number} [data.initialReserve]
 * @property {number} [data.constantReserveRatio]
 * @property {number} [data.maxSupply]
 * -- type: TX_TYPE.DECLARE_CANDIDACY
 * @property {string} [data.address]
 * @property {string} [data.pubKey]
 * @property {number} [data.commission]
 * @property {Coin} [data.coin]
 * @property {number} [data.stake]
 * -- type: TX_TYPE.EDIT_CANDIDATE
 * @property {string} [data.pubKey]
 * @property {string} [data.rewardAddress]
 * @property {string} [data.ownerAddress]
 * @property {string} [data.controlAddress]
 * -- type: TX_TYPE.EDIT_CANDIDATE_PUBLIC_KEY
 * @property {string} [data.pubKey]
 * @property {string} [data.newPubKey]
 * -- type: TX_TYPE.DELEGATE, TX_TYPE.UNBOND
 * @property {string} [data.pubKey]
 * @property {Coin} [data.coin]
 * @property {number} [data.value]
 * -- type: TX_TYPE.REDEEM_CHECK
 * @property {string} [data.rawCheck]
 * @property {string} [data.proof]
 * @property {Object} [data.check]
 * @property {string} [data.check.sender]
 * @property {number} [data.check.nonce]
 * @property {number|string} [data.check.value]
 * @property {Coin} [data.check.coin]
 * @property {number} [data.check.dueBlock]
 * - type: TX_TYPE.SET_CANDIDATE_ON, TX_TYPE.SET_CANDIDATE_OFF
 * @property {string} [data.pubKey]
 * -- type: TX_TYPE.MULTISEND
 * @property {Array<{to: string, coin: Coin}>} [data.list]
 * -- type: TX_TYPE.CREATE_MULTISIG
 * @property {string|number} [data.multisigAddress]
 * @property {Array<string>} [data.addresses]
 * @property {Array<string|number>} [data.weights]
 * @property {string|number} [data.threshold]
 */

/**
 * @typedef {Object} Coin
 * @property {number} id
 * @property {string} symbol
 * @property {string} type
 */


/**
 * @typedef {Object} DelegationItem
 * @property {Validator} validator
 * @property {string|number} value
 * @property {string|number} bipValue
 * @property {Coin} coin
 * @property {boolean} isWaitlisted
 */

/**
 * @typedef {Object} StakeListInfo
 * @property {Array<DelegationItem>} data
 * @property {PaginationMeta} meta
 * @property {Object} meta.additional
 * @property {number|string} meta.additional.totalDelegatedBipValue
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} currentPage
 * @property {number} lastPage
 * @property {number} perPage
 * @property {number} total
 * @property {string} path
 */
