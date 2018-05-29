export default function ({store, redirect, route}) {
    if (process.server) {
        return;
    }
    console.log('CHECK AUTH');
    console.log('-- route', route);
    console.log('-- fullPath', route.fullPath);
    // const urlRequiresAuth = ['/'].some((path) => {
    //     return path === route.fullPath;
    // });
    const urlRequiresNonAuth = /^\/auth(\/|$)/.test(route.fullPath);

    if (!store.getters.isAuthorized && !urlRequiresNonAuth) {
        console.log('-- restricted: redirect to auth');
        return redirect('/auth');
    }
    if (store.getters.isAuthorized && urlRequiresNonAuth) {
        console.log('-- restricted: redirect to index');
        return redirect('/');
    }
    console.log('-- not restricted');
    return Promise.resolve();
}
