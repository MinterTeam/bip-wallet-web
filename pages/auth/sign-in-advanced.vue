<script>
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';
    import FormAddAdvancedAddress from '~/components/FormAddAdvancedAddress';

    export default {
        PAGE_TITLE: 'Advanced Mode',
        components: {
            Layout,
            FormAddAdvancedAddress,
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            };
        },
        methods: {
            authorize() {
                // redirect
                const authRedirectPath = this.$store.state.authRedirectPath || '/';
                this.$store.commit('SET_AUTH_REDIRECT_PATH', '');
                this.$router.push(authRedirectPath);
            },
        },
    };
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true" back-url="/auth">

        <div class="u-section u-container">
            <nuxt-link class="bip-button bip-button--main" to="/auth/create-wallet-advanced/">Generate Address</nuxt-link>
        </div>

        <div class="u-section-divider-text">
            <div class="u-section-divider-text__inner">or</div>
        </div>

        <FormAddAdvancedAddress :isAuthAddress="true" @addressAdded="authorize"/>

    </Layout>
</template>

