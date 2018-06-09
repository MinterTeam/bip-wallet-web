<script>
    import {getProfileAddressEncrypted} from "~/api";
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';

    export default {
        PAGE_TITLE: 'Manage Address',
        components: {
            Layout,
        },
        asyncData ({store, query, error }) {
            if (process.server) {
                return;
            }
            return getAddress(query.hash, store.state)
                .then((address) => ({
                    address,
                    isDataLoading: false,
                }))
                .catch((e) => {
                    // error({ statusCode: 404, message: 'Address not found' });
                });
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            }
        },
        data() {
            return {
                isDataLoading: true,
                address: null,
            }
        },
        beforeMount() {
            if (this.isDataLoading) {
                getAddress(this.$route.query.id, this.$store.state)
                    .then((address) => {
                        this.address = address;
                        this.isDataLoading = false;
                    })
                    .catch(() => {
                        this.isDataLoading = false;
                    });
            }
        },
        methods: {

        }
    }

    function getAddress(hash, state) {
        let advancedAddress;
        state.auth.advanced.some((address) => {
            if (address.address === hash) {
                advancedAddress = address;
                return true;
            }
        });

        if (advancedAddress) {
            return Promise.resolve(advancedAddress);
        } else {
            return getProfileAddressEncrypted(hash)
        }
    }
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" back-url="/settings/addresses">

        <div v-if="address">
            <div class="u-section">
                <div class="list-title">
                    <span>Address</span>
                </div>
                <div class="list">
                    <div class="list-item list-item--address__hash-large">
                        {{ address.address }}
                    </div>
                    <div class="list-item">
                        <div class="list-item__center">Secured by</div>
                        <div class="list-item__right">
                            <div class="list-item__label list-item__label--strong">{{ address.isServerSecured ? 'Bip Wallet' : 'You' }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <p class="u-container">This address is secured by {{ address.isServerSecured ? 'Bip Wallet' : 'You' }}. We recommend you to get full control over your address by using one of the following options:</p>
            <div class="u-section u-container">
                <div class="u-grid u-grid--vertical-margin">
                    <div class="u-cell">
                        <button class="bip-button bip-button--white">Back up Seed Phrase</button>
                    </div>
                    <div class="u-cell">
                        <button class="bip-button bip-button--white">Download JSON/UTC</button>
                    </div>
                    <div class="u-cell">
                        <button class="bip-button bip-button--white">Save Private Key</button>
                    </div>
                </div>
            </div>
            <hr>
            <div class="u-section u-container">
                <button class="bip-button bip-button--ghost-main">Remove Address</button>
            </div>
        </div>
        <div class="u-section u-container u-text-center" v-else-if="!isDataLoading">
            Address not found
        </div>


    </Layout>
</template>
