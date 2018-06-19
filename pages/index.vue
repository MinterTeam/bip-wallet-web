<script>
    import {mapGetters, mapState} from 'vuex';
    import {getNameLetter, thousandsFilter} from "~/assets/utils";
    import Layout from '~/components/LayoutDefault';
    import TransactionTable from "~/components/TransactionTable";

    export default {
        components: {
            Layout,
            TransactionTable,
        },
        filters: {
            uppercase: (value) => value.toUpperCase(),
        },
        props: {

        },
        data() {
            return {
                isTxListLoading: true,
                isBalanceLoading: true,
            }
        },
        computed: {
            ...mapState({
                txList: (state) => state.transactionListInfo.data,
                balance: 'balance',
            }),
            ...mapGetters([
                'username',
                'usernameLetter',
                'avatar',
            ]),
            balanceParts() {
                const bipTotal = this.balance.bipTotal || 0;
                const parts = bipTotal.toString().split('.');
                return {
                    whole:  parts[0] ? thousandsFilter(parts[0]) : 0,
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
            formatAmount(amount) {
                return amount.toLocaleString();
            },
            getNameLetter,
        },
    }
</script>


<template>
    <Layout :is-bg-white="true">
        <template slot="toolbar">
            <div class="toolbar">
                <div class="toolbar__left">
                    <div class="toolbar-button">
                        <img class="" src="/img/bip-logo.svg" alt="Bip" width="37"/>
                    </div>
                </div>
                <div class="toolbar__right">
                    <div class="toolbar-button user">
                        <div class="user__name">{{ username }}</div>
                        <div class="user__avatar"
                             :style="{backgroundImage: avatar ? `url('${avatar}')` : ''}"
                             :class="{'user__avatar--letter': !avatar}"
                        >
                            <span v-if="!avatar">{{ usernameLetter }}</span>
                        </div>

                    </div>
                </div>
            </div>
        </template>


        <div class="balance u-container">
            <div class="balance__caption">My Balance</div>
            <div>
                <span class="balance__whole">{{ balanceParts.whole }}</span><span class="balance__decimal">{{ balanceParts.decimal }} bips</span>
            </div>
        </div>

        <div class="u-section">
            <div v-if="txList && txList.length">
                <div class="list-title">Latest Transactions</div>
                <TransactionTable :transaction-list="txList"/>
                <div class="u-container u-section--small">
                    <nuxt-link class="bip-button bip-button--ghost-main" to="/transactions">All Transactions</nuxt-link>
                </div>
            </div>

            <div v-if="balance.coinList && balance.coinList.length">
                <div class="list-title">My coinList</div>
                <ul class="list">
                    <li class="list-item" v-for="coin in balance.coinList" :key="coin.coin">
                        <div class="list-item__left">
                            <img class="list-item__thumbnail" :src="coin.image" alt="" role="presentation" v-if="coin.image">
                            <div class="list-item__thumbnail" v-else>{{ getNameLetter(coin.name || coin.coin) }}</div>
                        </div>
                        <div class="list-item__center">
                            <div class="list-item__name">{{ coin.name || (coin.coin | uppercase) }}</div>
                        </div>
                        <div class="list-item__right">
                            <div class="list-item__amount">{{ formatAmount(coin.amount) }}</div>
                            <div class="list-item__sub">{{ coin.coin | uppercase }}</div>
                        </div>
                    </li>
                </ul>
                <div class="u-container u-section--small">
                    <nuxt-link class="bip-button bip-button--ghost-main" to="#">Convert</nuxt-link>
                </div>
            </div>
        </div>
    </Layout>
</template>




