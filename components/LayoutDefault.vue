<script>
    /**
     * Nuxt way layout
     * @see https://github.com/nuxt/nuxt.js/issues/190#issuecomment-277304451
     * */
    import Navbar from '~/components/Navbar';

    export default {
        components: {
            Navbar,
        },
        props: {
            title: {
                type: String,
            },
            isBgWhite: {
                type: Boolean,
                default: false,
            },
            backUrl: {
                type: String,
            },
        },
        data() {
            return {
                isTestnetNoticeActive: window && !window.localStorage.getItem('minter-testnet-notice-hidden'),
            };
        },
        mounted() {
            // ssr fallback
            this.isTestnetNoticeActive = !window.localStorage.getItem('minter-testnet-notice-hidden');
        },
        methods: {
            testnetNoticeHide() {
                window.localStorage.setItem('minter-testnet-notice-hidden', 'true');
                this.isTestnetNoticeActive = false;
            },
        },
    };
</script>

<template>
    <div>
        <div class="testnet-notice" v-if="isTestnetNoticeActive">
            <div class="testnet-notice__container u-container u-container--large">
                <div class="testnet-notice__content">
                    <span class="testnet-notice__icon">👨🏻‍🔬</span>
                    <span class="testnet-notice__caption">You are using testnet version. <br class="u-hidden-mini-down"> Not&nbsp;real&nbsp;money</span>
                </div>
                <button class="testnet-notice__close u-semantic-button" @click="testnetNoticeHide">
                    <span class="testnet-notice__close-icon">Close</span>
                </button>
            </div>
        </div>

        <header class="header">
            <div class="toolbar-wrap">
                <slot name="toolbar">
                    <Navbar :title="title" :back-url="backUrl"/>
                </slot>
            </div>
            <div class="menu" v-if="$store.getters.isAuthorized">
                <menu class="menu__container u-container">
                    <li class="menu__item">
                        <nuxt-link class="menu__link" to="/" exact>Coins</nuxt-link>
                    </li>
                    <li class="menu__item">
                        <nuxt-link class="menu__link" to="/send">Send</nuxt-link>
                    </li>
                    <li class="menu__item">
                        <nuxt-link class="menu__link" to="/receive">Receive</nuxt-link>
                    </li>
                    <li class="menu__item">
                        <nuxt-link class="menu__link" to="/settings">Settings</nuxt-link>
                    </li>
                </menu>
            </div>
        </header>

        <div class="default-layout__content-wrap">
            <div class="default-layout__content" :class="{'u-bg-white': isBgWhite}">

                <slot></slot>

            </div>
        </div>

        <slot name="toast"></slot>
    </div>
</template>
