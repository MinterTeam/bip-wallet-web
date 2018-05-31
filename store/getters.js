import {getNameLetter, isValidMnemonic, walletFromMnemonic} from "~/assets/utils";

export default {
    /**
     * Checks if user is authorized
     * @return {boolean}
     */
    isAuthorized(state, getters) {
        return getters.isUserAdvanced || getters.isUserWithProfile;
    },
    /**
     * Checks if user is authorized by private key
     * @return {boolean}
     */
    isUserAdvanced(state) {
        return state.auth.mnemonic && isValidMnemonic(state.auth.mnemonic)
    },
    /**
     * Checks if user is authorized by server
     * @return {boolean}
     */
    isUserWithProfile(state) {
        return !!(state.auth.token && state.auth.token.accessToken);
    },
    /**
     * User wallet
     * @return {Wallet|null}
     */
    wallet(state, getters) {
        if (!getters.isAuthorized) {
            return null;
        }
        return walletFromMnemonic(state.auth.mnemonic);
    },
    /**
     * User address
     * @return {string}
     */
    address(state, getters) {
        if (!getters.isAuthorized) {
            return '';
        }
        return getters.wallet.getAddressString();
    },
    pub(state, getters) {
        if (!getters.isAuthorized) {
            return '';
        }
        return getters.wallet.getPublicKeyString();
    },
    username(state, getters) {
        return getters.isUserWithProfile ? '@' + state.auth.user.username : getters.address;
    },
    usernameLetter(state, getters) {
        return getNameLetter(getters.username);
    },
    avatar(state) {
        return state.auth.user && state.auth.user.avatar && state.auth.user.avatar.src;
    }

}
