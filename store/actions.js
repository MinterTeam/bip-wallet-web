import {getProfile, getProfileAddressList, getTransactionList} from "~/api";
import explorer from "~/api/explorer";

export default {
    FETCH_PROFILE: ({ commit }) => {
        return getProfile()
            .then((profile) => commit('SET_PROFILE_USER', profile));
    },
    FETCH_PROFILE_ADDRESS_LIST: ({ commit, getters }) => {
        if (getters.isUserWithProfile) {
            return getProfileAddressList().then((addressList) => {
                commit('CHECK_MAIN_ADDRESS', addressList);
                commit('SET_PROFILE_ADDRESS_LIST', addressList);
                return addressList;
            });
        } else {
            return Promise.resolve();
        }
    },
    FETCH_TRANSACTION_LIST: ({ commit, dispatch, getters }) => {
        return new Promise((resolve, reject) => {
            dispatch('FETCH_PROFILE_ADDRESS_LIST')
                .then(() => {
                    getTransactionList({
                        addresses: getters.addressList.map((item) => item.address)
                    })
                        .then((txList) => {
                            commit('SET_TRANSACTION_LIST', txList);
                            resolve(txList);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    },
}
