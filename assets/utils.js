import decode from 'entity-decode';
import prettyNum from 'pretty-num';
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

/**
 * @param {string|number} value
 * @return {string}
 */
export function pretty(value) {
    if (value > 0.001 || value < -0.001) {
        return decode(prettyNum(value, {precision: 4, rounding: 'fixed', thousandsSeparator: '&thinsp;'}));
    } else {
        return decode(prettyNum(value, {precision: 2, rounding: 'significant', thousandsSeparator: '&thinsp;'}));
    }
}

/**
 * @param {string} value
 * @param {number} endLength
 * @param {number} minLengthToShort
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
 * @param {string} value
 * @return {string}
 */
export function txTypeFilter(value) {
    value = value.replace(/Data$/, ''); // remove "Data" from the end
    value = value.replace( /([A-Z])/g, " $1" ); // add space before capital letters
    value = value.toLowerCase(); // convert capitalized words to lower case
    value = value.charAt(0).toUpperCase() + value.slice(1); // capitalize the first letter
    return value;
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
    const time = format(toDate(timestamp), 'dd MMMM yyyy HH:mm:ss (O)');

    return time && time !== 'Invalid Date' ? time : false;
}
