export default function ({store}) {
    if (process.server) {
        return;
    }
    if (store.getters.isUserWithProfile) {
        // async update
        store.dispatch('UPDATE_PROFILE');
    }

    return Promise.resolve();
}
