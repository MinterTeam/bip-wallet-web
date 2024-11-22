// register env before other imports @see https://www.npmjs.com/package/dotenv#how-do-i-use-dotenv-with-import-
import 'dotenv/config';
import dotenv from 'dotenv';
import webpack from 'webpack';

const envConfig = dotenv.config();
const envConfigParsed = envConfig.error ? {} : envConfig.parsed;

import {BASE_TITLE, BASE_DESCRIPTION} from "./assets/variables";
import * as varsConfig from "./assets/variables.js";

const NUXT_LOADING_INLINE_SCRIPT_SHA = process.env.NODE_ENV === 'production'
    ? [
        // loader (minified)
        'tempUn1btibnrWwQxEk37lMGV1Nf8FO/GXxNhLEsPdg=',
        // module (minified)
        'yX/iyX7D+2AX+qF0YUk4EXLqu5fIbl/NS5QXjj9BX4M=',
        // window.___NUXT___ (prod)
        'YvYJ5WVzt8kOVVuSB9YcyVJLN4a6HcbOgQpzrg0BLUI=',
    ]
    : [
        // loader (not minified)
        '9VDmhXS8/iybLLyD3tql7v7NU5hn5+qvu9RRG41mugM=',
        // window.___NUXT___ (dev)
        'uMkuBZ4FQVVBqzs6NHOoGr/1vOLA1h9acPURz3E39HA=',
    ];

/**
 * prepare CSP string from env config
 * @param {Object} env - env config
 * @param {Function} keyFilter
 */
function prepareCSP(env, keyFilter) {
    // make array of filtered URLs
    const filteredKeys = Object.keys(env).filter(keyFilter);
    const filtered = filteredKeys.map((key) => env[key]).filter((item) => typeof item === 'string');

    const parsed = filtered.map((item) => {
        // remove path, remove query
        const hostname = item.replace(/(\w)\/.*$/, '$1').replace(/\?.*$/, '');
        // const domainParts = hostname.split('.');
        // const topLevelDomain = domainParts[domainParts.length - 2] + '.' + domainParts[domainParts.length - 1];
        // if (topLevelDomain !== hostname) {
        //     return '*.' + topLevelDomain;
        // } else {
        //     return topLevelDomain;
        // }
        return hostname;
    });

    const parsedUnique = parsed.filter((item, pos) => {
        return parsed.indexOf(item) === pos && parsed.indexOf('*.' + item) === -1;
    });

    return parsedUnique.join(' ');
}

const connectCSP = prepareCSP(varsConfig, (item) => {
    return item.indexOf('API_URL') >= 0 || item.indexOf('RTM_URL') >= 0 || item.indexOf('API_HOST') >= 0;
});
const imageCSP = prepareCSP(varsConfig, (item) => {
    return item === 'APP_ACCOUNTS_API_URL';
});
const scriptCSP = NUXT_LOADING_INLINE_SCRIPT_SHA.map((item) => {
    return `'sha256-${item}'`;
}).join(' ');


module.exports = {
    /*
    ** Headers of the page
    */
    head: {
        title: BASE_TITLE,
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            // unsafe-eval polluted by 'setimmediate' package
            {
                'http-equiv': 'Content-Security-Policy',
                content: `
                    default-src 'self' ${connectCSP};
                    script-src 'self' ${scriptCSP} 'unsafe-eval' https://telegram.org;
                    style-src 'self' 'unsafe-inline';
                    img-src 'self' ${imageCSP} *.minter.network data:;
                    font-src 'self' data:;
                    base-uri 'none';
                    form-action 'none';
                    report-uri https://csp-report-collector.minter.network https://1ba68dd21788a2dfc5522a62c6674f25.report-uri.com/r/d/csp/enforce;
                    report-to default;
                `,
            },
            { hid: 'description', name: 'description', content: BASE_DESCRIPTION },
            { hid: 'og-title', name: 'og:title', content: BASE_TITLE },
            { hid: 'og-description', name: 'og:description', content: BASE_DESCRIPTION },
            { hid: 'og-image', name: 'og:image', content: '/social-share.png' },
        ],
        link: [
            { rel: 'icon', href: '/favicon.png' },
            { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        ],
        script: [
            { src: 'https://telegram.org/js/telegram-web-app.js', async: true, defer: true },
            {
              innerHTML: `
                document.addEventListener('DOMContentLoaded', async () => {
                  if (window.Telegram && window.Telegram.WebApp) {
                    const webApp = window.Telegram.WebApp;
                    await webApp.ready();
                    webApp.setHeaderColor('#502ec2');
                  }
                });
              `,
              type: 'text/javascript'
            }
          ],
          __dangerouslyDisableSanitizersByTagID: {
            'custom-script': ['innerHTML']
          }
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
            'balance',
        ],
    },
    env: envConfigParsed,
    modules: [
        //'@nuxtjs/pwa'
    ],
    buildModules: [
        setVueAliasesModule,
    ],
    plugins: [
        { src: '~/plugins/composition-api.js'},
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
    modern: 'client',
    /*
    ** Build configuration
    */
    build: {
        watch: [
            './api/',
            // `./lang/`, // this watcher dont-work yet
        ],
        extend(config, { isDev, isClient, isServer }) {
            /*
            ** Run ESLint on save
            */
            // if (isDev && isClient) {
            //     config.module.rules.push({
            //         enforce: 'pre',
            //         test: /\.(js|vue)$/,
            //         loader: 'eslint-loader',
            //         exclude: /(node_modules)/,
            //     });
            // }
            if (!config.resolve) {
                config.resolve = {};
            }
            config.resolve.mainFields =  ['module', 'browser', 'main'];
        },
        plugins: [
            new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
        ],
        babel: {
            presets: [
                [
                    '@nuxt/babel-preset-app',
                    {
                        // targets: isServer ? { node: '10' } : { ie: '11' },
                        corejs: { version: 3 },
                    },
                ],
            ],
            plugins: [
                // '@babel/plugin-proposal-optional-chaining',
            ],
            // prevent @babel/plugin-transform-runtime from inserting `import` statement into commonjs files (bc. it breaks webpack)
            sourceType: 'unambiguous',
        },
        transpile: [
            /es6-promise|\.(?!(?:js|json)$).{1,5}$/i,
            '/base-x/',
            'date-fns/esm',
            'vue-simple-suggest/dist/es7',
            'vue-simple-suggest/lib',
            'centrifuge/src',
            'autonumeric/src',
            'vue-autonumeric/src',
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
        ],
    },
};


// @see https://github.com/nuxt-community/composition-api/blob/main/src/module/index.ts#L24
function setVueAliasesModule() {
    const nuxt = this.nuxt;
    const vueEntry =
        nuxt.options.alias.vue ||
        (nuxt.options.dev
            ? this.nuxt.resolver.resolveModule('vue/dist/vue.common.dev.js')
            : this.nuxt.resolver.resolveModule('vue/dist/vue.runtime.esm.js'));

    const vueAliases = Object.fromEntries(
        [
            // vue 2 dist files
            '.common.dev',
            '.common',
            '.common.prod',
            '.esm.browser',
            '.esm.browser.min',
            '.esm',
            '',
            '.min',
            '.runtime.common.dev',
            '.runtime.common',
            '.runtime.common.prod',
            '.runtime.esm',
            '.runtime',
            '.runtime.min',
        ]
            .flatMap((m) => [`vue/dist/vue${m}`, `vue/dist/vue${m}.js`])
            .map((m) => [m, vueEntry]),
    );

    nuxt.options.alias = {
        ...vueAliases,
        ...nuxt.options.alias,
        vue: vueEntry,
    };
}

