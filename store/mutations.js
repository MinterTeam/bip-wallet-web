import {setAuthToken} from "~/api/myminter";

export default {
    SET_AUTH_PROFILE: (state, {user, token}) => {
        state.auth.user = user;
        state.auth.token = token;
        setAuthToken(token);
    },
    ADD_AUTH_ADVANCED: (state, address) => {
        state.auth.advanced.push(address);
    },
    LOGOUT: (state) => {
        state.auth.user = {};
        state.auth.token = {};
        state.auth.advanced = [];
    },
    SET_PROFILE: (state, profile) => {
        state.auth.user = profile;
    },
    CHECK_MAIN_ADDRESS: (state, newProfileAddressList) => {
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
    },
    SET_PROFILE_ADDRESS_LIST: (state, addressList) => {
        state.profileAddressList = addressList;
    },
    SET_TRANSACTION_LIST: (state, txList) => {
        state.transactionList = txList;
    },
    PUSH_HISTORY: (state, historyItem) => {
        state.history.push(historyItem);
    },
    POP_HISTORY: (state) => {
        state.history.pop();
    },
}
