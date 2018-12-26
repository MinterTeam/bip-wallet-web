<script>
    import * as clipboard from 'clipbrd';
    import QrcodeVue from 'qrcode.vue';
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';
    import Toast from '~/components/Toast';

    export default {
        PAGE_TITLE: 'Receive Coins',
        components: {
            QrcodeVue,
            Layout,
            Toast,
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            };
        },
        data() {
            return {
                isAddressListLoading: true,
                isToastVisible: false,
            };
        },
        computed: {
            isClipboardSupported() {
                return clipboard.isSupported();
            },
            isShareSupported() {
                return window.navigator.share;
            },
        },
        beforeMount() {
            this.$store.dispatch('FETCH_PROFILE_ADDRESS_LIST')
                .then(() => {
                    this.isAddressListLoading = false;
                })
                .catch(() => {
                    this.isAddressListLoading = false;
                });

        },
        methods: {
            copy(str) {
                clipboard.copy(str);
                this.isToastVisible = true;
            },
            shareAddress() {
                window.navigator.share({
                    title: 'My address',
                    text: this.$store.getters.address,
                });
            },
        },
    };
</script>

<template>
    <Layout :title="$options.PAGE_TITLE">

        <div class="u-section">
            <div class="list-title">
                Your address
            </div>
            <div class="list">
                <div class="list-item">
                    <div class="list-item__center list-item--address__hash u-text-decent">{{ $store.getters.address }}</div>
                    <div class="list-item__right" v-if="isClipboardSupported">
                        <button class="bip-link u-text-decent u-semantic-button" @click="copy($store.getters.address)">Copy</button>
                    </div>
                </div>
                <div class="list-item">
                    <qrcode-vue class="list-item__center list-item--qr" :value="$store.getters.address" :size="160" level="L"/>
                </div>
            </div>
            <div class="u-section u-container" v-if="isShareSupported">
                <button class="bip-button bip-button--main" @click="shareAddress">Share Address</button>
            </div>
        </div>

        <template slot="toast">
            <Toast text="Copied to clipboard" :isVisible.sync="isToastVisible"/>
        </template>

    </Layout>
</template>
