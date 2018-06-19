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
import explorer from '~/api/explorer';import {generateMnemonic, getPasswordToSend, getPasswordToStore, addressEncryptedFromMnemonic} from "~/assets/utils";

const formDataHeaders = { 'Content-Type': 'multipart/form-data' };

export function register(data) {
    const passwordToStore = getPasswordToStore(data.password);
    const passwordToSend = getPasswordToSend(passwordToStore);
    let userData = {
        ...data,
        password: passwordToSend,
    };
    delete userData.passwordConfirm;

    const mnemonic = generateMnemonic();

    return new Promise((resolve, reject) => {
        myminter.post('register', {
                ...userData,
                mainAddress: addressEncryptedFromMnemonic(mnemonic, passwordToStore, true)
            })
            .then(() => {
                login(data)
                    .then((authData) => {
                        resolve({
                            ...authData,
                            password: passwordToStore,
                        });
                    })
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
    const passwordToStore = getPasswordToStore(password);
    const passwordToSend = getPasswordToSend(passwordToStore);

    return myminter.post('login', {
            username,
            password: passwordToSend,
        })
        .then((response) => {
            return {
                ...response.data.data,
                password: passwordToStore,
            }
        });
}

/**
 * @return {Promise<User>}
 */
export function getProfile() {
    return myminter.get('profile')
        .then((response) => response.data.data);
}

export function putProfile(profile) {
    let dataToSend = Object.assign({}, profile);
    if (dataToSend.password) {
        dataToSend.password = getPasswordToSend(getPasswordToStore(dataToSend.password));
    }
    if (dataToSend.passwordConfirm) {
        delete dataToSend.passwordConfirm;
    }
    return myminter.put('profile', dataToSend);
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
            let coinList = {};
            response.data.data.balance.forEach((item) => {
                Object.keys(item).forEach((coinName) => {
                    if (!coinList[coinName]) {
                        coinList[coinName] = {};
                    }
                    coinList[coinName].amount = item[coinName];
                });
            });
            response.data.data.balanceUsd.forEach((item) => {
                Object.keys(item).forEach((coinName) => {
                    if (!coinList[coinName]) {
                        coinList[coinName] = {};
                    }
                    coinList[coinName].amountUsd = item[coinName];
                });
            });
            delete response.data.data.balance;
            delete response.data.data.balanceUsd;
            return {
                ...response.data.data,
                coinList: Object.keys(coinList).reduce((accumulator, coinName) => {
                    accumulator.push({
                        ...coinList[coinName],
                        coin: coinName,
                    });
                    return accumulator;
                }, []),
            }
        });
}


/**
 * Get addresses saved in profile
 * @return {Promise<[Address]>}
 */
export function getProfileAddressList() {
    return myminter.get('addresses')
        .then((response) => response.data.data.map(markSecured));
}

export function getProfileAddressEncrypted(id) {
    return myminter.get('addresses/' + id + '/encrypted')
        .then((response) => markSecured(response.data.data));
}

export function addProfileAddress(address) {
    return myminter.post('addresses', address);
}

export function setMainProfileAddress(id) {
    return myminter.put('addresses/' + id, {isMain: true});
}

export function deleteProfileAddress(id) {
    return myminter.delete('addresses/' + id);
}

/**
 * @param {Object} params
 * @param {string} [params.username]
 * @param {string} [params.email]
 * @param {CancelToken} [cancelToken]
 * @return {Promise<Object>}
 */
export function getAddressInfo(params, cancelToken) {
    return myminter
        .get('info/address/by/contact', {
            params,
            cancelToken,
        })
        .then((response) => response.data.data)
}

function makeFormData(data) {
    let formData = new FormData();
    Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
    });

    return formData;
}

// @TODO all addresses from server should be serverSecured
function markSecured(address) {
    return {
        ...address,
        isServerSecured: true,
    }
}


