import minterorg from '~/api/minterorg';
import explorer from '~/api/explorer';

/**
 * @param data
 * @return {Promise<User|{confirmations: Array}>}
 */
export function register(data) {
    return minterorg.register(data, true);
}

/**
 * @param {Object} data
 * @param {string} data.username
 * @param {string} data.password
 * @return {Promise<User>}
 */
export function login(data) {
    return minterorg.login(data);
}

/**
 * @return {Promise<User>}
 */
export function getProfile() {
    return minterorg.getProfile();
}


export function updateProfile(profile) {
    return minterorg.updateProfile(profile);
}

export function updateProfilePassword(oldPasswordToStore, newPasswordToStore) {
    return minterorg.updateProfilePassword(oldPasswordToStore, newPasswordToStore);
}

/**
 * @param {Blob|File} avatar
 * @return {Promise<UserAvatar>}
 */
export function updateProfileAvatar(avatar) {
    return minterorg.updateProfileAvatar(avatar);
}

/**
 * @typedef {Object} TransactionListInfo
 * @property {Array<Transaction>} data
 * @property {Object} meta - pagination
 */

/**
 * @param {Object} [params]
 * @param {number} [params.block]
 * @param {number} [params.address]
 * @param {number} [params.addresses]
 * @param {number} [params.page]
 * @return {Promise<TransactionListInfo>}
 */
export function getTransactionList(params) {
    return explorer
        .get('transactions', {
            params,
        })
        .then((response) => response.data);
}

/**
 * @param addressHash
 * @return {Promise<Array<CoinItem>>}
 */
export function getBalance(addressHash) {
    return explorer.get('address/' + addressHash)
        .then((response) => response.data.data.coins.sort((a, b) => {
            return b.baseCoinAmount - a.baseCoinAmount;
        }));
}


/**
 * Get addresses saved in profile
 * @return {Promise<[Address]>}
 */
export function getProfileAddressList() {
    return minterorg.getProfileAddressList();
}

export function getProfileAddressEncrypted(id) {
    return minterorg.getProfileAddressEncrypted(id);
}

export function addProfileAddress(address) {
    return minterorg.addProfileAddress(address);
}

export function setMainProfileAddress(id) {
    return minterorg.updateProfileAddress(id, {isMain: true});
}

export function deleteProfileAddress(id) {
    return minterorg.deleteProfileAddress(id);
}

/**
 * @param {Object} params
 * @param {string} [params.username]
 * @param {string} [params.email]
 * @param {CancelToken} [cancelToken]
 * @return {Promise<Object>}
 */
export function getAddressInfoByContact(params, cancelToken) {
    return minterorg.getAddressInfoByContact(params, {cancelToken});
}

/**
 * @param {Array<string>} addressList
 * @return {Promise<Array<UserInfo>>}
 */
export function getAddressListInfo(addressList) {
    return minterorg.getAddressListInfo(addressList);
}

// @TODO all addresses from server should be serverSecured
function markSecured(address) {
    return {
        ...address,
        isServerSecured: true,
    };
}



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
 * @property {number} block
 * @property {string} from
 * @property {string} timestamp
 * @property {number} fee
 * @property {number} type
 * @property {Object} data
 * -- type: TX_TYPES.SEND
 * @property {string} [data.to]
 * @property {string} [data.coin]
 * @property {number} [data.amount]
 * -- type: TX_TYPES.CONVERT
 * @property {string} [data.coin_to_sell]
 * @property {string} [data.coin_to_buy]
 * @property {number} [data.value_to_sell]
 * @property {number} [data.value_to_buy]
 * -- type: TX_TYPES.CREATE_COIN
 * @property {string} [data.name]
 * @property {string} [data.symbol]
 * @property {number} [data.initial_amount]
 * @property {number} [data.initial_reserve]
 * @property {number} [data.constant_reserve_ratio]
 * -- type: TX_TYPES.DECLARE_CANDIDACY
 * @property {string} [data.address]
 * @property {string} [data.pub_key]
 * @property {number} [data.commission]
 * @property {string} [data.coin]
 * @property {number} [data.stake]
 * -- type: TX_TYPES.DELEGATE
 * @property {string} [data.pub_key]
 * @property {string} [data.coin]
 * @property {number} [data.stake]
 * -- type: TX_TYPES.UNBOND
 * @property {string} [data.pub_key]
 * @property {string} [data.coin]
 * @property {number} [data.value]
 * -- type: TX_TYPES.REDEEM_CHECK
 * @property {string} [data.raw_check]
 * @property {string} [data.proof]
 * - type: TX_TYPES.SET_CANDIDATE_ONLINE, TX_TYPES.SET_CANDIDATE_OFFLINE
 * @property {string} [data.pub_key]
 */

/**
 * @typedef {Object} Address
 * @property {number} id
 * @property {string} address
 * @property {boolean} isMain
 * @property {boolean} isServerSecured
 * @property {string} [encrypted] - Encrypted mnemonic (if isServerSecured)
 * @property {string} [mnemonic] - Stored mnemonic (if not isServerSecured)
 */

/**
 * @typedef {Object} CoinItem
 * @property {string|number} amount
 * @property {string|number} baseCoinAmount
 * @property {string|number} usdAmount
 * @property {string} coin
 */


