import {getBalance, getProfile, getProfileAddressList, getProfileAddressEncrypted, getTransactionList, getAddressListInfo} from "~/api";
import {TX_TYPES} from '~/assets/variables';
import explorer from "~/api/explorer";

export default {
    FETCH_PROFILE: ({ commit }) => {
        return getProfile()
            .then((profile) => commit('SET_PROFILE_USER', profile));
    },
    FETCH_PROFILE_ADDRESS_LIST: ({ commit, getters }) => {
        if (getters.isUserWithProfile) {
            return getProfileAddressList().then((addressList) => {
                commit('SET_PROFILE_ADDRESS_LIST', addressList);
                return addressList;
            });
        } else {
            return Promise.resolve();
        }
    },
    FETCH_ADDRESS_ENCRYPTED: ({ state, commit, getters }) => {
        if (getters.isUserAdvanced || getters.mainProfileAddress.encrypted) {
            return Promise.resolve();
        }
        // profile address fetched in the middleware
        return getProfileAddressEncrypted(getters.mainProfileAddress.id)
            .then((address) => commit('SET_PROFILE_ADDRESS_ENCRYPTED', address));
    },
    FETCH_TRANSACTION_LIST: ({ commit, dispatch }) => {
        return new Promise((resolve, reject) => {
            dispatch('FETCH_PROFILE_ADDRESS_LIST')
                .then(() => {
                    dispatch('FETCH_TRANSACTION_LIST_STANDALONE')
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
    },
    FETCH_TRANSACTION_LIST_STANDALONE: ({ commit, dispatch, getters }, page = 1) => {
        // use only 1 address
        return getTransactionList({
            addresses: getters.addressList.map((item) => item.address),
            page: page || 1,
        })
            .then((txListInfo) => {
                // commit only first page
                if (!(page > 2)) {
                    commit('SET_TRANSACTION_LIST', txListInfo);
                }
                // fetch avatars and usernames for addresses found in txs
                const addressListToFetch = txListInfo.data.reduce((accum, tx) => {
                    if (tx.type === TX_TYPES.SEND) {
                        if (tx.data.to === getters.addressList[0].address) {
                            accum.add(tx.from);
                        } else {
                            accum.add(tx.data.to);
                        }
                    }
                    return accum;
                }, new Set());
                dispatch('FETCH_USERS', Array.from(addressListToFetch));
                return txListInfo;
            });
    },
    FETCH_BALANCE: ({ commit, dispatch, getters }) => {
        return new Promise((resolve, reject) => {
            dispatch('FETCH_PROFILE_ADDRESS_LIST')
                .then(() => {
                    dispatch('FETCH_BALANCE_STANDALONE')
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
    },
    FETCH_BALANCE_STANDALONE: ({ commit, getters }) => {
        // use only 1 address
        console.log('fetch balance');
        return getBalance(getters.addressList[0].address)
            .then((balance) => {
                console.log('fetch balance then');
                commit('SET_BALANCE', balance);
                return balance;
            });
    },
    FETCH_USERS: ({ state, commit }, addressList) => {
        // fetch only new addresses
        addressList = addressList.filter((address) => !state.userList[address]);
        if (!addressList.length) {
            return Promise.resolve();
        }
        return getAddressListInfo(addressList)
            .then((userInfoList) => {
                userInfoList.forEach((userInfo) => {
                    commit('ADD_USER', userInfo);
                });
            });
    },
};
