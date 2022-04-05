<script>
    import Big from 'big.js';
    import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
    import {EXPLORER_HOST, LOCK_STAKE_PERIOD} from "~/assets/variables.js";
    import {getAvatarUrl, getTimeStamp, pretty, txTypeFilter, shortHashFilter, fromBase64} from "~/assets/utils";

    export default {
        filters: {
            timestamp: getTimeStamp,
            pretty,
            txType: txTypeFilter,
            short: shortHashFilter,
        },
        props: {
            /** @type Array<Transaction>*/
            transactionList: {
                type: [Array, null],
                required: true,
            },
        },
        data() {
            return {
                activeTx: null,
            };
        },
        methods: {
            pretty,
            fromBase64,
            txClick(hash) {
                if (this.activeTx !== hash) {
                    // open clicked tx
                    this.activeTx = hash;
                } else {
                    // close already opened clicked tx
                    this.activeTx = null;
                }
            },
            getOtherAddress(tx) {
                if (this.isSend(tx)) {
                    return this.isIncome(tx) ? tx.from : tx.data.to;
                }
                if (this.isRedeem(tx)) {
                    return this.isIncome(tx) ? tx.data.check.sender : tx.from;
                }
            },
            getName(address) {
                if (!address) {
                    return '';
                }
                return shortHashFilter(address);
            },
            getAvatarUrl,
            getTxUrl(hash) {
                return EXPLORER_HOST + '/transactions/' + hash;
            },
            isTxType(tx, txType) {
                return this.isTxType(tx, txType);
            },
            isSend(tx) {
                return this.isTxType(tx, TX_TYPE.SEND);
            },
            isCreateCoin(tx) {
                return this.isTxType(tx, TX_TYPE.CREATE_COIN);
            },
            isSell(tx) {
                return this.isTxType(tx, TX_TYPE.SELL) || this.isTxType(tx, TX_TYPE.SELL_ALL);
            },
            isSellPool(tx) {
                return this.isTxType(tx, TX_TYPE.SELL_SWAP_POOL) || this.isTxType(tx, TX_TYPE.SELL_ALL_SWAP_POOL);
            },
            isBuy(tx) {
                return this.isTxType(tx, TX_TYPE.BUY);
            },
            isBuyPool(tx) {
                return this.isTxType(tx, TX_TYPE.BUY_SWAP_POOL);
            },
            isExchange(tx) {
                return this.isSell(tx) || this.isBuy(tx);
            },
            isAddOrder(tx) {
                return this.isTxType(tx, TX_TYPE.ADD_LIMIT_ORDER);
            },
            isMining(tx) {
                return this.isValidate(tx) || this.isDelegate(tx) || this.isUnbond(tx);
            },
            isUnbond(tx) {
                return this.isTxType(tx, TX_TYPE.UNBOND);
            },
            isDelegate(tx) {
                return this.isTxType(tx, TX_TYPE.DELEGATE);
            },
            isRedeem(tx) {
                return this.isTxType(tx, TX_TYPE.REDEEM_CHECK);
            },
            isValidate(tx) {
                return this.isTxType(tx, TX_TYPE.DECLARE_CANDIDACY) || this.isTxType(tx, TX_TYPE.EDIT_CANDIDATE) || this.isTxType(tx, TX_TYPE.SET_CANDIDATE_OFF) || this.isTxType(tx, TX_TYPE.SET_CANDIDATE_ON);
            },
            isMultisend(tx) {
                return this.isTxType(tx, TX_TYPE.MULTISEND);
            },
            isIncomeSend(tx) {
                return this.$store.getters.address === tx.data.to;
            },
            isIncomeMultisend(tx) {
                if (!this.isMultisend(tx)) {
                    return;
                }
                const isOutcomeMultisend = this.$store.getters.address === tx.from;
                return !isOutcomeMultisend;
            },
            isIncomeRedeem(tx) {
                if (!this.isRedeem(tx)) {
                    return;
                }
                return this.$store.getters.address === tx.from;
            },
            isIncome(tx) {
                return this.isIncomeSend(tx) || this.isExchange(tx) || this.isCreateCoin(tx) || this.isUnbond(tx) || this.isIncomeMultisend(tx) || this.isIncomeRedeem(tx);
            },
            isDefined(value) {
                return typeof value !== 'undefined';
            },
            getAmount(tx) {
                return tx.data.value
                    || tx.data.valueToBuy
                    || tx.data.stake
                    || tx.data.initialAmount
                    || (tx.data.check && tx.data.check.value)
                    || this.getMultisendValue(tx);
            },
            hasAmount(tx) {
                return typeof this.getAmount(tx) !== 'undefined';
            },
            getMultisendDeliveryList(tx) {
                const isOutcomeMultisend = !this.isIncomeMultisend(tx);
                return isOutcomeMultisend ? tx.data.list : tx.data.list.filter((delivery) => {
                    return this.$store.getters.address === delivery.to;
                });
            },
            isMultisendMultipleCoin(tx) {
                if (!this.isMultisend(tx)) {
                    return;
                }
                const currentUserDeliveryList = this.getMultisendDeliveryList(tx);
                return currentUserDeliveryList.some((delivery) => {
                    return delivery.coin.symbol !== currentUserDeliveryList[0].coin.symbol;
                });
            },
            getMultisendCoin(tx) {
                if (!this.isMultisend(tx)) {
                    return;
                }
                if (!this.isMultisendMultipleCoin(tx)) {
                    return this.getMultisendDeliveryList(tx)[0].coin.symbol;
                }
            },
            getMultisendValue(tx) {
                if (!this.isMultisend(tx)) {
                    return;
                }
                const currentUserDeliveryList = this.getMultisendDeliveryList(tx);
                if (this.isMultisendMultipleCoin(tx)) {
                    return '...';
                } else {
                    return currentUserDeliveryList.reduce((accumulator, delivery) => accumulator.plus(new Big(delivery.value)), new Big(0)).toFixed();
                }
            },
            getConvertCoinSymbol(tx) {
                if (this.isSell(tx)) {
                    return tx.data.coinToSell.symbol;
                }
                if (this.isBuy(tx)) {
                    return tx.data.coinToBuy.symbol;
                }
                if (this.isSellPool(tx)) {
                    return tx.data.coins[0].symbol;
                }
                if (this.isBuyPool(tx)) {
                    return tx.data.coins[tx.data.coins.length - 1].symbol;
                }
            },
            getConvertValue(tx) {
                if (this.isSell(tx) || this.isSellPool(tx)) {
                    return tx.data.valueToSell;
                }
                if (this.isBuy(tx) || this.isBuyPool(tx)) {
                    return tx.data.valueToBuy;
                }
            },
            getDueBlockHeight(tx) {
                if (this.isTxType(tx, TX_TYPE.LOCK_STAKE)) {
                    return tx.height + LOCK_STAKE_PERIOD;
                }
                return tx?.data?.dueBlock || tx?.check?.dueBlock;
            },
        },
    };
