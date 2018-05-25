<script>
    import {getNameLetter} from "~/assets/utils";

    export default {
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
            txClick(index) {
                if (this.activeTx !== index) {
                    // open clicked tx
                    this.activeTx = index;
                } else {
                    // close already opened clicked tx
                    this.activeTx = null;
                }
            },
            formatAmount(amount) {
                return amount.toLocaleString();
            },
            isAmountPositive(amount) {
                return amount >= 0;
            },
            getNameLetter,
        }
    }
</script>

<template>
    <div class="list">
        <div class="list-item-wrap" v-for="(tx, txIndex) in transactionList" :key="txIndex">
            <div class="list-item list-item--tappable" role="button" @click="txClick(txIndex)">
                <div class="list-item__left">
                    <img class="list-item__thumbnail" :src="tx.image" alt="" role="presentation" v-if="tx.image">
                    <div class="list-item__thumbnail" v-else>{{ getNameLetter(tx.name) }}</div>
                </div>
                <div class="list-item__center">
                    <div class="list-item__name">{{ tx.name }}</div>
                </div>
                <div class="list-item__right">
                    <div class="list-item__amount" :class="{'list-item__amount--plus': isAmountPositive(tx.amount)}">
                        {{ isAmountPositive(tx.amount) ? '+' : '' }}{{ formatAmount(tx.amount) }}
                    </div>
                    <div class="list-item__sub">{{ tx.coin }}</div>
                </div>
            </div>
            <div class="list-item-content u-section u-container" v-show="activeTx === txIndex">
                <div class="u-grid u-grid--vertical-margin">
                    <div class="u-cell">
                        <div class="tx-info__name">From</div>
                        <div class="tx-info__value">Mx86d167ffe6c81dd83a20e3731ed66dddaac42488</div>
                    </div>
                    <div class="u-cell">
                        <div class="tx-info__name">To</div>
                        <div class="tx-info__value">Mx86d167ffe6c81dd83a20e3731ed66dddaac42488</div>
                    </div>
                    <div class="u-cell u-cell--1-2">
                        <div class="tx-info__name">Date</div>
                        <div class="tx-info__value">16 March 2018</div>
                    </div>
                    <div class="u-cell u-cell--1-2">
                        <div class="tx-info__name">Time</div>
                        <div class="tx-info__value">18:34:53</div>
                    </div>
                    <div class="u-cell u-cell--1-2">
                        <div class="tx-info__name">Coin</div>
                        <div class="tx-info__value">{{ tx.coin }}</div>
                    </div>
                    <div class="u-cell u-cell--1-2">
                        <div class="tx-info__name">Amount</div>
                        <div class="tx-info__value">{{ tx.amount }}</div>
                    </div>
                </div>
                <a class="tx-info__button bip-button bip-button--ghost-main" href="https://explorer.beta.minter.network/transactions/1" target="_blank">Explorer</a>
            </div>
        </div>
    </div>
</template>
