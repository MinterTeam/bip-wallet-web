import decode from 'entity-decode';
import prettyNum, {PRECISION_SETTING} from 'pretty-num';
import stripZeros from 'pretty-num/src/strip-zeros';
import fromExponential from 'from-exponential';
import parseISO from "date-fns/esm/parseISO";
import format from "date-fns/esm/format";
import {txTypeList} from 'minterjs-tx/src/tx-types';
import {EXPLORER_HOST, ACCOUNTS_API_URL} from "~/assets/variables";



export function getAvatarUrl(address) {
    return `${ACCOUNTS_API_URL}avatar/by/address/${address}`;
}

export function getCoinIconUrl(coinSymbol) {
    return `${ACCOUNTS_API_URL}avatar/by/coin/${coinSymbol}`;
}


// /**
//  * Get first letter from name string
//  * @param {string} name
//  * @return {string}
//  */
// export function getNameLetter(name) {
//     return name && name.replace(/^@/, '').replace(/^Mx/, '')[0];
// }

export function getExplorerBlockUrl(block) {
    return EXPLORER_HOST + '/blocks/' + block;
}

export function getExplorerTxUrl(hash) {
    return EXPLORER_HOST + '/transactions/' + hash;
}

export function getExplorerAddressUrl(address) {
    return EXPLORER_HOST + '/address/' + address;
}

/**
 * @param {string|number} value
 * @return {string}
 */
export function pretty(value) {
    const PRECISION = 2;
    const parts = stripZeros(fromExponential(value)).split('.');
    const isReduced = parts[1] && parts[1].length > PRECISION;
    const isSmall = parts[0] === '0';
    const formattedValue = decode(prettyNum(value, {precision: PRECISION, precisionSetting: PRECISION_SETTING.FIXED, thousandsSeparator: '&#x202F;'}));
    return (isReduced && isSmall ? '~' : '') + formattedValue;
}

/**
 * Ensure value to have minimum 4 decimal digits
 * @param {string|number} value
 * @return {string}
 */
export function prettyExact(value) {
    return decode(prettyNum(value, {precision: 8, precisionSetting: PRECISION_SETTING.FIXED, thousandsSeparator: '&#x202F;'}));
}

/**
 * @param {string} value
 * @param {number} [endLength]
 * @param {number} [minLengthToShort]
 * @return {string}
 */
export function shortHashFilter(value, endLength = 6, minLengthToShort) {
    const startLength = endLength + 'Mx'.length;
    minLengthToShort = minLengthToShort || startLength + endLength;
    value = value.toString();
    const isLong = value.length > minLengthToShort;

    return isLong ? value.substr(0, startLength) + '…' + value.substr(-endLength) : value;
}

/**
 * @param {number} value
 * @return {string}
 */
export function txTypeFilter(value) {
    let name = txTypeList[value].name; // get type name
    name = name.charAt(0).toUpperCase() + name.slice(1); // capitalize the first letter
    return name;
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
    };
}


export function getTimeStamp(timestamp) {
    const time = format(parseISO(timestamp), 'dd MMMM yyyy HH:mm:ss (O)');

    return time && time !== 'Invalid Date' ? time : false;
}

export function fromBase64(str) {
    //@TODO utf8 https://github.com/dankogai/js-base64
    const asci = window.atob(str);
    try {
        return decodeURIComponent(escape(asci));
    } catch (e) {
        return asci;
    }
}
