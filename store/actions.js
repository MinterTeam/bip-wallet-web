import {getBalance, getProfile, getProfileAddressList, getProfileAddressEncrypted, getTransactionList, getAddressListInfo} from "~/api";
import {TX_TYPES} from '~/assets/variables';
import explorer from "~/api/explorer";

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
    FETCH_TRANSACTION_LIST: ({ commit, dispatch }) => {
        return dispatch('FETCH_PROFILE_ADDRESS_LIST')
            .then(() => dispatch('FETCH_TRANSACTION_LIST_STANDALONE'));
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
        return dispatch('FETCH_PROFILE_ADDRESS_LIST')
            .then(() => dispatch('FETCH_BALANCE_STANDALONE'));
    },
    FETCH_BALANCE_STANDALONE: ({ commit, getters }) => {
        // use only 1 address
        return getBalance(getters.addressList[0].address)
            .then((balance) => {
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
