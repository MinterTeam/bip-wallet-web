const dotenv = require('dotenv');

const envConfig = dotenv.config();

import {BASE_TITLE, BASE_DESCRIPTION} from "./assets/variables";

const NUXT_LOADING_INLINE_SCRIPT_SHA = process.env === 'production' ? 'tempUn1btibnrWwQxEk37lMGV1Nf8FO/GXxNhLEsPdg=' : 'boxyvYX4ButGhwNqfdpXtx/7RJdIvBO4KMxG+v2zKFo=';


module.exports = {
    /*
    ** Headers of the page
    */
    head: {
        title: BASE_TITLE,
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { 'http-equiv': 'Content-Security-Policy', content: `default-src 'self' https://*.minter.network https://minter.org; script-src 'self' 'sha256-${NUXT_LOADING_INLINE_SCRIPT_SHA}' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https://*.minter.network data:; font-src 'self' data:; base-uri 'none'; form-action 'none';`},

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
    loading: { color: '#502EC2' },
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
        { src: '~/plugins/custom-event-polyfill.js', ssr: false },
        { src: '~/plugins/persistedState.js', ssr: false },
        { src: '~/plugins/vue-onsen.js', ssr: false },
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
        watch: [
            './api/',
            // `./lang/`, // this watcher dont-work yet
        ],
        babel: {
            presets: ['@nuxt/babel-preset-app'],
            // prevent @babel/plugin-transform-runtime from inserting `import` statement into commonjs files (bc. it breaks webpack)
            sourceType: 'unambiguous',
        },
        transpile: [
            /es6-promise|\.(?!(?:js|json)$).{1,5}$/i,
            '/base-x/',
            'date-fns/esm',
            'lodash-es',
            // 'nuxt-i18n/src',
            'v-file-input/src',
            'clipbrd/src',
            'pretty-num/src',
            'from-exponential/src',
            'minterjs-util',
            'minterjs-tx',
            'minterjs-wallet',
            'minter-js-sdk',
            'minter-js-org',
        ],
    },
};
