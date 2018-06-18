import crypto from 'crypto';
import aesjs from 'aes-js';
import ethUtil from 'ethereumjs-util';
import {aesEncrypt, getPasswordToStore, prepareIV} from "~/assets/utils";

const mnemonic = "globe arrange forget twice potato nurse ice dwarf arctic piano scorpion tube";
const rawPassword = "123456";
const IV = "pjSfpWAjdSaYpOBy";
const MINTER_IV = 'Minter seed';
const encryptedMnemonic = "82678708bf256c89978a1705a3302c6258e2ae9bf9a0daad6982f2c02a6efb49f98ff01321c0252c389c9c2f56ea977653d8867ac42862c0e97524256dee50788224867e65079d4fc2b3a35fe8b425fa";
const encryptedMnemonicMinterIV = "f1ff80edb9c25d2385a6b9e441f6f9c010400db21231a7d3c25a864f7cde9ba3ce0da1e975b2d37380b912741beb4b882db411d4d3db5fe5e51483e93e6ecacd8e0372969096302d1f6b3c783482c1b0";

test('sha256 ethUtil length', () => {
    const shaPasswordBuffer = ethUtil.sha256(rawPassword);
    const shaPasswordHex = shaPasswordBuffer.toString('hex');
    const shaPasswordBytes = aesjs.utils.hex.toBytes(shaPasswordHex);
    expect(shaPasswordBuffer).toHaveLength(32);
    expect(shaPasswordBytes).toHaveLength(32);
    expect(shaPasswordHex).toEqual(ethUtil.setLengthLeft(shaPasswordBuffer, 32).toString('hex'));
});

test('sha256 ethUtil equal to crypto', () => {
    const passShaEth = ethUtil.sha256(rawPassword).toString('hex');
    const passShaCrypto = crypto.createHash('sha256').update(rawPassword, 'utf8').digest('hex');
    expect(passShaEth).toEqual(passShaCrypto);
});

test('to bytes aes-js', () => {
    const shaPasswordBuffer = ethUtil.sha256(rawPassword);
    const shaPasswordHex = shaPasswordBuffer.toString('hex');
    const passwordBytes = aesjs.utils.hex.toBytes(shaPasswordHex);
    expect(passwordBytes).toEqual(shaPasswordBuffer.toJSON().data);
});

test('aes encryption', () => {
    const hexPassword = getPasswordToStore(rawPassword);
    const bytesIV = prepareIV(IV);
    const result = aesEncrypt(mnemonic, hexPassword, bytesIV);
    expect(result).toEqual(encryptedMnemonic)
});

test('aes encryption, minter iv', () => {
    const hexPassword = getPasswordToStore(rawPassword);
    const bytesIV = prepareIV(MINTER_IV);
    const result = aesEncrypt(mnemonic, hexPassword, bytesIV);
    expect(result).toEqual(encryptedMnemonicMinterIV)
});


test('password to store should be 32 bytes length', () => {
    expect(aesjs.utils.hex.toBytes(getPasswordToStore(rawPassword))).toHaveLength(32);
});
