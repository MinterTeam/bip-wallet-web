<script>
    import {EXPLORER_URL} from "~/assets/variables";
    import {getNameLetter, getTimeStamp} from "~/assets/utils";

    export default {
        filters: {
            timestamp: getTimeStamp,
        },
        props: {
            /** @type Array<Transaction>*/
            transactionList: {
                type: Array|null,
                required: true,
            },
        },
        data() {
            return {
                activeTx: null,
            }
        },
        methods: {
            txClick(hash) {
                if (this.activeTx !== hash) {
                    // open clicked tx
                    this.activeTx = hash;
                } else {
                    // close already opened clicked tx
                    this.activeTx = null;
                }
            },
            formatAmount(amount) {
                return amount.toLocaleString();
            },
            getOtherAddress(tx) {
                return tx.data.direction === 'income' ? tx.data.from : tx.data.to;
            },
            getNameLetter,
            getTxUrl(hash) {
                return EXPLORER_URL + '/transactions/' + hash;
            },
        }
    }
</script>

<template>
    <div class="list" v-if="transactionList && transactionList.length">
        <div class="list-item-wrap" v-for="tx in transactionList" :key="tx.hash">
            <div class="list-item list-item--tappable" role="button" @click="txClick(tx.hash)">
                <div class="list-item__left">
                    <img class="list-item__thumbnail" :src="tx.image" alt="" role="presentation" v-if="tx.image">
                    <div class="list-item__thumbnail" v-else>{{ getNameLetter(getOtherAddress(tx)) }}</div>
                </div>
                <!--@TODO check tx recipient username-->
                <div class="list-item__center" :class="{'list-item__center--overflow': true}">
                    <div class="list-item__name" :class="{'u-text-overflow': true}">{{ getOtherAddress(tx) }}</div>
                </div>
                <div class="list-item__right">
                    <div class="list-item__amount" :class="{'list-item__amount--plus': tx.data.direction === 'income'}">
                        {{ tx.data.direction === 'income' ? '+' : '' }}{{ formatAmount(tx.data.amount) }}
                    </div>
                    <div class="list-item__sub">{{ tx.data.coin }}</div>
                </div>
            </div>
            <div class="list-item-content u-section u-container" v-show="activeTx === tx.hash">
                <div class="u-grid u-grid--vertical-margin">
                    <div class="u-cell">
                        <div class="tx-info__name">From</div>
                        <div class="tx-info__value">{{ tx.data.from }}</div>
                    </div>
                    <div class="u-cell">
                        <div class="tx-info__name">To</div>
                        <div class="tx-info__value">{{ tx.data.to }}</div>
                    </div>
                    <div class="u-cell">
                        <div class="tx-info__name">TimeStamp</div>
                        <div class="tx-info__value">{{ tx.timestamp | timestamp }}</div>
                    </div>
                    <div class="u-cell">
                        <div class="tx-info__name">Amount</div>
                        <div class="tx-info__value">{{ tx.data.amount }} {{ tx.data.coin }}</div>
                    </div>
                </div>
                <a class="tx-info__button bip-button bip-button--ghost-main" :href="getTxUrl(tx.hash)" target="_blank">Explorer</a>
            </div>
        </div>
    </div>
</template>
