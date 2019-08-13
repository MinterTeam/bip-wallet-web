import {hasAuthToken} from "~/api/accounts";

export default function({store, redirect}) {
    if (process.server) {
        return Promise.resolve();
    }

    if (store.getters.isUserAdvanced) {
        return Promise.resolve();
    }
    if (hasAuthToken()) {
        // wait for profile, bc its data need for most pages
        return store.dispatch('FETCH_PROFILE')
            .catch((resError) => {
                // Unauthorized: logout bc. auth data is not approved by server
                console.log(resError, resError.response);
                if (resError.response && resError.response.status === 401) {
                    store.commit('LOGOUT');
                    redirect('/auth');
                } else {
                    throw resError;
                }
            })
            .then(() => store.dispatch('FETCH_PROFILE_ADDRESS_LIST'));
    } else if (store.getters.isUserWithProfile) {
        // no auth token but password stored
        store.commit('LOGOUT');
    }

    return Promise.resolve();
}
