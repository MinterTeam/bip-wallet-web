<script>
    import toDate from 'date-fns/esm/toDate';
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

        },
        data() {
            return {
                isTxListLoading: true,
                /** @type Array<Transaction>*/
                txList: this.$store.state.transactionListInfo.data || [],
            }
        },
        beforeMount() {
            this.$store.dispatch('FETCH_TRANSACTION_LIST')
                .then((txListInfo) => {
                    this.txList = txListInfo.data;
                    this.isTxListLoading = false;
                })
                .catch(() => {
                    this.isTxListLoading = false;
                });
        },
        methods: {
            formatDate(dateString) {
                const date = toDate(dateString);
                if (isSameDay(date, new Date())) {
                    return 'Today';
                }
                if (isSameDay(date, subDays(new Date(), 1))) {
                    return 'Yesterday';
                }
                return format(date, 'EEEE, dd MMMM')
            }
        },
        computed: {
            /**
             * Split transactions to groups by date
             * @return {Object.<string, Array<Transaction>>}
             */
            transactionListGroups() {
                if (!this.txList || !this.txList.length) {
                    return null;
                }
                return this.txList.reduce((accumulator, tx) => {
                    const date = toDate(tx.timestamp);
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
        <p class="u-section u-container u-text-center" v-else>
            <span v-if="isTxListLoading">Loading…</span>
            <span v-else>No transactions yet</span>
        </p>

    </Layout>
</template>




