import accounts from '~/api/accounts';

/**
 * @param data
 * @return {Promise<User|{confirmations: Array}>}
 */
export function register(data) {
    return accounts.register(data, true);
}

/**
 * @param {Object} data
 * @param {string} data.username
 * @param {string} data.password
 * @return {Promise<User>}
 */
export function login(data) {
    return accounts.login(data);
}

/**
 * @return {Promise<User>}
 */
export function getProfile() {
    return accounts.getProfile();
}


export function updateProfile(profile) {
    return accounts.updateProfile(profile);
}

export function updateProfilePassword(oldPasswordToStore, newPasswordToStore) {
    return accounts.updateProfilePassword(oldPasswordToStore, newPasswordToStore);
}

/**
 * @param {Blob|File} avatar
 * @return {Promise<UserAvatar>}
 */
export function updateProfileAvatar(avatar) {
    return accounts.updateProfileAvatar(avatar);
}




/**
 * Get addresses saved in profile
 * @return {Promise<[Address]>}
 */
export function getProfileAddressList() {
    return accounts.getProfileAddressList();
}

export function getProfileAddressEncrypted(id) {
    return accounts.getProfileAddressEncrypted(id);
}

export function addProfileAddress(address) {
    return accounts.addProfileAddress(address);
}

export function setMainProfileAddress(id) {
    return accounts.updateProfileAddress(id, {isMain: true});
}

export function deleteProfileAddress(id) {
    return accounts.deleteProfileAddress(id);
}

/**
 * @param {Object} params
 * @param {string} [params.username]
 * @param {string} [params.email]
 * @param {CancelToken} [cancelToken]
 * @return {Promise<Object>}
 */
export function getAddressInfoByContact(params, cancelToken) {
    return accounts.getAddressInfoByContact(params, {cancelToken});
}

/**
 * @param {Array<string>} addressList
 * @return {Promise<Array<UserInfo>>}
 */
export function getAddressListInfo(addressList) {
    return accounts.getAddressListInfo(addressList);
}

// @TODO all addresses from server should be serverSecured
function markSecured(address) {
    return {
        ...address,
        isServerSecured: true,
    };
}



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
 * @typedef {Object} BalanceData
 * @property {string} totalBalanceSum
 * @property {string} totalBalanceSumUsd
 * @property {Array<CoinItem>} balances
 */