</script>

<template>
    <div class="list" v-if="transactionList && transactionList.length">
        <div class="list-item-wrap" v-for="tx in transactionList" :key="tx.hash">
            <div class="list-item list-item--tappable" role="button" @click="txClick(tx.hash)">
                <!-- icon -->
                <div class="list-item__left">
                    <img class="list-item__thumbnail" src="/img/icon-tx-exchange.svg" alt="" role="presentation" v-if="isExchange(tx)">
                    <img class="list-item__thumbnail" src="/img/icon-tx-delegate.svg" alt="" role="presentation" v-else-if="isDelegate(tx)">
                    <img class="list-item__thumbnail" src="/img/icon-tx-unbond.svg" alt="" role="presentation" v-else-if="isUnbond(tx)">
                    <img class="list-item__thumbnail" src="/img/icon-tx-multisend.svg" alt="" role="presentation" v-else-if="isMultisend(tx)">
                    <img class="list-item__thumbnail" src="/img/icon-tx-edit.svg" alt="" role="presentation" v-else-if="isValidate(tx)">
                    <img class="list-item__thumbnail" src="/img/icon-tx-coin.svg" alt="" role="presentation" v-else-if="isCreateCoin(tx)">
                    <img class="list-item__thumbnail" :src="getAvatarUrl(getOtherAddress(tx))" alt="" role="presentation" v-else>
                </div>
                <!-- name -->
                <div class="list-item__center" :class="{'list-item__overflow': true}" v-if="isSend(tx) ">
                    <div class="list-item__name u-text-nowrap" :class="{'u-text-overflow': getName(getOtherAddress(tx)).substr(0, 2) !== 'Mx'}">{{ getName(getOtherAddress(tx)) }}</div>
                </div>
                <div class="list-item__center" :class="{'list-item__overflow': true}" v-else-if="isMultisend(tx)">
                    <div class="list-item__name" :class="{'u-text-overflow': true}">{{ getName(tx.from) }}</div>
                </div>
                <div class="list-item__center" :class="{'list-item__overflow': true}" v-else-if="isExchange(tx)">
                    <div class="list-item__sup">Exchange</div>
                    <div class="list-item__name">{{ tx.data.coinToSell.symbol }} → {{ tx.data.coinToBuy.symbol }}</div>
                </div>
                <div class="list-item__center" :class="{'list-item__overflow': true}" v-else-if="isCreateCoin(tx)">
                    <div class="list-item__sup">{{ tx.type | txType }}</div>
                    <div class="list-item__name">{{ tx.data.symbol }}</div>
                </div>
                <div class="list-item__center" :class="{'list-item__overflow': true}" v-else-if="isMining(tx)">
                    <div class="list-item__sup">{{ tx.type | txType }}</div>
                    <div class="list-item__name u-text-nowrap">{{ tx.data.pubKey | short }}</div>
                </div>
                <!--@TODO check amount-->
                <div class="list-item__center" :class="{'list-item__overflow': true}" v-else-if="isRedeem(tx)">
                    <div class="list-item__sup">{{ tx.type | txType }}</div>
                    <div class="list-item__name u-text-nowrap">{{ getName(getOtherAddress(tx)) }}</div>
                </div>
                <div class="list-item__center" :class="{'list-item__overflow': true}" v-else>
                    <div class="list-item__sup">{{ tx.type | txType }}</div>
                    <div class="list-item__name u-text-nowrap">{{ tx.hash | short }}</div>
                </div>

                <!-- amount -->
                <div class="list-item__right" :class="{'list-item__right--exchange': isExchange(tx)}" v-if="hasAmount(tx)">
                    <template v-if="isMultisend(tx) && isMultisendMultipleCoin(tx)">
                        <div class="list-item__amount" :class="{'list-item__amount--plus': isIncome(tx)}">
                            ...
                        </div>
                        <div class="list-item__sub">Multiple coins</div>
                    </template>
                    <template v-else>
                        <div class="list-item__amount" :class="{'list-item__amount--plus': isIncome(tx)}">
                            {{ isIncome(tx) ? '+' : '-' }}&nbsp;{{ getAmount(tx) || 0 | pretty }}
                        </div>
                        <div class="list-item__sub">{{ (tx.data.coin && tx.data.coin.symbol) || tx.data.symbol || (tx.data.coinToBuy && tx.data.coinToBuy.symbol) || (tx.data.check && tx.data.check.coin.symbol) || getMultisendCoin(tx) }}</div>
                    </template>
                </div>
            </div>
            <!-- expand -->
            <div class="list-item-content u-section u-container" v-show="activeTx === tx.hash">
                <div class="u-grid u-grid--vertical-margin">
                    <!-- type SEND -->
                    <div class="u-cell" v-if="isSend(tx)">
                        <div class="tx-info__name">From</div>
                        <div class="tx-info__value">{{ tx.from }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.to">
                        <div class="tx-info__name">To</div>
                        <div class="tx-info__value">{{ tx.data.to }}</div>
                    </div>
                    <div class="u-cell" v-if="isDefined(tx.data.amount)">
                        <div class="tx-info__name">Amount</div>
                        <div class="tx-info__value">{{ tx.data.amount | pretty }} {{ tx.data.coin.symbol }}</div>
                    </div>

                    <!-- type SELL -->
                    <div class="u-cell" v-if="isSell(tx)">
                        <div class="tx-info__name">Sell coins</div>
                        <div class="tx-info__value">{{ pretty(tx.data.valueToSell) }} {{ tx.data.coinToSell.symbol }}</div>
                    </div>
                    <div class="u-cell" v-if="isSell(tx)">
                        <div class="tx-info__name">Get coins</div>
                        <div class="tx-info__value">{{ pretty(tx.data.valueToBuy) }} {{ tx.data.coinToBuy.symbol }}</div>
                    </div>
                    <!-- SELL_POOL -->
                    <div class="u-cell" v-if="isSellPool(tx)">
                        <div class="tx-info__name">Sell coins</div>
                        <div class="tx-info__value">{{ pretty(tx.data.valueToSell) }} {{ tx.data.coins[0].symbol }}</div>
                    </div>
                    <div class="u-cell" v-if="isSellPool(tx)">
                        <div class="tx-info__name">Get coins</div>
                        <div class="tx-info__value">{{ pretty(tx.data.valueToBuy) }} {{ tx.data.coins[tx.data.coins.length - 1].symbol }}</div>
                    </div>

                    <!-- type BUY -->
                    <div class="u-cell" v-if="isBuy(tx)">
                        <div class="tx-info__name">Buy coins</div>
                        <div class="tx-info__value">{{ pretty(tx.data.valueToBuy) }} {{ tx.data.coinToBuy.symbol }}</div>
                    </div>
                    <div class="u-cell" v-if="isBuy(tx)">
                        <div class="tx-info__name">Spend coins</div>
                        <div class="tx-info__value">{{ pretty(tx.data.valueToSell) }} {{ tx.data.coinToSell.symbol }}</div>
                    </div>
                    <!-- BUY_POOL -->
                    <div class="u-cell" v-if="isBuyPool(tx)">
                        <div class="tx-info__name">Buy coins</div>
                        <div class="tx-info__value">{{ pretty(tx.data.valueToBuy) }} {{ tx.data.coins[tx.data.coins.length - 1].symbol }}</div>
                    </div>
                    <div class="u-cell" v-if="isBuyPool(tx)">
                        <div class="tx-info__name">Spend coins</div>
                        <div class="tx-info__value">{{ pretty(tx.data.valueToSell) }} {{ tx.data.coins[0].symbol }}</div>
                    </div>

                    <!-- ADD_LIMIT_ORDER -->
                    <div class="u-cell" v-if="isAddOrder(tx)">
                        <div class="tx-info__name">Want to sell</div>
                        <div class="tx-info__value">
                            {{ tx.data.coinToSell.symbol }} {{ pretty(tx.data.valueToSell) }}
                        </div>
                    </div>
                    <div class="u-cell" v-if="isAddOrder(tx)">
                        <div class="tx-info__name">Want to buy</div>
                        <div class="tx-info__value">
                            {{ tx.data.coinToBuy.symbol }} {{ pretty(tx.data.valueToBuy) }}
                        </div>
                    </div>

                    <!-- ADD_LIMIT_ORDER, REMOVE_LIMIT_ORDER -->
                    <div class="u-cell" v-if="tx.data.id || tx.data.orderId">
                        <div class="tx-info__name">Order ID</div>
                        <div class="tx-info__value">
                            {{ tx.data.id || tx.data.orderId }}
                        </div>
                    </div>

                    <!-- type CREATE_COIN -->
                    <div class="u-cell" v-if="tx.data.name">
                        <div class="tx-info__name">Name</div>
                        <div class="tx-info__value">{{ tx.data.name }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.symbol">
                        <div class="tx-info__name">Symbol</div>
                        <div class="tx-info__value">{{ tx.data.symbol }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.initialAmount">
                        <div class="tx-info__name">Initial Amount</div>
                        <div class="tx-info__value">{{ tx.data.initialAmount | pretty }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.initialReserve">
                        <div class="tx-info__name">Initial Reserve</div>
                        <div class="tx-info__value">{{ tx.data.initialReserve | pretty }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.constantReserveRatio">
                        <div class="tx-info__name">CRR</div>
                        <div class="tx-info__value">{{ tx.data.constantReserveRatio }}&thinsp;%</div>
                    </div>

                    <!-- type DECLARE_CANDIDACY, EDIT_CANDIDATE, DELEGATE, UNBOND, SET_CANDIDATE_ONLINE, SET_CANDIDATE_OFFLINE -->
                    <div class="u-cell" v-if="tx.data.pubKey">
                        <div class="tx-info__name">Public Key</div>
                        <div class="tx-info__value">{{ tx.data.pubKey }}</div>
                    </div>
                    <div class="u-cell" v-if="isDefined(tx.data.stake)">
                        <div class="tx-info__name">Stake</div>
                        <div class="tx-info__value">{{ tx.data.stake | pretty }} {{ tx.data.coin.symbol }}</div>
                    </div>
                    <div class="u-cell" v-if="isDefined(tx.data.commission)">
                        <div class="tx-info__name">Commission</div>
                        <div class="tx-info__value">{{ tx.data.commission }}&thinsp;%</div>
                    </div>
                    <div class="u-cell" v-if="isUnbond(tx)">
                        <div class="tx-info__name">Unbond Block</div>
                        <div class="tx-info__value">{{ tx.block + $options.UNBOND_PERIOD }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.rewardAddress">
                        <div class="tx-info__name">Reward Address</div>
                        <div class="tx-info__value">{{ tx.data.rewardAddress }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.ownerAddress">
                        <div class="tx-info__name">Owner Address</div>
                        <div class="tx-info__value">{{ tx.data.ownerAddress }}</div>
                    </div>

                    <!-- type REDEEM_CHECK -->
                    <div class="u-cell" v-if="tx.data.check && tx.data.check.sender">
                        <div class="tx-info__name">Check Issuer</div>
                        <div class="tx-info__value">{{ tx.data.check.sender }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.check && tx.data.check.nonce">
                        <div class="tx-info__name">Check Nonce</div>
                        <div class="tx-info__value">{{ fromBase64(tx.data.check.nonce) }}</div>
                    </div>
                    <div class="u-cell" v-if="getDueBlockHeight(tx)">
                        <div class="tx-info__name">Due block</div>
                        <div class="tx-info__value">{{ getDueBlockHeight(tx) }}</div>
                    </div>

                    <!-- type MULTISIG -->
                    <!--@TODO multisig data-->

                    <!-- time -->
                    <div class="u-cell">
                        <div class="tx-info__name">TimeStamp</div>
                        <div class="tx-info__value">{{ tx.timestamp | timestamp }}</div>
                    </div>

                    <!-- fee -->
                    <div class="u-cell">
                        <div class="tx-info__name">Fee</div>
                        <div class="tx-info__value">{{ tx.fee | pretty }} {{ $store.getters.COIN_NAME }}</div>
                    </div>

                    <!-- message -->
                    <div class="u-cell" v-if="tx.payload">
                        <div class="tx-info__name">Message</div>
                        <div class="tx-info__value">{{ fromBase64(tx.payload) }}</div>
                    </div>
                </div>
                <a class="tx-info__button bip-button bip-button--ghost-main" :href="getTxUrl(tx.hash)" target="_blank">Explorer</a>
            </div>
        </div>
    </div>
</template>
