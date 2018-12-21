import Vue from 'vue';
import {setAuthToken} from "~/api/minterorg";

export default {
    SET_AUTH_PROFILE: (state, {user, token, password}) => {
        SET_PROFILE_USER(state, user);
        state.auth.token = token;
        state.auth.password = password;
        setAuthToken(token);
    },
    ADD_AUTH_ADVANCED: (state, address) => {
        state.auth.advanced.push(address);
    },
    DELETE_ADVANCED_ADDRESS: (state, addressHash) => {
        state.auth.advanced.some((address, index) => {
            if (address.address === addressHash) {
                state.auth.advanced.splice(index, 1);
                return true;
            }
        });
    },
    SET_MAIN_ADVANCED_ADDRESS: (state, addressHash) => {
        state.auth.advanced.some((address) => {
            if (address.address === addressHash) {
                address.isMain = true;
                return true;
            }
        });
    },
    LOGOUT: (state) => {
        state.auth.user = {};
        state.auth.token = {};
        state.auth.password = null;
        state.auth.advanced = [];
        // clear data
        state.balance = [];
        state.profileAddressList = [];
        state.transactionListInfo = {
            data: [],
            meta: {},
        };
    },
    SET_PROFILE_USER,
    UPDATE_PROFILE_PASSWORD: (state, password) => {
        state.auth.password = password;
    },
    CHECK_MAIN_ADDRESS,
    SET_PROFILE_ADDRESS_LIST: (state, addressList) => {
        CHECK_MAIN_ADDRESS(state, addressList);
        state.profileAddressList = addressList;
    },
    SET_PROFILE_ADDRESS_ENCRYPTED: (state, address) => {
        state.profileAddressList.some((addressItem, index) => {
            if (addressItem.id === address.id) {
                // use Array instance methods to notify Vue reactivity system
                state.profileAddressList.splice(index, 1, address);
                return true;
            }
        });

    },
    SET_TRANSACTION_LIST: (state, txListInfo) => {
        state.transactionListInfo = txListInfo;
    },
    SET_BALANCE: (state, balance) => {
        state.balance = balance;
    },
    ADD_USER,
    PUSH_HISTORY: (state, historyItem) => {
        state.history.push(historyItem);
    },
    POP_HISTORY: (state) => {
        state.history.pop();
    },
};

function SET_PROFILE_USER(state, profile) {
    state.auth.user = profile;
    if (profile.mainAddress && profile.mainAddress.address) {
        ADD_USER(state, {address: profile.mainAddress.address, user: profile});
    }
}

function CHECK_MAIN_ADDRESS(state, newProfileAddressList) {
    let isProfileAddressMain = newProfileAddressList.some((address) => {
        if (address.isMain) {
            return true;
        }
    });
    if (isProfileAddressMain) {
        state.auth.advanced.forEach((address) => {
            address.isMain = false;
        });
    }
}

/**
 * @param state
 * @param {UserInfo} userInfo
 */
function ADD_USER(state, userInfo) {
    Vue.set(state.userList, userInfo.address, userInfo.user);
}
