<script>
    import {EXPLORER_URL} from "~/assets/variables";
    import {getNameLetter, getTimeStamp, pretty, txTypeFilter, shortHashFilter} from "~/assets/utils";
    import {TX_TYPES} from '~/assets/variables';

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
            },
            getName(address) {
                if (!address) {
                    return '';
                }
                if (this.$store.state.userList[address]) {
                    return '@' + this.$store.state.userList[address].username;
                } else {
                    return shortHashFilter(address);
                }
            },
            getAvatar(address) {
                if (this.$store.state.userList[address]) {
                    return this.$store.state.userList[address].avatar.src;
                }
            },
            getNameLetter,
            getTxUrl(hash) {
                return EXPLORER_URL + '/transactions/' + hash;
            },
            isSend(tx) {
                return tx.type === TX_TYPES.SEND;
            },
            isCreateCoin(tx) {
                return tx.type === TX_TYPES.CREATE_COIN;
            },
            isSell(tx) {
                return tx.type === TX_TYPES.SELL_COIN || tx.type === TX_TYPES.SELL_ALL_COIN;
            },
            isBuy(tx) {
                return tx.type === TX_TYPES.BUY_COIN;
            },
            isExchange(tx) {
                return this.isSell(tx) || this.isBuy(tx);
            },
            isMining(tx) {
                return tx.type === TX_TYPES.DECLARE_CANDIDACY || tx.type === TX_TYPES.DELEGATE || tx.type === TX_TYPES.UNBOND || tx.type === TX_TYPES.SET_CANDIDATE_OFFLINE || tx.type === TX_TYPES.SET_CANDIDATE_ONLINE;
            },
            isUnbond(tx) {
                return tx.type === TX_TYPES.UNBOND;
            },
            isDelegate(tx) {
                return tx.type === TX_TYPES.DELEGATE;
            },
            isRedeem(tx) {
                return tx.type === TX_TYPES.REDEEM_CHECK;
            },
            isIncome(tx) {
                const addressList = [this.$store.getters.addressList[0]];
                const isIncomeSend = addressList.some((address) => {
                    if (address.address === tx.data.to) {
                        return true;
                    }
                });
                return isIncomeSend || this.isExchange(tx) || this.isCreateCoin(tx) || this.isUnbond(tx);
            },
            isDefined(value) {
                return typeof value !== 'undefined';
            },
            hasAmount(tx) {
                return typeof tx.data.amount !== 'undefined'
                    || typeof tx.data.value_to_buy !== 'undefined'
                    || typeof tx.data.stake !== 'undefined'
                    || typeof tx.data.initial_amount !== 'undefined';
            },
            getConvertCoinSymbol(tx) {
                if (tx.type === TX_TYPES.SELL_COIN || tx.type === TX_TYPES.SELL_ALL_COIN) {
                    return tx.data.coin_to_sell;
                }
                if (tx.type === TX_TYPES.BUY_COIN) {
                    return tx.data.coin_to_buy;
                }
            },
            getConvertValue(tx) {
                if (tx.type === TX_TYPES.SELL_COIN || tx.type === TX_TYPES.SELL_ALL_COIN) {
                    return tx.data.value_to_sell;
                }
                if (tx.type === TX_TYPES.BUY_COIN) {
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
                    <img class="list-item__thumbnail" :src="getAvatar(getOtherAddress(tx))" alt="" role="presentation" v-else-if="getAvatar(getOtherAddress(tx))">
                    <div class="list-item__thumbnail" v-else>{{ getNameLetter(getName(getOtherAddress(tx))) }}</div>
                </div>
                <!-- name -->
                <div class="list-item__center" :class="{'list-item__center--overflow': true}" v-if="isSend(tx)">
                    <div class="list-item__name" :class="{'u-text-overflow': true}">{{ getName(getOtherAddress(tx)) }}</div>
                </div>
                <div class="list-item__center" :class="{'list-item__center--overflow': true}" v-else-if="isExchange(tx)">
                    <div class="list-item__sup">Exchange</div>
                    <div class="list-item__name">{{ tx.data.coin_to_sell }} → {{ tx.data.coin_to_buy }}</div>
                </div>
                <div class="list-item__center" :class="{'list-item__center--overflow': true}" v-else-if="isMining(tx)">
                    <div class="list-item__sup">{{ tx.type | txType }}</div>
                    <div class="list-item__name">{{ tx.data.pub_key | short }}</div>
                </div>
                <!--@TODO check amount-->
                <div class="list-item__center" :class="{'list-item__center--overflow': true}" v-else-if="isRedeem(tx)">
                    <div class="list-item__sup">{{ tx.type | txType }}</div>
                    <div class="list-item__name">{{ tx.data.raw_check | short }}</div>
                </div>
                <div class="list-item__center" :class="{'list-item__center--overflow': true}" v-else>
                    <div class="list-item__sup">{{ tx.type | txType }}</div>
                    <div class="list-item__name">{{ tx.hash | short }}</div>
                </div>

                <!-- amount -->
                <div class="list-item__right" :class="{'list-item__right--exchange': isExchange(tx)}" v-if="hasAmount(tx)">
                    <div class="list-item__amount" :class="{'list-item__amount--plus': isIncome(tx)}">
                        {{ isIncome(tx) ? '+' : '-' }}&nbsp;{{ tx.data.amount || tx.data.value_to_buy || tx.data.stake || tx.data.initial_amount || 0 | pretty }}
                    </div>
                    <div class="list-item__sub">{{ tx.data.coin || tx.data.symbol || tx.data.coin_to_buy }}</div>
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

                    <!-- type DECLARE_CANDIDACY, DELEGATE, UNBOND, SET_CANDIDATE_ONLINE, SET_CANDIDATE_OFFLINE -->
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

                    <!-- type REDEEM_CHECK -->
                    <div class="u-cell" v-if="tx.data.raw_check">
                        <div class="tx-info__name">Check</div>
                        <div class="tx-info__value">{{ tx.data.raw_check }}</div>
                    </div>
                    <div class="u-cell" v-if="tx.data.proof">
                        <div class="tx-info__name">Proof</div>
                        <div class="tx-info__value">{{ tx.data.proof }}</div>
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
