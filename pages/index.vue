<script>
    import {mapGetters} from 'vuex';
    import {getTransactionList} from "~/api";
    import {getNameLetter, thousandsFilter} from "~/assets/utils";
    import Layout from '~/components/LayoutDefault';
    import TransactionTable from "~/components/TransactionTable";

    export default {
        components: {
            Layout,
            TransactionTable,
        },
        props: {
            transactionList: {
                type: Array,
                default: () => [
                    {
                        name: 'Starbucks',
                        amount: 10,
                        coin: 'STBX',
                        image: '/img/tmp/logo-stbx.png',
                        timestamp: '2018-04-09 18:30:42+03:00',
                    },
                    {
                        name: '@ElonMusk',
                        amount: 1,
                        coin: 'TSL',
                        timestamp: '2018-04-09 18:31:42+03:00',
                    },
                    {
                        name: '@RealDonaldTrump',
                        amount: -1.2342,
                        coin: 'BIP',
                        timestamp: '2018-04-09 18:32:42+03:00',
                    },
                    {
                        name: 'McDonalds',
                        amount: -1.55,
                        coin: 'MCD',
                        image: '/img/tmp/logo-mcd.png',
                        timestamp: '2018-04-11 18:31:42+03:00',
                    },
                    {
                        name: '@PavelDurov',
                        amount: 1000000000,
                        coin: 'GRAM',
                        timestamp: '2018-04-11 18:32:42+03:00',
                    },
                ],
            },
            coinList: {
                type: Array,
                default: () => [
                    {
                        name: 'bip',
                        amount: 22.2234,
                        coin: 'BIP',
                        image: '/img/tmp/logo-stbx.png',
                    },
                    {
                        name: 'McDonalds',
                        amount: 12334.54,
                        coin: 'MCD',
                        image: '/img/tmp/logo-mcd.png',
                    },
                ],
            },
        },
        data() {
            return {
                balance: 120912.98230221,
                isTxListLoading: true,
                txList: null,
            }
        },
        computed: {
            ...mapGetters([
                'username',
                'usernameLetter',
                'avatar',
            ]),
            balanceParts() {
                const delimiter = '&thinsp;';
                const parts = this.balance.toString().split('.');
                return {
                    whole:  parts[0] ? thousandsFilter(parts[0]) : 0,
                    decimal: parts[1] ? '.' + parts[1] : '',
                };
            },
        },
        created() {
            getTransactionList()
                .then((txList) => {
                    this.txList = txList;
                    this.isTxListLoading = false;
                })
                .catch(() => {
                    this.isTxListLoading = false;
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
            <div v-if="transactionList">
                <div class="list-title">Latest Transactions</div>
                <TransactionTable :transaction-list="transactionList"/>
                <div class="u-container u-section--small">
                    <nuxt-link class="bip-button bip-button--ghost-main" to="/transactions">All Transactions</nuxt-link>
                </div>
            </div>

            <div class="list-title">My coins</div>
            <ul class="list">
                <li class="list-item" v-for="(coin, coinIndex) in coinList" :key="coinIndex">
                    <div class="list-item__left">
                        <img class="list-item__thumbnail" :src="coin.image" alt="" role="presentation" v-if="coin.image">
                        <div class="list-item__thumbnail" v-else>{{ getNameLetter(coin.name) }}</div>
                    </div>
                    <div class="list-item__center">
                        <div class="list-item__name">{{ coin.name }}</div>
                    </div>
                    <div class="list-item__right">
                        <div class="list-item__amount">{{ formatAmount(coin.amount) }}</div>
                        <div class="list-item__sub">{{ coin.coin }}</div>
                    </div>
                </li>
            </ul>
            <div class="u-container u-section--small">
                <nuxt-link class="bip-button bip-button--ghost-main" to="#">Convert</nuxt-link>
            </div>
        </div>
    </Layout>
</template>




