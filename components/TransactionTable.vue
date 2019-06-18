<script>
    import Big from 'big.js';
    import * as TX_TYPES from 'minterjs-tx/src/tx-types';
    import {EXPLORER_HOST} from "~/assets/variables";
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
                if (this.$store.state.userList[address] && this.$store.state.userList[address].username) {
                    return '@' + this.$store.state.userList[address].username;
                } else {
                    return shortHashFilter(address);
                }
            },
            getAvatarUrl,
            getTxUrl(hash) {
                return EXPLORER_HOST + '/transactions/' + hash;
            },
            isSend(tx) {
                return tx.type === Number(TX_TYPES.TX_TYPE_SEND);
            },
            isCreateCoin(tx) {
                return tx.type === Number(TX_TYPES.TX_TYPE_CREATE_COIN);
            },
            isSell(tx) {
                return tx.type === Number(TX_TYPES.TX_TYPE_SELL) || tx.type === Number(TX_TYPES.TX_TYPE_SELL_ALL);
            },
            isBuy(tx) {
                return tx.type === Number(TX_TYPES.TX_TYPE_BUY);
            },
            isExchange(tx) {
                return this.isSell(tx) || this.isBuy(tx);
            },
            isMining(tx) {
                return this.isValidate(tx) || this.isDelegate(tx) || this.isUnbond(tx);
            },
            isUnbond(tx) {
                return tx.type === Number(TX_TYPES.TX_TYPE_UNBOND);
            },
            isDelegate(tx) {
                return tx.type === Number(TX_TYPES.TX_TYPE_DELEGATE);
            },
            isRedeem(tx) {
                return tx.type === Number(TX_TYPES.TX_TYPE_REDEEM_CHECK);
            },
            isValidate(tx) {
                return tx.type === Number(TX_TYPES.TX_TYPE_DECLARE_CANDIDACY) || tx.type === Number(TX_TYPES.TX_TYPE_EDIT_CANDIDATE) || tx.type === Number(TX_TYPES.TX_TYPE_SET_CANDIDATE_OFF) || tx.type === Number(TX_TYPES.TX_TYPE_SET_CANDIDATE_ON);
            },
            isMultisend(tx) {
                return tx.type === Number(TX_TYPES.TX_TYPE_MULTISEND);
            },
            isIncomeSend(tx) {
                const addressList = [this.$store.getters.addressList[0]];
                return addressList.some((address) => {
                    if (address.address === tx.data.to) {
                        return true;
                    }
                });
            },
            isIncomeMultisend(tx) {
                if (!this.isMultisend(tx)) {
                    return;
                }
                const addressList = [this.$store.getters.addressList[0]];
                const isOutcomeMultisend = addressList.some((address) => {
                    if (address.address === tx.from) {
                        return true;
                    }
                });
                return !isOutcomeMultisend;
            },
            isIncomeRedeem(tx) {
                if (!this.isRedeem(tx)) {
                    return;
                }
                const addressList = [this.$store.getters.addressList[0]];
                return addressList.some((address) => {
                    if (address.address === tx.from) {
                        return true;
                    }
                });
            },
            isIncome(tx) {
                return this.isIncomeSend(tx) || this.isExchange(tx) || this.isCreateCoin(tx) || this.isUnbond(tx) || this.isIncomeMultisend(tx) || this.isIncomeRedeem(tx);
            },
            isDefined(value) {
                return typeof value !== 'undefined';
            },
            getAmount(tx) {
                return tx.data.value
                    || tx.data.value_to_buy
                    || tx.data.stake
                    || tx.data.initial_amount
                    || (tx.data.check && tx.data.check.value)
                    || this.getMultisendValue(tx);
            },
            hasAmount(tx) {
                return typeof this.getAmount(tx) !== 'undefined';
            },
            getMultisendDeliveryList(tx) {
                const addressList = [this.$store.getters.addressList[0]];
                const isOutcomeMultisend = !this.isIncomeMultisend(tx);
                return isOutcomeMultisend ? tx.data.list : tx.data.list.filter((delivery) => {
                    return addressList.some((address) => {
                        if (address.address === delivery.to) {
                            return true;
                        }
                    });
                });
            },
            isMultisendMultipleCoin(tx) {
                if (!this.isMultisend(tx)) {
                    return;
                }
                const currentUserDeliveryList = this.getMultisendDeliveryList(tx);
                return currentUserDeliveryList.some((delivery) => {
                    return delivery.coin !== currentUserDeliveryList[0].coin;
                });
            },
            getMultisendCoin(tx) {
                if (!this.isMultisend(tx)) {
                    return;
                }
                if (!this.isMultisendMultipleCoin(tx)) {
                    return this.getMultisendDeliveryList(tx)[0].coin;
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
                if (tx.type === Number(TX_TYPES.TX_TYPE_SELL) || tx.type === Number(TX_TYPES.TX_TYPE_SELL_ALL)) {
                    return tx.data.coin_to_sell;
                }
                if (tx.type === Number(TX_TYPES.TX_TYPE_BUY)) {
                    return tx.data.coin_to_buy;
                }
            },
            getConvertValue(tx) {
                if (tx.type === Number(TX_TYPES.TX_TYPE_SELL) || tx.type === Number(TX_TYPES.TX_TYPE_SELL_ALL)) {
                    return tx.data.value_to_sell;
                }
                if (tx.type === Number(TX_TYPES.TX_TYPE_BUY)) {
                    return tx.data.value_to_buy;
                }
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
                    <div class="list-item__name">{{ tx.data.coin_to_sell }} → {{ tx.data.coin_to_buy }}</div>
                </div>
                <div class="list-item__center" :class="{'list-item__overflow': true}" v-else-if="isCreateCoin(tx)">
                    <div class="list-item__sup">{{ tx.type | txType }}</div>
                    <div class="list-item__name">{{ tx.data.symbol }}</div>
                </div>
                <div class="list-item__center" :class="{'list-item__overflow': true}" v-else-if="isMining(tx)">
                    <div class="list-item__sup">{{ tx.type | txType }}</div>
                    <div class="list-item__name u-text-nowrap">{{ tx.data.pub_key | short }}</div>
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
                        <div class="list-item__sub">{{ tx.data.coin || tx.data.symbol || tx.data.coin_to_buy || (tx.data.check && tx.data.check.coin) || getMultisendCoin(tx) }}</div>
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
                        <div class="tx-info__value">{{ tx.data.amount | pretty }} {{ tx.data.coin }}</div>
                    </div>

                    <!-- type SELL -->
                    <div class="u-cell" v-if="isSell(tx)">
                        <div class="tx-info__name">Sell coins</div>
                        <div class="tx-info__value">{{ tx.data.value_to_sell | pretty }} {{ tx.data.coin_to_sell }}</div>
                    </div>
                    <div class="u-cell" v-if="isSell(tx)">
                        <div class="tx-info__name">Get coins</div>
                        <div class="tx-info__value">{{ tx.data.value_to_buy | pretty  }} {{ tx.data.coin_to_buy }}</div>
                    </div>

                    <!-- type BUY -->
                    <div class="u-cell" v-if="isBuy(tx)">
                        <div class="tx-info__name">Buy coins</div>
                        <div class="tx-info__value">{{ tx.data.value_to_buy | pretty }} {{ tx.data.coin_to_buy }}</div>
                    </div>
                    <div class="u-cell" v-if="isBuy(tx)">
                        <div class="tx-info__name">Spend coins</div>
                        <div class="tx-info__value">{{ tx.data.value_to_sell | pretty }} {{ tx.data.coin_to_sell }}</div>
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
                    <div class="u-cell" v-if="tx.data.initial_amount">
                        <div class="tx-info__name">Initial Amount</div>
                        <div class="tx-info__value">{{ tx.data.initial_amount | pretty }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.initial_reserve">
                        <div class="tx-info__name">Initial Reserve</div>
                        <div class="tx-info__value">{{ tx.data.initial_reserve | pretty }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.constant_reserve_ratio">
                        <div class="tx-info__name">CRR</div>
                        <div class="tx-info__value">{{ tx.data.constant_reserve_ratio }}&thinsp;%</div>
                    </div>

                    <!-- type DECLARE_CANDIDACY, EDIT_CANDIDATE, DELEGATE, UNBOND, SET_CANDIDATE_ONLINE, SET_CANDIDATE_OFFLINE -->
                    <div class="u-cell" v-if="tx.data.pub_key">
                        <div class="tx-info__name">Public Key</div>
                        <div class="tx-info__value">{{ tx.data.pub_key }}</div>
                    </div>
                    <div class="u-cell" v-if="isDefined(tx.data.stake)">
                        <div class="tx-info__name">Stake</div>
                        <div class="tx-info__value">{{ tx.data.stake | pretty }} {{ tx.data.coin }}</div>
                    </div>
                    <div class="u-cell" v-if="isDefined(tx.data.commission)">
                        <div class="tx-info__name">Commission</div>
                        <div class="tx-info__value">{{ tx.data.commission }}&thinsp;%</div>
                    </div>
                    <div class="u-cell" v-if="isUnbond(tx)">
                        <div class="tx-info__name">Unbond Block</div>
                        <div class="tx-info__value">{{ tx.block + $options.UNBOND_PERIOD }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.reward_address">
                        <div class="tx-info__name">Reward Address</div>
                        <div class="tx-info__value">{{ tx.data.reward_address }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.owner_address">
                        <div class="tx-info__name">Owner Address</div>
                        <div class="tx-info__value">{{ tx.data.owner_address }}</div>
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
                    <div class="u-cell" v-if="tx.data.check && tx.data.check.due_block">
                        <div class="tx-info__name">Due Block</div>
                        <div class="tx-info__value">{{ tx.data.check.due_block }}</div>
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
                </div>
                <a class="tx-info__button bip-button bip-button--ghost-main" :href="getTxUrl(tx.hash)" target="_blank">Explorer</a>
            </div>
        </div>
    </div>
</template>
