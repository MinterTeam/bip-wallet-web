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
        return state.auth.advanced && state.auth.advanced.length && isValidMnemonic(state.auth.advanced[0].mnemonic);
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
    // mainAdvancedAddress(state, getters) {
    //     if (!getters.isAuthorized) {
    //         return '';
    //     }
    //     let mainAddress = '';
    //     state.auth.advanced.some((address) => {
    //         if (address.isMain) {
    //             mainAddress = walletFromMnemonic(address.mnemonic).getAddressString();
    //             return true;
    //         }
    //     });
    //     return mainAddress;
    // },
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
            return walletFromMnemonic(state.auth.advanced.find((addressItem) => addressItem.isMain).mnemonic);
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
            return state.auth.user && '@' + state.auth.user.username;
        } else {
            return shortHashFilter(getters.address, 4);
        }
        // return getters.isUserWithProfile ? '@' + state.auth.user.username : getters.mainAdvancedAddress;
    },
    // usernameLetter(state, getters) {
    //     return getNameLetter(getters.username);
    // },
    avatar(state, getters) {
        const avatarStored = state.auth.user && state.auth.user.avatar && state.auth.user.avatar.src;
        const avatarByAddress = getters.address ? getAvatarUrl(getters.address) : '';
        // stored avatar first, bc. it can be changed manually after uploading new
        return avatarStored || avatarByAddress;
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
