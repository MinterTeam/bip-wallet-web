import {setAuthToken} from "~/api/myminter";

export default {
    SET_AUTH: SET_AUTH,
    LOGOUT: (state) => {
        SET_AUTH(state, {});
    },
    SET_PROFILE: (state, profile) => {
        state.auth.user = profile;
    },
    PUSH_HISTORY: (state, historyItem) => {
        state.history.push(historyItem);
    },
    POP_HISTORY: (state) => {
        state.history.pop();
    },
}

function SET_AUTH(state, {mnemonic = '', user = {}, token = {}}) {
    state.auth.mnemonic = mnemonic;
    state.auth.user = user;
    state.auth.token = token;
    if (token && token.accessToken) {
        setAuthToken(token);
    }
}
