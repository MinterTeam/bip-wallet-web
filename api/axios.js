import axios from 'axios'

const instance = axios.create({
    baseURL: 'https://my.beta.minter.network/api/v1/',
});

const TOKEN_KEY = 'auth-token';
const initialToken = JSON.parse(localStorage.getItem(TOKEN_KEY));
if (initialToken) {
    setAuthToken(initialToken);
} else {
    resetAuthToken();
}


export default instance;

/**
 * @param {TokenData} tokenData
 */
export function setAuthToken (tokenData) {
    instance.defaults.headers.common['Authorization'] = tokenData.type + ' ' + tokenData.accessToken;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
}

export function resetAuthToken () {
    delete instance.defaults.headers.common['Authorization'];
}
