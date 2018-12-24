<script>
    import getTitle from '~/assets/get-title';

    export default {
        PAGE_TITLE: 'Auth',
        layout: 'splash',
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            };
        },
    };
</script>

<template>
    <div class="auth-page">
        <div class="auth__logo-container">
            <img class="auth__logo" src="/img/bip-logo.svg" alt="Bip">
        </div>

        <div class="u-section u-container">
            <div class="u-grid u-grid--vertical-margin">
                <div class="u-cell">
                    <nuxt-link to="/auth/create-wallet" class="bip-button bip-button--white">Create Wallet</nuxt-link>
                </div>
                <div class="u-cell">
                    <nuxt-link to="/auth/sign-in-advanced" class="bip-button bip-button--ghost-white">Advanced Mode</nuxt-link>
                </div>
                <div class="u-cell u-cell--1-2">
                    <nuxt-link to="/auth/sign-in" class="bip-button bip-button--ghost-white">Sign In</nuxt-link>
                </div>
                <div class="u-cell u-cell--1-2">
                    <a href="https://help.minter.network" class="bip-button bip-button--ghost-white" target="_blank">Help</a>
                </div>
            </div>
        </div>

    </div>
</template>
