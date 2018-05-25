import {setAuthToken} from "~/api/axios";

export default {
    AUTH,
    LOGOUT: (state) => {
        AUTH(state, {});
    },
    PUSH_HISTORY: (state, historyItem) => {
        state.history.push(historyItem);
    },
    POP_HISTORY: (state) => {
        state.history.pop();
    },
}

function AUTH(state, {mnemonic = '', user = {}, token = {}}) {
    state.auth.mnemonic = mnemonic;
    state.auth.user = user;
    state.auth.token = token;
    if (token && token.accessToken) {
        setAuthToken(token);
    }
}
