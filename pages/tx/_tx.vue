<script>
    import autosize from 'v-autosize';
    import {decodeLink} from 'minter-js-sdk/src/link';
    import {TX_TYPE} from 'minterjs-tx/src/tx-types';
    import {postTx} from '~/api/gate.js';
    import FeeBus from '~/assets/fee.js';
    import {getErrorText} from "~/assets/server-error.js";
    import {pretty, prettyExact, getExplorerTxUrl, txTypeFilter} from '~/assets/utils.js';
    import getTitle from '~/assets/get-title.js';
    import Layout from '~/components/LayoutDefault.vue';
    import Modal from '~/components/Modal.vue';

    let feeBus;

    export default {
        PAGE_TITLE: 'Confirm Transaction',
        components: {
            Layout,
            Modal,
        },
        directives: {
            autosize,
        },
        filters: {
            pretty,
            prettyExact,
            txType: txTypeFilter,
        },
        asyncData({error, store, route}) {
            return new Promise((resolve, reject) => {
                var tx = decodeLink(route.fullPath);
                resolve({tx});
            })
                .catch((e) => {
                    if (e.message === 'privateKey param required if link has password') {
                        return store.dispatch('FETCH_ADDRESS_ENCRYPTED');
                    } else {
                        throw e;
                    }
                })
                .then(() => {
                    var tx = decodeLink(route.fullPath, {privateKey: store.getters.privateKey, decodeCheck: true});
                    return {tx};
                })
                .catch((e) => {
                    console.log(e);
                    error({status: 404, message: `Invalid transaction specified: ${e.message}`});
                });
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            };
        },
        data() {
            return {
                isFormSending: false,
                serverSuccess: '',
                serverError: '',
                tx: {},
                recipient: {
                    name: '',
                    address: '',
                    type: '',
                },
                /** @type FeeData */
                fee: {},
                isModalOpen: false,
            };
        },
        computed: {
            dataFields() {
                const tx = this.tx;
                const data = this.tx.data;
                let fields = [];
                // SEND
                if (data.to) {
                    fields.push({
                        label: 'To',
                        value: data.to,
                        type: 'textarea',
                    });
                }
                if (isDefined(data.value) && !isStake(tx)) {
                    fields.push({
                        label: 'Amount',
                        value: prettyExact(data.value) + ' ' + data.coin,
                    });
                }
                // SELL
                if (isSell(tx)) {
                    let sellAmount;
                    if (tx.type === TX_TYPE.SELL) {
                        sellAmount = data.valueToSell;
                    } else if (tx.type === TX_TYPE.SELL_ALL) {
                        const coin = this.$store.state.balance.find((item) => item.coin === data.coinToSell);
                        sellAmount = coin?.amount || 0;
                    }
                    fields.push({
                        label: 'Sell coins',
                        value: prettyExact(sellAmount) + ' ' + data.coinToSell,
                    });
                    fields.push({
                        label: 'Get coins',
                        value: data.coinToBuy,
                    });
                    fields.push({
                        label: 'Minimum amount to get',
                        value: data.minimumValueToBuy + ' ' + data.coinToBuy,
                    });
                }
                // BUY
                if (isBuy(tx)) {
                    fields.push({
                        label: 'Buy coins',
                        value: prettyExact(data.valueToBuy) + ' ' + data.coinToBuy,
                    });
                    fields.push({
                        label: 'Spend coins',
                        value: data.coinToSell,
                    });
                    fields.push({
                        label: 'Maximum amount to spend',
                        value: data.maximumValueToSell + ' ' + data.coinToSell,
                    });
                }
                // CREATE_COIN
                if (data.name) {
                    fields.push({
                        label: 'Name',
                        value: data.name,
                    });
                }
                if (data.symbol) {
                    fields.push({
                        label: 'Symbol',
                        value: data.symbol,
                    });
                }
                if (data.initialAmount) {
                    fields.push({
                        label: 'Initial Amount',
                        value: prettyExact(data.initialAmount) + ' ' + data.symbol,
                    });
                }
                if (data.initialReserve) {
                    fields.push({
                        label: 'Initial Reserve',
                        value: data.initialReserve + ' ' + this.$store.getters.COIN_NAME,
                    });
                }
                if (data.constantReserveRatio) {
                    fields.push({
                        label: 'CRR',
                        value: data.constantReserveRatio + ' %',
                    });
                }
                if (data.maxSupply) {
                    fields.push({
                        label: 'Max supply',
                        value: prettyExact(data.maxSupply),
                    });
                }
                // DELEGATE, UNBOND, DECLARE_CANDIDACY, SET_CANDIDATE_ONLINE, SET_CANDIDATE_OFFLINE
                if (data.publicKey) {
                    fields.push({
                        label: 'Public Key',
                        value: data.publicKey,
                        type: 'textarea',
                        rows: 2,
                    });
                }
                if (isStake(tx) && isDefined(data.stake || data.value)) {
                    fields.push({
                        label: 'Stake',
                        value: prettyExact(tx.data.stake || tx.data.value) + ' ' + data.coin,
                    });
                }
                if (isDefined(data.commission)) {
                    fields.push({
                        label: 'Commission',
                        value: data.commission + ' %',
                    });
                }
                if (data.rewardAddress) {
                    fields.push({
                        label: 'Reward Address',
                        value: data.rewardAddress,
                        type: 'textarea',
                    });
                }
                if (data.ownerAddress) {
                    fields.push({
                        label: 'Owner Address',
                        value: data.ownerAddress,
                        type: 'textarea',
                    });
                }
                // REDEEM_CHECK
                if (data.check) {
                    fields.push({
                        label: 'Check',
                        value: data.check,
                        type: 'textarea',
                    });
                    fields.push({
                        label: 'Amount',
                        value: prettyExact(data.checkData.value) + ' ' + data.checkData.coin,
                    });
                }
                // MULTISEND
                if (data.list) {
                    fields.push({
                        label: 'Recipients',
                        value: data.list.map((item, index) => index + '.\u00A0' + item.to + '\u00A0←\u00A0' + prettyExact(item.value) + '\u00A0' + item.coin).join(', \n'),
                        type: 'textarea',
                        rows: data.list.length,
                    });
                }

                return fields;
            },
            feeBusParams() {
                return {
                    txType: this.tx.type,
                    txFeeOptions: {
                        payload: this.tx.payload,
                        multisendCount: this.tx.type === TX_TYPE.MULTISEND ? this.tx.data.list.length : undefined,
                    },
                    selectedCoinSymbol: this.tx.data.coin,
                    selectedFeeCoinSymbol: this.tx.gasCoin,
                    baseCoinAmount: this.$store.getters.baseCoin && this.$store.getters.baseCoin.amount,
                    // isOffline: this.$store.getters.isOfflineMode,
                };
            },
            isRedeemCheck() {
                return isRedeemCheck(this.tx);
            },
        },
        watch: {
            feeBusParams: {
                handler(newVal) {
                    if (feeBus && typeof feeBus.$emit === 'function') {
                        feeBus.$emit('updateParams', newVal);
                    }
                },
                deep: true,
            },
        },
        created() {
            feeBus = new FeeBus(this.feeBusParams);
            this.fee = feeBus.fee;
            feeBus.$on('updateFee', (newVal) => {
                this.fee = newVal;
            });
        },
        methods: {
            openTxModal() {
                if (this.isFormSending) {
                    return;
                }

                this.isModalOpen = true;
            },
            sendTx() {
                if (this.isFormSending) {
                    return;
                }

                this.isFormSending = true;
                this.isModalOpen = false;
                this.serverError = '';
                this.serverSuccess = '';
                this.$store.dispatch('FETCH_ADDRESS_ENCRYPTED')
                    .then(() => {
                        postTx({
                            privateKey: this.$store.getters.privateKey,
                            ...this.tx,
                        }, {privateKey: this.$store.getters.privateKey}).then((txHash) => {
                            this.isFormSending = false;
                            this.serverSuccess = txHash;
                        }).catch((error) => {
                            console.log(error);
                            this.isFormSending = false;
                            this.serverError = getErrorText(error);
                        });
                    })
                    .catch((error) => {
                        this.isFormSending = false;
                        this.serverError = getErrorText(error);
                    });
            },
            getExplorerTxUrl,
        },
    };

    function isDefined(value) {
        return typeof value !== 'undefined';
    }
    function isSell(tx) {
        return tx.type === TX_TYPE.SELL || tx.type === TX_TYPE.SELL_ALL;
    }
    function isBuy(tx) {
        return tx.type === TX_TYPE.BUY;
    }
    function isStake(tx) {
        return tx.type === TX_TYPE.UNBOND || tx.type === TX_TYPE.DELEGATE || tx.type === TX_TYPE.DECLARE_CANDIDACY;
    }
    function isRedeemCheck(tx) {
        return tx.type === TX_TYPE.REDEEM_CHECK;
    }

