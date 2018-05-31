<script>
    import format from 'date-fns/esm/format';
    import isSameDay from 'date-fns/esm/isSameDay';
    import subDays from 'date-fns/esm/subDays';
    import {getTransactionList} from "~/api";
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';
    import TransactionTable from "~/components/TransactionTable";

    export default {
        PAGE_TITLE: 'All Transactions',
        components: {
            Layout,
            TransactionTable,
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            }
        },
        props: {
            /** @type Array<Transaction>*/
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
                        timestamp: '2018-04-11 00:00:00+03:00',
                    },
                    {
                        name: '@PavelDurov',
                        amount: 1000000000,
                        coin: 'GRAM',
                        timestamp: '2018-04-11 23:32:42+03:00',
                    },
                ],
            },
        },
        data() {
            return {
                isTxListLoading: true,
                txList: null,
            }
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
            formatDate(dateString) {
                const date = new Date(dateString);
                if (isSameDay(date, new Date())) {
                    return 'Today';
                }
                if (isSameDay(date, subDays(new Date(), 1))) {
                    return 'Yesterday';
                }
                return format(new Date(dateString), 'EEEE, dd MMMM')
            }

        },
        computed: {
            /**
             * Split transactions to groups by date
             * @return {Object.<string, Array<Transaction>>}
             */
            transactionListGroups() {
                if (!this.txList) {
                    return null;
                }
                return this.txList.reduce((accumulator, tx) => {
                    const date = new Date(tx.timestamp)
                    const groupKey = format(date, 'yyyy-MM-dd');
                    if (!accumulator[groupKey]) {
                        accumulator[groupKey] = [];
                    }
                    accumulator[groupKey].push(tx);

                    return accumulator;
                }, {});
            }
        }
    }
</script>


<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true">

        <div class="u-section" v-if="transactionListGroups">
            <template v-for="(txGroup, groupDate) in transactionListGroups">
                <div class="list-title" :key="groupDate">{{ formatDate(groupDate) }}</div>
                <TransactionTable :transaction-list="txGroup" :key="groupDate"/>
            </template>
        </div>
        <p class="u-section u-container u-text-center" v-else-if="!isTxListLoading">No transactions yet</p>

    </Layout>
</template>




