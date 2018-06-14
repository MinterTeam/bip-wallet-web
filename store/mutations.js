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
    DELETE_ADVANCED_ADDRESS: (state, addressHash) => {
        let indexToDelete;
        state.auth.advanced.some((address, index) => {
            if (address.address = addressHash) {
                indexToDelete = index;
                return true;
            }
        });
        state.auth.advanced.splice(indexToDelete, 1);
    },
    SET_MAIN_ADVANCED_ADDRESS: (state, addressHash) => {
        state.auth.advanced.some((address) => {
            if (address.address = addressHash) {
                address.isMain = true;
                return true;
            }
        });
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
