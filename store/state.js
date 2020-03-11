export default function() {
    return {
        auth: {
            /** @type Address|null */
            advanced: null,
            /** @type string|null - stored password */
            password: null,
        },
        /** @type User */
        user: {
            /** @type Address */
            mainAddress: {},
        },
        /** @type Array<Address> - source of truth for encrypted mnemonic data */
        profileAddressList: [],
        /** @type Array<CoinItem> */
        balance: [],
        totalBalanceSum: '0',
        totalBalanceSumUsd: '0',
        balanceDisplayType: 0,
        lastUpdateTime: '',
        delegation: {},
        // store only first page here
        transactionListInfo: {
            /** @type Array<Transaction> */
            data: [],
            meta: {},
        },
        userList: {},
        history: [],
        authRedirectPath: '',
    };
    // vuex-persistedstate enabled in nuxt.config.js
}




/**
 * @typedef {Object} Transaction
 * @property {string} name
 * @property {number} amount
 * @property {string} coin
 * @property {string} image
 * @property {string} timestamp
 */

/**
 * @typedef {Object} TokenData
 * @property {string} tokenType
 * @property {number} expiresIn
 * @property {string} accessToken
 * @property {string} refreshToken
 */

/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} language
 * @property {UserAvatar} avatar
 * @property {Address} mainAddress
 */

/**
 * @typedef {Object} UserAvatar
 * @property {string} src
 * @property {string} description
 */
