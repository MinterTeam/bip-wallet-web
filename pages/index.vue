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
                isDelegationLoading: true,
            };
        },
        computed: {
            ...mapState({
                txList: (state) => state.transactionListInfo.data.slice(0, 5),
                balance: 'balance',
                delegation: 'delegation',
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
        watch: {
            // update tx list on balance updated
            "$store.state.balance": function() {
                this.$store.dispatch('FETCH_TRANSACTION_LIST');
            },
        },
        beforeMount() {
            this.$store.dispatch('FETCH_TRANSACTION_LIST')
                .then(() => {
                    this.isTxListLoading = false;
                })
                .catch(() => {
                    this.isTxListLoading = false;
                });
            this.$store.dispatch('FETCH_DELEGATION')
                .then(() => {
                    this.isDelegationLoading = false;
                })
                .catch(() => {
                    this.isDelegationLoading = false;
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
            <div class="balance__value">
                <span class="balance__whole">{{ balanceParts.whole }}</span><span class="balance__decimal">{{ balanceParts.decimal }} {{ $store.getters.COIN_NAME }}</span>
            </div>
        </div>

        <nuxt-link class="balance balance--delegated u-container no-link" to="/delegations" v-if="delegation.data && delegation.data.length">
            <img class="balance--delegated__icon" src="/img/icon-arrow-right.svg" alt="" role="presentation">
            <div class="balance__caption">Delegated</div>
            <div class="balance__value">
                {{ delegation.meta.additional.total_delegated_bip_value | pretty }} {{ $store.getters.COIN_NAME }}
            </div>
        </nuxt-link>

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




