import stripZeros from 'pretty-num/src/strip-zeros';
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
 * @return {Promise<Array<CoinItem>>}
 */
export function getBalance(addressHash) {
    return explorer.get('addresses/' + addressHash)
        .then((response) => response.data.data.balances.sort((coinItem) => {
            // set MNT first
            if (coinItem.coin === 'MNT') {
                return -1;
            } else {
                return 0;
            }
        })
            .map((coinItem) => {
                return {
                    ...coinItem,
                    amount: stripZeros(coinItem.amount),
                };
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
 * -- type: TX_TYPE_SEND
 * @property {string} [data.to]
 * @property {string} [data.coin]
 * @property {number} [data.amount]
 * -- type: TX_TYPE_CONVERT
 * @property {string} [data.coin_to_sell]
 * @property {string} [data.coin_to_buy]
 * @property {number} [data.value_to_sell]
 * @property {number} [data.value_to_buy]
 * -- type: TX_TYPE_CREATE_COIN
 * @property {string} [data.name]
 * @property {string} [data.symbol]
 * @property {number} [data.initial_amount]
 * @property {number} [data.initial_reserve]
 * @property {number} [data.constant_reserve_ratio]
 * -- type: TX_TYPE_DECLARE_CANDIDACY
 * @property {string} [data.address]
 * @property {string} [data.pub_key]
 * @property {number} [data.commission]
 * @property {string} [data.coin]
 * @property {number} [data.stake]
 * -- type: TX_TYPE_EDIT_CANDIDATE
 * @property {string} [data.pub_key]
 * @property {string} [data.reward_address]
 * @property {string} [data.owner_address]
 * -- type: TX_TYPE_DELEGATE
 * @property {string} [data.pub_key]
 * @property {string} [data.coin]
 * @property {number} [data.stake]
 * -- type: TX_TYPE_UNBOND
 * @property {string} [data.pub_key]
 * @property {string} [data.coin]
 * @property {number} [data.value]
 * -- type: TX_TYPE_REDEEM_CHECK
 * @property {string} [data.raw_check]
 * @property {string} [data.proof]
 * - type: TX_TYPE_SET_CANDIDATE_ON, TX_TYPE_SET_CANDIDATE_OFF
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
 * @property {string} coin
 */