</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true" back-url="/">

        <form novalidate @submit.prevent="openTxModal">
            <div class="u-section u-container">
                <div class="bip-field bip-field--row">
                    <span class="bip-field__label">Transaction type</span>
                    <input class="bip-field__input" type="text" readonly
                           :value="tx.type | txType"
                    >
                </div>

                <div class="bip-field bip-field--row" v-for="field in dataFields" :key="field.label">
                    <span class="bip-field__label">{{ field.label }}</span>
                    <textarea class="bip-field__input" type="text" readonly v-autosize
                           :rows="field.rows || 1"
                           :value="field.value"
                           v-if="field.type === 'textarea'"
                    ></textarea>
                    <input class="bip-field__input" type="text" readonly
                           :value="field.value"
                           v-else
                    >
                </div>

                <div class="bip-field bip-field--row">
                    <span class="bip-field__label">Payload message</span>
                    <input class="bip-field__input" type="text" readonly
                           :value="tx.payload"
                    >
                </div>
            </div>

            <!--@TODO convert result approximation-->

            <div class="list">
                <div class="list-item" v-if="isRedeemCheck">
                    <div class="list-item__center">
                        <span class="list-item__name u-text-center">You don't pay transaction fee</span>
                    </div>
                </div>
                <div class="list-item" v-else>
                    <div class="list-item__center">
                        <span class="list-item__name u-text-nowrap">Transaction Fee</span>
                    </div>
                    <div class="list-item__right u-text-right">
                        <div class="list-item__label list-item__label--strong">
                            {{ fee.value | pretty }} {{ fee.coinSymbol }}
                            <span class="u-display-ib" v-if="!fee.isBaseCoin">({{ fee.baseCoinValue | pretty }} {{ $store.getters.COIN_NAME }})</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="u-section u-container">
                <button class="bip-button bip-button--main" :class="{'is-loading': isFormSending}">
                    <span class="bip-button__content">Proceed</span>
                    <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                    </svg>
                </button>
                <nuxt-link class="bip-button bip-button--ghost-main" to="/">Cancel</nuxt-link>
                <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
            </div>
        </form>

        <!-- confirm send modal -->
        <Modal :isOpen.sync="isModalOpen" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Confirm</h3>
                <div class="modal__content">
                    <p>Please confirm transaction sending</p>
                </div>
                <div class="modal__footer">
                    <button class="bip-button bip-button--main" @click="sendTx">Confirm and send</button>
                    <button class="bip-button bip-button--ghost-main" @click="isModalOpen = false">Cancel</button>
                </div>
            </div>
        </Modal>

        <!-- wait modal -->
        <Modal :isOpen="isFormSending" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Please wait</h3>
                <div class="modal__content">
                    <svg class="loader loader--inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                    </svg>
                    <span class="u-text-middle">Sending transaction...</span>
                </div>
            </div>
        </Modal>

        <!-- success modal -->
        <Modal :isOpen="!!serverSuccess" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Success</h3>
                <div class="modal__content">
                    <p>Transaction successfully sent!</p>
                </div>
                <div class="modal__footer">
                    <a class="bip-button bip-button--ghost-main" :href="getExplorerTxUrl(serverSuccess)" target="_blank">View Transaction</a>
                    <nuxt-link class="bip-button bip-button--ghost-main" to="/">Close</nuxt-link>
                </div>
            </div>
        </Modal>
    </Layout>
</template>
