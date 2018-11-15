<script>
    import {generateMnemonic} from 'minterjs-wallet';
    import {addProfileAddress} from "~/api";
    import getTitle from '~/assets/get-title';
    import {addressEncryptedFromMnemonic} from "minter-js-org";
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
            addressAdded() {
                this.$router.push('/settings/addresses');
            },
            generateAddress() {
                const mnemonic = generateMnemonic();
                const newAddress = addressEncryptedFromMnemonic(mnemonic, this.$store.state.auth.password);
                addProfileAddress(newAddress)
                    .then(() => {
                        this.$router.push('/settings/addresses');
                    })
                    .catch(() => {
                        window.alert('Error saving address');
                    })
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

        <FormAddAdvancedAddress @addressAdded="addressAdded"/>

    </Layout>
</template>

