import {getNameLetter, isValidMnemonic} from "~/assets/utils";
import bip39 from 'bip39';
import ethhd from 'ethereumjs-wallet/hdkey'

export default {
    /**
     * Checks if user is authorized
     * @return {boolean}
     */
    isAuthorized(state) {
        // authorized by private key
        if (state.auth.mnemonic && isValidMnemonic(state.auth.mnemonic)) {
            return true;
        }
        // authorized by server
        if (state.auth.token && state.auth.token.accessToken) {
            return true;
        }
        return false;
    },
    /**
     * User wallet
     * @return {Wallet|null}
     */
    wallet(state, getters) {
        if (!getters.isAuthorized) {
            return null;
        }
        const seed = bip39.mnemonicToSeed(state.auth.mnemonic);
        return ethhd.fromMasterSeed(seed).derivePath("m/44'/60'/0'/0").deriveChild(0).getWallet();
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
        return state.auth.user && state.auth.user.username ? '@' + state.auth.user.username : getters.address;
    },
    usernameLetter(state, getters) {
        return getNameLetter(getters.username);
    },
    avatar(state) {
        return state.auth.user && state.auth.user.avatar && state.auth.user.avatar.src;
    }

}
