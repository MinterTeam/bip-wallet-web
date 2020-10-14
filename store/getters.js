import {isValidMnemonic, walletFromMnemonic} from 'minterjs-wallet';
import {decryptMnemonic} from 'minter-js-org';
import {getAvatarUrl, shortHashFilter} from "~/assets/utils";
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
        return state.auth.advanced && isValidMnemonic(state.auth.advanced.mnemonic);
    },
    /**
     * Checks if user is authorized by server
     * @return {boolean}
     */
    isUserWithProfile(state) {
        return !!state.auth.password;
    },
    addressList(state) {
        return [].concat(state.auth.advanced).concat(state.profileAddressList);
    },
    mainProfileAddress(state) {
        return state.profileAddressList.find((addressItem) => addressItem.isMain);
    },
    // pub(state, getters) {
    //     if (!getters.isAuthorized) {
    //         return '';
    //     }
    //     return getters.wallet.getPublicKeyString();
    // },
    wallet(state, getters) {
        if (getters.isUserAdvanced) {
            return walletFromMnemonic(state.auth.advanced.mnemonic);
        } else if (getters.isUserWithProfile && getters.mainProfileAddress && getters.mainProfileAddress.encrypted) {
            const profileMnemonic = decryptMnemonic(getters.mainProfileAddress.encrypted, state.auth.password);
            return walletFromMnemonic(profileMnemonic);
        }
        return null;
    },
    address(state, getters) {
        if (getters.isUserAdvanced) {
            return getters.wallet.getAddressString();
        } else {
            return getters.mainProfileAddress ? getters.mainProfileAddress.address : '';
        }
    },
    // addressUrl(state, getters) {
    //     return getExplorerAddressUrl(getters.address);
    // },
    mnemonic(state, getters) {
        return getters.wallet ? getters.wallet.getMnemonic() : '';
    },
    privateKey(state, getters) {
        return getters.wallet ? getters.wallet.getPrivateKeyString() : '';
    },
    username(state, getters) {
        if (getters.isUserWithProfile) {
            return state.user && '@' + state.user.username;
        } else {
            return shortHashFilter(getters.address, 4);
        }
    },
    // usernameLetter(state, getters) {
    //     return getNameLetter(getters.username);
    // },
    avatar(state, getters) {
        const avatarStored = state.user && state.user.avatar && state.user.avatar.src;
        const avatarByAddress = getters.address ? getAvatarUrl(getters.address) : '';
        // stored avatar first, bc. it can be changed manually after uploading new
        return avatarStored || avatarByAddress;
    },
    baseCoin(state) {
        return state.balance.find((coinItem) => {
            return coinItem.coin.symbol === COIN_NAME;
        });
    },
    /**
     * @return {string}
     */
    COIN_NAME() {
        return COIN_NAME;
    },
};
