<script>
    import {mapState} from 'vuex';
    import VOnsPage from 'vue-onsenui/esm/components/VOnsPage';
    import VOnsTabbar from 'vue-onsenui/esm/components/VOnsTabbar';
    import VOnsTab from 'vue-onsenui/esm/components/VOnsTab';
    import getTitle from '~/assets/get-title';
    import {getExplorerTxUrl} from '~/assets/utils';
    import Layout from '~/components/LayoutDefault';
    import ConvertSell from '~/components/ConvertSell';
    import ConvertBuy from '~/components/ConvertBuy';
    import Modal from '~/components/Modal';

    export default {
        PAGE_TITLE: 'Convert Coins',
        components: {
            VOnsPage,
            VOnsTabbar,
            VOnsTab,
            Layout,
            ConvertSell,
            ConvertBuy,
            Modal,
        },

        directives: {

        },
        filters: {

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
                // activeIndex: 0,
                isSuccessModalOpen: false,
                successHash: '',
            };
        },
        computed: {
            ...mapState({
                balance: 'balance',
            }),
        },
        beforeCreate() {
            this.$ons.platform.select('android'); // Or any other method
        },
        methods: {
            openSuccessModal({hash}) {
                this.successHash = hash;
                this.isSuccessModalOpen = true;
            },
            getExplorerTxUrl,
        },


    };
</script>

<template id="main">
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true">
        <v-ons-tabbar class="ons-tabbar" v-if="balance && balance.length">
            <v-ons-tab label="Sell"/>
            <v-ons-tab label="Buy"/>

            <template slot="pages">
                <v-ons-page>
                    <ConvertSell @successTx="openSuccessModal"/>
                </v-ons-page>
                <v-ons-page>
                    <ConvertBuy @successTx="openSuccessModal"/>
                </v-ons-page>
            </template>
        </v-ons-tabbar>

        <div class="u-section u-container" v-else>
            No coins to exchange
            <!--<span v-if="isBalanceLoading">Loading…</span>
            <span v-else>No coins to send</span>-->
        </div>

        <!-- success modal -->
        <Modal :isOpen.sync="isSuccessModalOpen" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Success</h3>
                <div class="modal__content">
                    <p>Coins successfully exchanged!</p>
                </div>
                <div class="modal__footer">
                    <a class="bip-button bip-button--ghost-main" :href="getExplorerTxUrl(successHash)" target="_blank">View Transaction</a>
                    <button class="bip-button bip-button--ghost-main" @click="isSuccessModalOpen = false">Close</button>
                </div>
            </div>
        </Modal>

    </Layout>
</template>
