import bip39 from 'bip39';
import hdkey from 'minterjs-wallet/dist/hdkey';
import ethUtil from 'ethereumjs-util';
import aesjs from 'aes-js';
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

export function addressEncryptedFromMnemonic(mnemonic, password, isMain = false) {
    const wallet = walletFromMnemonic(mnemonic);

    return {
        address: wallet.getAddressString(),
        encrypted: encryptMnemonic(mnemonic, password),
        isMain,
        isServerSecured: true,
    };
}

//@TODO check
const AES_IV = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]; // 16 bytes, should be same on all clients
export function encryptMnemonic(mnemonic, password) {
    const mnemonicBytes = aesjs.utils.utf8.toBytes(mnemonic);
    const passwordBytes = aesjs.utils.hex.toBytes(password);
    console.log(mnemonic, mnemonicBytes);
    const aesCbc = new aesjs.ModeOfOperation.cbc(passwordBytes, AES_IV);
    const encryptedBytes = aesCbc.encrypt(aesjs.padding.pkcs7.pad(mnemonicBytes));
    return aesjs.utils.hex.fromBytes(encryptedBytes);
}

export function decryptMnemonic(encrypted, password) {
    const encryptedBytes = aesjs.utils.hex.toBytes(encrypted);
    const passwordBytes = aesjs.utils.hex.toBytes(password);
    const aesCbc = new aesjs.ModeOfOperation.cbc(passwordBytes, AES_IV);
    const mnemonicBytes = aesjs.padding.pkcs7.strip(aesCbc.decrypt(encryptedBytes));
    return aesjs.utils.utf8.fromBytes(mnemonicBytes);
}

export function getPasswordToStore(password) {
    return getPaddedSha256Hex(password);
}

export function getPasswordToSend(storedPasswordHash) {
    return getPaddedSha256Hex(storedPasswordHash);
}

window.eth = ethUtil;
function getPaddedSha256Hex(value) {
    return ethUtil.setLengthLeft(ethUtil.sha256(value), 32).toString('hex');
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
