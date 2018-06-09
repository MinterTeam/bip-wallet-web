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

import myminter from '~/api/myminter';
import explorer from '~/api/explorer';
import {generateMnemonic, walletFromMnemonic} from "~/assets/utils";

const formDataHeaders = { 'Content-Type': 'multipart/form-data' };

export function register(data) {
    return new Promise((resolve, reject) => {
        const mnemonic = generateMnemonic();
        const wallet = walletFromMnemonic(mnemonic);
        myminter.post('register', {
                ...data,
                mainAddress: {
                    address: wallet.getAddressString(),
                    isMain: true,
                    isServerSecured: true,
                    //@TODO encrypt mnemonic
                    encrypted: mnemonic,
                }
            })
            .then(() => {
                login(data)
                    .then(resolve)
                    .catch(reject);
            })
            .catch(reject);
    });
}

/**
 * @param username
 * @param password
 * @return {Promise<User>}
 */
export function login({username, password}) {
    return myminter.post('login', {
            username,
            password,
        })
        .then((response) => response.data.data);
}

/**
 * @return {Promise<User>}
 */
export function getProfile() {
    return myminter.get('profile')
        .then((response) => response.data.data);
}

export function putProfile(profile) {
    return myminter.put('profile', profile);
}

/**
 * @param avatar
 * @return {Promise<UserAvatar>}
 */
export function putProfileAvatar(avatar) {
    return myminter
        .post('profile/avatar', makeFormData({avatar}), {
            headers: formDataHeaders,
        })
        .then((response) => response.data.data);
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


    return new Promise((resolve, reject) => {
        getProfileAddressList()
            .then((addressList) => {

            })
            .catch(reject);
    })
}


/**
 * Get addresses saved in profile
 * @return {Promise<[Address]>}
 */
export function getProfileAddressList() {
    return myminter.get('addresses')
        .then((response) => response.data.data);
}

export function getProfileAddressEncrypted(id) {
    return myminter.get('addresses/' + id + '/encrypted')
        .then((response) => response.data.data)
}

function makeFormData(data) {
    let formData = new FormData();
    Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
    });

    return formData;
}


