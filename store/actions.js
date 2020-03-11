import {TX_TYPE} from 'minterjs-tx/src/tx-types';
import {getBalance, getDelegation, getProfile, getProfileAddressList, getProfileAddressEncrypted, getAddressTransactionList, getAddressListInfo, getCoinList} from "~/api";

let activeCoinListPromise;
let coinListTime = 0;

export default {
    FETCH_PROFILE: ({ commit }) => {
        return getProfile()
            .then((profile) => commit('SET_PROFILE_USER', profile));
    },
    FETCH_PROFILE_ADDRESS_LIST: ({ commit, getters }) => {
        //@TODO is it required to update address list each time?
        if (getters.isUserWithProfile) {
            return getProfileAddressList().then((addressList) => {
                commit('SET_PROFILE_ADDRESS_LIST', addressList);
                return addressList;
            });
        } else {
            return Promise.resolve();
        }
    },
    FETCH_ADDRESS_ENCRYPTED: ({ state, commit, getters, dispatch }) => {
        if (getters.isUserAdvanced || (getters.mainProfileAddress && getters.mainProfileAddress.encrypted)) {
            return Promise.resolve();
        }
        // ensure mainProfileAddress exists
        let mainProfileAddressPromise;
        if (getters.mainProfileAddress) {
            mainProfileAddressPromise = Promise.resolve(getters.mainProfileAddress);
        } else {
            mainProfileAddressPromise = dispatch('FETCH_PROFILE_ADDRESS_LIST');
        }

        return mainProfileAddressPromise
            .then(() => getProfileAddressEncrypted(getters.mainProfileAddress.id))
            .then((address) => commit('SET_PROFILE_ADDRESS_ENCRYPTED', address));
    },
    FETCH_TRANSACTION_LIST: ({ commit, dispatch, getters }, page = 1) => {
        // use only 1 address
        return getAddressTransactionList(getters.address, {
            page: page || 1,
        })
            .then((txListInfo) => {
                // commit only first page
                if (!(page > 2)) {
                    commit('SET_TRANSACTION_LIST', txListInfo);
                }
                // fetch avatars and usernames for addresses found in txs
                const addressListToFetch = txListInfo.data.reduce((accum, tx) => {
                    if (tx.type === Number(TX_TYPE.SEND)) {
                        if (tx.data.to === getters.address) {
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
    FETCH_BALANCE: ({ commit, getters }) => {
        // use only 1 address
        return getBalance(getters.address)
            .then((balanceData) => {
                commit('SET_BALANCE', balanceData.balances);
                commit('SET_BALANCE_SUM', balanceData);
                //@TODO update lastUpdateTime
                return balanceData.balances;
            });
    },
    FETCH_DELEGATION: ({ commit, getters }) => {
        // use only 1 address
        return getDelegation(getters.address)
            .then((delegation) => {
                commit('SET_DELEGATION', delegation);
                return delegation;
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
    FETCH_COIN_LIST: () => {
        if (Date.now() - coinListTime > 60 * 1000) {
            activeCoinListPromise = getCoinList();
            coinListTime = Date.now();
        }
        return activeCoinListPromise;
    },
};
