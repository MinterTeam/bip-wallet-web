import thousands from 'thousands';
import decode from 'entity-decode';
import toDate from "date-fns/esm/toDate";
import format from "date-fns/esm/format";



/**
 * Get first letter from name string
 * @param {string} name
 * @return {string}
 */
export function getNameLetter(name) {
    return name && name.replace(/^@/, '').replace(/^Mx/, '')[0];
}

export function thousandsFilter(value) {
    return decode(thousands(value, '&thinsp;'));
}

export function getLocaleString(value) {
    return decode(value.toLocaleString().replace(' ', '&thinsp;'));
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


export function getTimeStamp(timestamp) {
    const time = format(toDate(timestamp), 'dd MMMM yyyy HH:mm:ss (O)');

    return time && time !== 'Invalid Date' ? time : false;
}
