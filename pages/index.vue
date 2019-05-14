<script>
    import {mapGetters, mapState} from 'vuex';
    import {getCoinIconUrl, pretty} from "~/assets/utils";
    import Layout from '~/components/LayoutDefault';
    import TransactionTable from "~/components/TransactionTable";

    export default {
        components: {
            Layout,
            TransactionTable,
        },
        filters: {
            pretty,
            uppercase: (value) => value.toUpperCase(),
        },
        props: {

        },
        data() {
            return {
                isTxListLoading: true,
                isBalanceLoading: true,
            };
        },
        computed: {
            ...mapState({
                txList: (state) => state.transactionListInfo.data.slice(0, 5),
                balance: 'balance',
            }),
            ...mapGetters([
                'username',
                'address',
                'baseCoin',
            ]),
            balanceParts() {
                const parts = this.baseCoin ? pretty(this.baseCoin.amount).split('.') : [];
                return {
                    whole:  parts[0] ? parts[0] : 0,
                    decimal: parts[1] ? '.' + parts[1] : '',
                };
            },
        },
        beforeMount() {
            this.$store.dispatch('FETCH_PROFILE_ADDRESS_LIST')
                .then(() => {
                    this.$store.dispatch('FETCH_TRANSACTION_LIST_STANDALONE')
                        .then(() => {
                            this.isTxListLoading = false;
                        })
                        .catch(() => {
                            this.isTxListLoading = false;
                        });
                    this.$store.dispatch('FETCH_BALANCE_STANDALONE')
                        .then(() => {
                            this.isBalanceLoading = false;
                        })
                        .catch(() => {
                            this.isBalanceLoading = false;
                        });
                })
                .catch(() => {
                    this.isTxListLoading = false;
                    this.isBalanceLoading = false;
                });
        },
        methods: {
            getCoinIconUrl,
        },
    };
</script>


<template>
    <Layout :is-bg-white="true">
        <template slot="toolbar">
            <div class="toolbar u-container">
                <div class="toolbar__left toolbar__left--logo">
                    <img class="toolbar-logo" src="/img/bip-logo.svg" alt="Bip" width="42"/>
                </div>
                <div class="toolbar__right">
                    <nuxt-link class="toolbar-button user" to="/settings">
                        <div class="user__name">{{ username }}</div>
                        <div class="user__avatar avatar"
                             :style="{backgroundImage: `url('${$store.getters.avatar}')`}"
                        ></div>

                    </nuxt-link>
                </div>
            </div>
        </template>


        <div class="balance u-container">
            <div class="balance__caption">My Balance</div>
            <div>
                <span class="balance__whole">{{ balanceParts.whole }}</span><span class="balance__decimal">{{ balanceParts.decimal }} {{ $store.getters.COIN_NAME }}</span>
            </div>
        </div>

        <div class="u-section">
            <template v-if="txList && txList.length">
                <div class="list-title list-title--bold">Latest Transactions</div>
                <TransactionTable :transaction-list="txList"/>
                <div class="u-container u-section--small">
                    <nuxt-link class="bip-button bip-button--ghost-main" to="/transactions">All Transactions</nuxt-link>
                </div>
            </template>

            <template v-if="balance && balance.length">
                <div class="list-title list-title--bold">My coins</div>
                <ul class="list">
                    <li class="list-item" v-for="coin in balance" :key="coin.coin">
                        <div class="list-item__left">
                            <img class="list-item__thumbnail" :src="getCoinIconUrl(coin.coin)" alt="" role="presentation">
                        </div>
                        <div class="list-item__center">
                            <div class="list-item__name">{{ coin.name || coin.coin }}</div>
                        </div>
                        <div class="list-item__right">
                            <div class="list-item__amount">{{ coin.amount | pretty }}</div>
                            <div class="list-item__sub">{{ coin.coin | uppercase }}</div>
                        </div>
                    </li>
                </ul>
                <div class="u-container u-section--small">
                    <nuxt-link class="bip-button bip-button--ghost-main" to="/convert">Convert</nuxt-link>
                </div>
            </template>
        </div>
    </Layout>
</template>




