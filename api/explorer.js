import axios from 'axios';
import {cacheAdapterEnhancer, Cache} from 'axios-extensions';
import stripZeros from 'pretty-num/src/strip-zeros.js';
import {COIN_NAME, EXPLORER_API_URL} from "~/assets/variables";
import addToCamelInterceptor from '~/assets/to-camel.js';
import {addTimeInterceptor} from '~/assets/time-offset.js';

const explorer = axios.create({
    baseURL: EXPLORER_API_URL,
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false}),

});
addToCamelInterceptor(explorer);
addTimeInterceptor(explorer);

/**
 * @typedef {Object} TransactionListInfo
 * @property {Array<Transaction>} data
 * @property {Object} meta - pagination
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
 * @typedef {Object} BalanceItem
 * @property {number|string} amount
 * @property {CoinItem} coin
 */


/**
 *
 * @param {Array<BalanceItem>} balanceList
 * @return {Array<BalanceItem>}
 */
export function prepareBalance(balanceList) {
    return balanceList.sort((a, b) => {
            // set base coin first
            if (a.coin.symbol === COIN_NAME) {
                return -1;
            } else if (b.coin.symbol === COIN_NAME) {
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
        .then((response) => response.data.data);
    // don't sort, coins already sorted by reserve
    // .then((response) => response.data.data.sort((a, b) => {
    //     if (a.symbol === COIN_NAME) {
    //         return -1;
    //     } else if (b.symbol === COIN_NAME) {
    //         return 1;
    //     } else {
    //         return a.symbol.localeCompare(b.symbol);
    //     }
    // }));
}

/**
 * @typedef {Object} CoinItem
 * @property {number} id
 * @property {number} crr
 * @property {number|string} volume
 * @property {number|string} reserve_balance
 * @property {string} name
 * @property {string} symbol
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
 * @property {string} coin
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
 * @property {Array<{coin: string, value: string, address: string}>} [delegatorList]
 */

/**
 * @typedef {Object} Block
 * @property {number} height
 * @property {string} timestamp
 * @property {number} txCount
 * @property {number} size
 * @property {string} hash
 * @property {number} reward
 * @property {number} blockTime
 * @property {string} timestamp
 * @property {Array<Validator>} validators
 */

/**
 * @typedef {Object} Validator
 * @property {number} id
 * @property {string} name
 * @property {string} address
 * @property {string} publicKey
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
 * @property {string} gasCoin
 * @property {number} fee
 * @property {number} type
 * @property {Object} data
 * -- type: TX_TYPE.SEND
 * @property {string} [data.to]
 * @property {string} [data.coin]
 * @property {number} [data.amount]
 * -- type: TX_TYPE.CONVERT
 * @property {string} [data.coinToSell]
 * @property {string} [data.coinToBuy]
 * @property {number} [data.valueToSell]
 * @property {number} [data.valueToBuy]
 * -- type: TX_TYPE.CREATE_COIN
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
 * @property {string} [data.coin]
 * @property {number} [data.stake]
 * -- type: TX_TYPE.EDIT_CANDIDATE
 * @property {string} [data.pubKey]
 * @property {string} [data.rewardAddress]
 * @property {string} [data.ownerAddress]
 * -- type: TX_TYPE.DELEGATE, TX_TYPE.UNBOND
 * @property {string} [data.pubKey]
 * @property {string} [data.coin]
 * @property {number} [data.value]
 * -- type: TX_TYPE.REDEEM_CHECK
 * @property {string} [data.rawCheck]
 * @property {string} [data.proof]
 * @property {Object} [data.check]
 * @property {string} [data.check.sender]
 * @property {number} [data.check.nonce]
 * @property {number|string} [data.check.value]
 * @property {string} [data.check.coin]
 * @property {number} [data.check.dueBlock]
 * - type: TX_TYPE.SET_CANDIDATE_ON, TX_TYPE.SET_CANDIDATE_OFF
 * @property {string} [data.pubKey]
 * -- type: TX_TYPE.MULTISEND
 * @property {Array<{to: string, coin: string}>} [data.list]
 * -- type: TX_TYPE.CREATE_MULTISIG
 * @property {string|number} [data.multisigAddress]
 * @property {Array<string>} [data.addresses]
 * @property {Array<string|number>} [data.weights]
 * @property {string|number} [data.threshold]
 */

/**
 * @typedef {Object} CoinItem
 * @property {string|number} amount
 * @property {string} coin
 */


/**
 * @typedef {Object} DelegationItem
 * @property {string} pub_key
 * @property {string|number} value
 * @property {string} coin
 */

/**
 * @typedef {Object} StakeListInfo
 * @property {Array<DelegationItem>} data
 * @property {Object} meta - pagination
 * @property {Object} meta.additional
 * @property {number|string} meta.additional.total_delegated_bip_value
 */
