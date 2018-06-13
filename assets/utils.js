import bip39 from 'bip39';
import hdkey from 'minterjs-wallet/dist/hdkey';
import thousands from 'thousands';
import decode from 'entity-decode';


export function generateMnemonic() {
    return bip39.generateMnemonic();
}

/**
 * Check that mnemonic phrase has 12 words and represents valid entropy
 * @param {string} mnemonic
 * @return {boolean}
 */
export function isValidMnemonic(mnemonic) {
    return mnemonic.trim().split(/\s+/g).length >= 12 && bip39.validateMnemonic(mnemonic)
}

export function walletFromMnemonic(mnemonic) {
    const seed = bip39.mnemonicToSeed(mnemonic);
    return hdkey.fromMasterSeed(seed).derivePath("m/44'/60'/0'/0").deriveChild(0).getWallet();
}

export function addressFromMnemonic(mnemonic, isMain = false) {
    const wallet = walletFromMnemonic(mnemonic);

    return {
        address: wallet.getAddressString(),
        mnemonic,
        isMain,
        isServerSecured: false,
    };
}

/**
 * Get first letter fron name string
 * @param {string} name
 * @return {string}
 */
export function getNameLetter(name) {
    return name.replace(/^@/, '').replace(/^Mx/, '')[0];
}

export function thousandsFilter(value) {
    return decode(thousands(value, '&thinsp;'));
}

export function removeEmptyKeys(obj) {
    let result = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key]) {
            result[key] = obj[key];
        }
    });

    return result;
}

/**
 * Make function to accept imask values
 * @param {string} propName
 * @param {boolean} [isAcceptUnmasked]
 * @return {Function}
 */
export function makeAccepter(propName, isAcceptUnmasked) {
    return function(e) {
        this.form[propName] = isAcceptUnmasked ? e.detail._unmaskedValue : e.detail._value;
    }
}
