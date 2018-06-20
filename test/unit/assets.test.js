import crypto from 'crypto';
import aesjs from 'aes-js';
import ethUtil from 'ethereumjs-util';
import {Buffer} from 'safe-buffer';
import {aesEncrypt, getPasswordToStore, getPasswordToSend, prepareIV} from "~/assets/utils";

const mnemonic = "globe arrange forget twice potato nurse ice dwarf arctic piano scorpion tube";
const rawPassword = "123456";
const IV = "pjSfpWAjdSaYpOBy";
const MINTER_IV = 'Minter seed';
const encryptedMnemonic = "82678708bf256c89978a1705a3302c6258e2ae9bf9a0daad6982f2c02a6efb49f98ff01321c0252c389c9c2f56ea977653d8867ac42862c0e97524256dee50788224867e65079d4fc2b3a35fe8b425fa";
const encryptedMnemonicMinterIV = "e28513acd2336aa048b68cf382a45ec0bc7bed1e7d35f2b7bf0b6c1406e6f3c57fc91c08ba972f7ed82050e54867e1624b2e2f145aa8d0a40d51ad4eb258faa7e2a9ccaed555d15d7830df188897c054";

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

test('prepare iv', () => {
    const bytesIV = prepareIV(MINTER_IV);
    expect(aesjs.utils.hex.fromBytes(bytesIV)).toEqual('4d696e74657220736565640000000000')
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

    const textBytes = aesjs.utils.utf8.toBytes(mnemonic);
    const keyBytes = aesjs.utils.hex.toBytes(hexPassword);
    const aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, bytesIV);
    const encryptedBytes = aesCbc.encrypt(aesjs.padding.pkcs7.pad(textBytes));
    const resultBySteps = aesjs.utils.hex.fromBytes(encryptedBytes);

    expect(result).toEqual(resultBySteps);
    expect(result).toEqual(encryptedMnemonicMinterIV);
});


test('password to store should be 32 bytes length', () => {
    const storePassword = getPasswordToStore(rawPassword);
    expect(aesjs.utils.hex.toBytes(storePassword)).toHaveLength(32);
    expect(storePassword).toEqual('8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
});

test('password to send', () => {
    const storePassword = getPasswordToStore(rawPassword);
    const sendPassword = getPasswordToSend(storePassword);
    expect(aesjs.utils.hex.toBytes(sendPassword)).toHaveLength(32);
    expect(sendPassword).toEqual('49dc52e6bf2abe5ef6e2bb5b0f1ee2d765b922ae6cc8b95d39dc06c21c848f8c');
});
