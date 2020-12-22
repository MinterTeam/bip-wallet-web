<script>
    import {mapGetters, mapState} from 'vuex';
    import {getCoinIconUrl, pretty, getTimeDistance} from "~/assets/utils";
    import Layout from '~/components/LayoutDefault';
    import TransactionTable from "~/components/TransactionTable";

    const BALANCE_DISPLAY_BIP = 1;
    const BALANCE_DISPLAY_TOTAL = 2;
    const BALANCE_DISPLAY_TOTAL_USD = 3;

    let timeInterval = null;

    export default {
        ideFix: null,
        BALANCE_DISPLAY_BIP,
        BALANCE_DISPLAY_TOTAL,
        BALANCE_DISPLAY_TOTAL_USD,
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
                balanceDisplayType: this.$store.state.balanceDisplayType || BALANCE_DISPLAY_BIP,
                isTxListLoading: true,
                isDelegationLoading: true,
                lastUpdateTimeDistance: this.getLastUpdateTimeDistance(),
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
            delegatedTotal() {
                return this.delegation.meta ? this.delegation.meta.additional.totalDelegatedBipValue : 0;
            },
            balanceParts() {
                let balance;
                if (this.balanceDisplayType === BALANCE_DISPLAY_BIP) {
                    balance = this.baseCoin ? this.baseCoin.amount : 0;
                } else if (this.balanceDisplayType === BALANCE_DISPLAY_TOTAL) {
                    balance = this.$store.state.totalBalanceSum;
                } else if (this.balanceDisplayType === BALANCE_DISPLAY_TOTAL_USD) {
                    balance = this.$store.state.totalBalanceSumUsd;
                }
                const parts = balance ? pretty(balance).split('.') : [];
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

            // update timestamps if no new data from server
            timeInterval = setInterval(() => {
                this.lastUpdateTimeDistance = this.getLastUpdateTimeDistance();
            }, 1000);

        },
        destroyed() {
            clearInterval(timeInterval);
        },
        methods: {
            getLastUpdateTimeDistance() {
                // pass this.now to update computed property
                return getTimeDistance(this.$store.state.lastUpdateTime);
            },
            changeBalanceDisplayType() {
                if (this.balanceDisplayType === BALANCE_DISPLAY_TOTAL_USD) {
                    this.balanceDisplayType = BALANCE_DISPLAY_BIP;
                } else {
                    this.balanceDisplayType += 1;
                }
                this.$store.commit('SET_BALANCE_DISPLAY_TYPE', this.balanceDisplayType);
            },
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


        <div class="balance balance--toggle u-container" role="button" @click="changeBalanceDisplayType">
            <template v-if="balanceDisplayType === $options.BALANCE_DISPLAY_BIP">
                <div class="balance__caption">{{ $store.getters.COIN_NAME }} Balance</div>
                <div class="balance__value">
                    <span class="balance__whole">{{ balanceParts.whole }}</span><span class="balance__decimal">{{ balanceParts.decimal }} {{ $store.getters.COIN_NAME }}</span>
                </div>
            </template>
            <template v-if="balanceDisplayType === $options.BALANCE_DISPLAY_TOTAL">
                <div class="balance__caption">Total Balance</div>
                <div class="balance__value">
                    <span class="balance__whole">{{ balanceParts.whole }}</span><span class="balance__decimal">{{ balanceParts.decimal }} {{ $store.getters.COIN_NAME }}</span>
                </div>
            </template>
            <template v-if="balanceDisplayType === $options.BALANCE_DISPLAY_TOTAL_USD">
                <div class="balance__caption">Total Balance</div>
                <div class="balance__value">
                    <span class="balance__whole">${{ balanceParts.whole }}</span><span class="balance__decimal">{{ balanceParts.decimal }}</span>
                </div>
            </template>
            <div class="balance__time" v-if="lastUpdateTimeDistance">
                <img class="balance__time-icon" src="/img/icon-time.svg" width="14" height="14" alt="" role="presentation">
                <span class="balance__time-text">Last updated <strong>{{ lastUpdateTimeDistance }}</strong> ago</span>
            </div>
        </div>

        <nuxt-link class="balance balance--delegated u-container no-link" to="/delegations" v-if="delegation.data && delegation.data.length">
            <img class="balance--delegated__icon" src="/img/icon-arrow-right.svg" alt="" role="presentation">
            <div class="balance__caption">Delegated</div>
            <div class="balance__value">
                {{ delegatedTotal | pretty }} {{ $store.getters.COIN_NAME }}
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
                    <li class="list-item" v-for="coin in balance" :key="coin.coin.id">
                        <div class="list-item__left">
                            <img class="list-item__thumbnail" :src="getCoinIconUrl(coin.coin.symbol)" alt="" role="presentation">
                        </div>
                        <div class="list-item__center">
                            <div class="list-item__name">{{ coin.coin.symbol }}</div>
                        </div>
                        <div class="list-item__right">
                            <div class="list-item__amount">{{ coin.amount | pretty }}</div>
                            <div class="list-item__sub">{{ coin.coin.symbol | uppercase }}</div>
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




