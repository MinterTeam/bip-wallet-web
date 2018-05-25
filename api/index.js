import axios from '~/api/axios';

const formDataHeaders = { 'Content-Type': 'multipart/form-data' };

export function register(data) {
    return new Promise((resolve, reject) => {
        axios.post('register', makeFormData(data), {headers: formDataHeaders})
            .then(() => {
                login(data)
                    .then(resolve)
                    .catch(reject);
            })
            .catch(reject);
    });
}

export function login({username, password}) {
    return axios.post('login', makeFormData({
            clientId: 1,
            clientSecret: 'v2TemZZ3yWgoPZVGyJ2LEsCtjb9lwaGvV53kEnhZ',
            username,
            password,
        }), {headers: formDataHeaders})
        .then((response) => response.data.data);
}


function makeFormData(data) {
    let formData = new FormData();
    Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
    });

    return formData;
}


