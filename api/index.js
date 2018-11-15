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
 * @property {string} hash
 * @property {string} status
 * @property {number} nonce
 * @property {number} block
 * @property {string} timestamp
 * @property {number} fee
 * @property {number} type
 * @property {Object} data
 * @property {string} data.from
 * @property {string} data.too
 * @property {string} data.coin
 * @property {number} data.amount
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
        .then((response) => {
            const addressList = params.addresses || [params.address];
            response.data.data.forEach((tx) => {
                addressList.some((address) => {
                    if (address === tx.data.to) {
                        tx.data.direction = 'income';
                        return true;
                    }
                    if (address === tx.data.from) {
                        tx.data.direction = 'outcome';
                        return true;
                    }
                });
            });

            return response.data;
        });
}

export function getBalance(addressHash) {
    return explorer.get('address/' + addressHash)
        .then((response) => {
            response.data.data.coinList = response.data.data.coins;
            delete response.data.data.coins;
            return response.data.data
        });
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
export function getAddressInfo(params, cancelToken) {
    return minterorg.getAddressInfo(params, {cancelToken});
}

// @TODO all addresses from server should be serverSecured
function markSecured(address) {
    return {
        ...address,
        isServerSecured: true,
    }
}


