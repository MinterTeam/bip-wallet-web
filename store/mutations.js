import Vue from 'vue';
import {getTimeOffset} from '~/assets/axios-time-offset.js';

export default {
    ADD_AUTH_ADVANCED: (state, mnemonic) => {
        state.auth = mnemonic;
    },
    DELETE_ADVANCED_ADDRESS: (state, addressHash) => {
        state.auth = '';
    },
    LOGOUT: (state) => {
        state.auth = '';
        // clear data
        state.balance = [];
        state.transactionListInfo = {
            data: [],
            meta: {},
        };
    },
    SET_TRANSACTION_LIST: (state, txListInfo) => {
        state.transactionListInfo = txListInfo;
    },
    SET_BALANCE: (state, balanceList) => {
        state.balance = balanceList;
    },
    SET_BALANCE_TOTAL: (state, balanceData) => {
        state.totalBalanceSum = balanceData.totalBalanceSum;
        state.totalBalanceSumUsd = balanceData.totalBalanceSumUsd;
    },
    SET_BALANCE_DISPLAY_TYPE: (state, balanceDisplayType) => {
        state.balanceDisplayType = balanceDisplayType;
    },
    SET_LAST_UPDATE_TIME: (state, timestamp) => {
        state.lastUpdateTime = timestamp - getTimeOffset();
    },
    SET_DELEGATION: (state, delegation) => {
        state.delegation = delegation;
    },
    SET_AUTH_REDIRECT_PATH: (state, authRedirectPath) => {
        state.authRedirectPath = authRedirectPath;
    },
    PUSH_HISTORY: (state, historyItem) => {
        state.history.push(historyItem);
    },
    POP_HISTORY: (state) => {
        state.history.pop();
    },
};
