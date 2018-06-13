<script>
    import getTitle from '~/assets/get-title';
    import {generateMnemonic, addressFromMnemonic} from "~/assets/utils";
    import Layout from '~/components/LayoutDefault';
    import FormAddAdvancedAddress from '~/components/FormAddAdvancedAddress';

    export default {
        PAGE_TITLE: 'Add New Address',
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
            }
        },
        methods: {
            addAddress() {
                this.$router.push('/settings/addresses');
            },
            generateAddress() {
                this.$store.commit('ADD_AUTH_ADVANCED', addressFromMnemonic(generateMnemonic()));
                this.$router.push('/settings/addresses');
            }
        }
    }
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true" back-url="/settings/addresses">
        <div class="u-section u-container">
            <button class="bip-button bip-button--main" @click="generateAddress">Generate Address</button>
        </div>

        <div class="u-section-divider-text">
            <div class="u-section-divider-text__inner">or</div>
        </div>

        <FormAddAdvancedAddress @addressAdded="addAddress"/>

    </Layout>
</template>

