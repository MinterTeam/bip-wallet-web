<script>
    import * as clipboard from 'clipbrd';
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';
    import Toast from '~/components/Toast';
    import {pretty, shortHashFilter} from "~/assets/utils";

    export default {
        ideFix: null,
        PAGE_TITLE: 'Delegated Coins',
        components: {
            Layout,
            Toast,
        },
        filters: {
            pretty,
            short: shortHashFilter,
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            };
        },
        props: {

        },
        data() {
            return {
                isDelegationLoading: true,
                /** @type Array<DelegationItem>*/
                delegationList: this.$store.state.delegation.data || [],
                isToastVisible: false,
            };
        },
        computed: {
            /**
             * Split delegations to groups by validator
             * @return {Object.<string, Array<DelegationItem>>}
             */
            delegationListGroups() {
                if (!this.delegationList || !this.delegationList.length) {
                    return null;
                }
                return this.delegationList.reduce((accumulator, delegation) => {
                    const publicKey = delegation.validator.publicKey;
                    if (!accumulator[publicKey]) {
                        accumulator[publicKey] = [];
                    }
                    accumulator[publicKey].push(delegation);

                    return accumulator;
                }, {});
            },
            isClipboardSupported() {
                return clipboard.isSupported();
            },
        },
        beforeMount() {
            this.$store.dispatch('FETCH_DELEGATION')
                .then((delegationInfo) => {
                    this.delegationList = delegationInfo.data;
                    this.isDelegationLoading = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.isDelegationLoading = false;
                });
        },
        methods: {
            copy(str) {
                clipboard.copy(str);
                this.isToastVisible = true;
            },
        },
    };
</script>


<template>
    <Layout :title="$options.PAGE_TITLE">

        <div class="u-section" v-if="delegationListGroups">
            <template v-for="(delegationGroup, publicKey) in delegationListGroups">
                <div class="list" :key="'title' + publicKey">
                    <div class="list-item">
                        <!-- icon -->
                        <div class="list-item__left">
                            <img class="list-item__thumbnail" src="/img/icon-tx-delegate.svg" alt="" role="presentation">
                        </div>
                        <!-- name -->
                        <div class="list-item__center list-item__overflow">
                            <div class="list-item__sup">Public Key</div>
                            <div class="list-item__name u-text-nowrap">{{ publicKey | short }}</div>
                        </div>

                        <!-- amount -->
                        <div class="list-item__right" v-if="isClipboardSupported">
                            <button class="bip-link u-text-decent u-semantic-button" @click="copy(publicKey)">Copy</button>
                        </div>
                    </div>
                    <div class="list-item" v-for="delegation in delegationGroup" :key="publicKey + delegation.coin.id">
                        <div class="list-item__center">{{ delegation.coin.symbol }}</div>
                        <div class="list-item__right u-text-decent">{{ delegation.value | pretty}}</div>
                    </div>
                </div>
            </template>
        </div>
        <p class="u-section u-container u-text-center" v-else>
            <span v-if="isDelegationLoading">Loading…</span>
            <span v-else>No delegations yet</span>
        </p>

        <template slot="toast">
            <Toast text="Copied to clipboard" :isVisible.sync="isToastVisible"/>
        </template>

    </Layout>
</template>




