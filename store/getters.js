import {isValidMnemonic, walletFromMnemonic} from 'minterjs-wallet';
import {getNameLetter} from "~/assets/utils";
import {COIN_NAME} from '~/assets/variables';

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
        return state.auth.advanced.length && isValidMnemonic(state.auth.advanced[0].mnemonic);
    },
    /**
     * Checks if user is authorized by server
     * @return {boolean}
     */
    isUserWithProfile(state) {
        return !!(state.auth.token && state.auth.token.accessToken);
    },
    addressList(state) {
        return state.auth.advanced.concat(state.profileAddressList);
    },
    /**
     * User address hash
     * @return {string}
     */
    mainAdvancedAddress(state, getters) {
        if (!getters.isAuthorized) {
            return '';
        }
        let mainAddress = '';
        state.auth.advanced.some((address) => {
            if (address.isMain) {
                mainAddress = walletFromMnemonic(address.mnemonic).getAddressString();
                return true;
            }
        });
        return mainAddress;
    },
    // pub(state, getters) {
    //     if (!getters.isAuthorized) {
    //         return '';
    //     }
    //     return getters.wallet.getPublicKeyString();
    // },
    username(state, getters) {
        if (getters.isUserWithProfile) {
            return state.auth.user && '@' + state.auth.user.username;
        } else {
            return getters.mainAdvancedAddress;
        }
        // return getters.isUserWithProfile ? '@' + state.auth.user.username : getters.mainAdvancedAddress;
    },
    usernameLetter(state, getters) {
        return getNameLetter(getters.username);
    },
    avatar(state) {
        return state.auth.user && state.auth.user.avatar && state.auth.user.avatar.src;
    },
    baseCoin(state) {
        return state.balance.find((coinItem) => {
            return coinItem.coin === COIN_NAME;
        });
    },
    /**
     * @return {string}
     */
    COIN_NAME() {
        return COIN_NAME;
    },
};
