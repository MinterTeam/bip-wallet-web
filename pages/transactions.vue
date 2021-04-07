<script>
    import parseISO from 'date-fns/esm/parseISO';
    import format from 'date-fns/esm/format';
    import isSameDay from 'date-fns/esm/isSameDay';
    import subDays from 'date-fns/esm/subDays';
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
            };
        },
        props: {

        },
        data() {
            return {
                isTxListLoading: true,
                /** @type Array<Transaction>*/
                txList: this.$store.state.transactionListInfo.data || [],
                pagination: this.$store.state.transactionListInfo.meta || {},
            };
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
                    const date = parseISO(tx.timestamp);
                    const groupKey = format(date, 'yyyy-MM-dd');
                    if (!accumulator[groupKey]) {
                        accumulator[groupKey] = [];
                    }
                    accumulator[groupKey].push(tx);

                    return accumulator;
                }, {});
            },
        },
        beforeMount() {
            this.$store.dispatch('FETCH_TRANSACTION_LIST')
                .then((txListInfo) => {
                    this.txList = txListInfo.data;
                    this.pagination = txListInfo.meta;
                    this.isTxListLoading = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.isTxListLoading = false;
                });
        },
        methods: {
            formatDate(dateString) {
                const date = parseISO(dateString);
                if (isSameDay(date, new Date())) {
                    return 'Today';
                }
                if (isSameDay(date, subDays(new Date(), 1))) {
                    return 'Yesterday';
                }
                return format(date, 'EEEE, dd MMMM');
            },
            loadMore() {
                if (this.isTxListLoading) {
                    return;
                }
                this.isTxListLoading = true;
                this.$store.dispatch('FETCH_TRANSACTION_LIST', this.pagination.current_page + 1)
                    .then((txListInfo) => {
                        txListInfo.data.forEach((tx) => {
                            const alreadyHasTx = this.txList.find((listItem) => listItem.txn === tx.txn);
                            if(!alreadyHasTx) {
                                this.txList.push(tx);
                            }
                        });
                        this.pagination = txListInfo.meta;
                        this.isTxListLoading = false;
                    })
                    .catch((error) => {
                        console.log(error);
                        this.isTxListLoading = false;
                    });
            },
        },
    };
</script>


<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true">

        <div class="u-section" v-if="transactionListGroups">
            <template v-for="(txGroup, groupDate) in transactionListGroups">
                <div class="list-title" :key="'title' + groupDate">{{ formatDate(groupDate) }}</div>
                <TransactionTable :transaction-list="txGroup" :key="groupDate"/>
            </template>
            <div class="u-container u-section--small" v-if="pagination.current_page < pagination.last_page">
                <button class="bip-button bip-button--ghost-main" type="button"
                        :class="{'is-loading': isTxListLoading}"
                        @click="loadMore"
                >
                    <span class="bip-button__content">Load more</span>
                    <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                    </svg>
                </button>
            </div>
        </div>
        <p class="u-section u-container u-text-center" v-else>
            <span v-if="isTxListLoading">Loading…</span>
            <span v-else>No transactions yet</span>
        </p>

    </Layout>
</template>




