const dotenv = require('dotenv');

const envConfig = dotenv.config();

import {BASE_TITLE, BASE_DESCRIPTION} from "./assets/variables";

module.exports = {
    /*
    ** Headers of the page
    */
    head: {
        title: BASE_TITLE,
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: BASE_DESCRIPTION },
            { hid: 'og-title', name: 'og:title', content: BASE_TITLE },
            { hid: 'og-description', name: 'og:description', content: BASE_DESCRIPTION },
            { hid: 'og-image', name: 'og:image', content: '/social-share.png' },
        ],
        link: [
            { rel: 'icon', href: '/favicon.png' },
            { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        ],
    },
    css: [
        './static/css/style.min.css',
    ],
    /*
    ** Customize the progress bar color
    */
    loading: { color: '#FFA05D' },
    router: {
        linkActiveClass: 'is-active-inner',
        linkExactActiveClass: 'is-active',
        //@TODO middlewares not working properly with nuxt generate @see https://github.com/nuxt/nuxt.js/issues/2653
        middleware: [
            'auth',
            'history',
            'profile',
        ],
    },
    env: envConfig.error ? {} : envConfig.parsed,
    modules: [
        //'@nuxtjs/pwa'
    ],
    plugins: [
        { src: '~/plugins/persistedState.js', ssr: false },
    ],
    /*
    ** PWA manifest
     */
    manifest: {
        name: BASE_TITLE,
        short_name: BASE_TITLE,
        lang: 'en',
    },
    /*
    ** PWA meta
     */
    meta: {
        mobileAppIOS: true,
        name: BASE_TITLE,
        author: 'Minter',
        favicon: false,
    },
    /*
    ** Build configuration
    */
    build: {
        transpile: [/es6-promise|\.(?!(?:js|json)$).{1,5}$/i, /^v-file-input\/src/, /^date-fns\/esm/, /^lodash-es/],
    },
};
