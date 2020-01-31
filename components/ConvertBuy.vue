<script>
    import axios from 'axios';
    import {IMaskDirective} from 'vue-imask';
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import minLength from 'vuelidate/lib/validators/minLength';
    import maxLength from 'vuelidate/lib/validators/maxLength';
    import withParams from 'vuelidate/lib/withParams';
    import decode from 'entity-decode';
    import BuyTxParams from "minter-js-sdk/src/tx-params/convert-buy";
    import {TX_TYPE} from 'minterjs-tx/src/tx-types';
    import {postTx, estimateCoinBuy} from '~/api/gate';
    import FeeBus from '~/assets/fee';
    import {getErrorText} from "~/assets/server-error";
    import {pretty} from '~/assets/utils';
    import FieldCoinList from '~/components/FieldCoinList';

    const isValidAmount = withParams({type: 'validAmount'}, (value) => {
        return parseFloat(value) >= 0;
    });

    let feeBus;

    let estimationCancel;

    export default {
        components: {
            FieldCoinList,
        },
        mixins: [validationMixin],
        directives: {
            imask: IMaskDirective,
        },
        filters: {
            pretty,
        },

        data() {
            const coinList = this.$store.state.balance;
            return {
                isFormSending: false,
                serverError: '',
                form: {
                    coinFrom: coinList && coinList.length ? coinList[0].coin : '',
                    coinTo: '',
                    buyAmount: '',
                },
                amountImaskOptions: {
                    mask: Number,
                    scale: 18, // digits after point, 0 for integers
                    signed: false,  // disallow negative
                    thousandsSeparator: '',  // any single char
                    padFractionalZeros: false,  // if true, then pads zeros at end to the length of scale
                    normalizeZeros: false, // appends or removes zeros at ends
                    radix: '.',  // fractional delimiter
                    mapToRadix: [','],  // symbols to process as radix
                },
                // amountMasked: '',
                /** @type FeeData */
                fee: {},
                estimation: null,
                estimationTimer: null,
                estimationLoading: false,
                estimationError: false,
            };
        },
        validations() {
            return {
                form: {
                    coinFrom: {
                        required,
                    },
                    coinTo: {
                        required,
                        minLength: minLength(3),
                        maxLength: maxLength(10),
                    },
                    buyAmount: {
                        required,
                        validAmount: isValidAmount,
                    },
                },
            };
        },
        watch: {
            // every valid form change will lead to estimationTimer set up
            form: {
                handler() {
                    if (this.$v.$invalid) {
                        return;
                    }
                    clearTimeout(this.estimationTimer);
                    this.estimationTimer = setTimeout(this.getEstimation, 1000);
                },
                deep: true,
            },
            feeBusParams: {
                handler(newVal) {
                    if (feeBus && typeof feeBus.$emit === 'function') {
                        feeBus.$emit('updateParams', newVal);
                    }
                },
                deep: true,
            },
        },
        computed: {
            feeBusParams() {
                return {
                    txType: TX_TYPE.BUY,
                    txFeeOptions: {payload: this.form.message},
                    selectedCoinSymbol: this.form.coinFrom,
                    // selectedFeeCoinSymbol: this.form.feeCoinSymbol,
                    baseCoinAmount: this.$store.getters.baseCoin && this.$store.getters.baseCoin.amount,
                    // isOffline: this.$store.getters.isOfflineMode,
                };
            },
            isEstimationWaiting() {
                return this.estimationTimer || this.estimationLoading;
            },
            isEstimationErrorVisible() {
                return this.estimationError && !this.isEstimationWaiting;
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
            // force estimation after blur if needed
            inputBlur() {
                // if estimation was postponed
                if (this.estimationTimer) {
                    clearTimeout(this.estimationTimer);
                    this.getEstimation();
                }
            },
            clearEstimationTimer() {
                clearTimeout(this.estimationTimer);
                this.estimationTimer = null;
            },
            getEstimation() {
                //@TODO cancel
                if (this.estimationLoading && typeof estimationCancel === 'function') {
                    // cancel previous request
                    estimationCancel();
                }
                this.estimationTimer = null;
                if (this.form.coinFrom && this.form.coinFrom === this.form.coinTo) {
                    this.estimationError = decode('Estimation error: you have to select different&nbsp;coins');
                    return;
                }
                this.estimationLoading = true;
                this.estimationError = false;
                estimateCoinBuy({
                    coinToBuy: this.form.coinTo,
                    valueToBuy: this.form.buyAmount,
                    coinToSell: this.form.coinFrom,
                }, { cancelToken: new axios.CancelToken((cancelFn) => estimationCancel = cancelFn) })
                    .then((result) => {
                        this.estimation = result.will_pay;
                        this.estimationLoading = false;
                    })
                    .catch((error) => {
                        this.estimationLoading = false;
                        this.estimationError = getErrorText(error, 'Estimation error: ');
                    });
            },
            onAcceptAmount(e) {
                // this.amountMasked = e.detail._value;
                this.form.buyAmount = e.detail._unmaskedValue;
            },

            submit() {
                if (this.isFormSending) {
                    return;
                }

                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }

                this.isFormSending = true;
                this.serverError = '';
                this.$store.dispatch('FETCH_ADDRESS_ENCRYPTED')
                    .then(() => {
                        //@TODO maxSellAmount
                        postTx(new BuyTxParams({
                            privateKey: this.$store.getters.privateKey,
                            ...this.form,
                            feeCoinSymbol: this.fee.coinSymbol,
                        })).then((txHash) => {
                            this.$emit('successTx', {hash: txHash});
                            this.isFormSending = false;
                            this.clearForm();
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
            clearForm() {
                this.form.coinFrom = this.$store.state.balance && this.$store.state.balance.length ? this.$store.state.balance[0].coin : '';
                this.form.coinTo = '';
                this.form.buyAmount = '';
                // this.amountMasked = '';
                this.$refs.amountInput.maskRef.typedValue = '';
                this.$v.$reset();
            },
        },
    };
</script>

<template>
    <form novalidate @submit.prevent="submit">
        <div class="u-section u-container">
            <FieldCoinList v-model="form.coinTo" :$value="$v.form.coinTo" @blur="inputBlur()"/>
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.buyAmount.$error}">
                <span class="bip-field__label">Amount</span>
                <input class="bip-field__input" type="text" inputmode="decimal" ref="amountInput"
                       v-imask="amountImaskOptions"
                       @accept="onAcceptAmount"
                       @blur="$v.form.buyAmount.$touch(); inputBlur()"
                >
                <span class="bip-field__error" v-if="$v.form.buyAmount.$dirty && !$v.form.buyAmount.required">Enter amount</span>
                <span class="bip-field__error" v-else-if="$v.form.buyAmount.$dirty && !$v.form.buyAmount.validAmount">Wrong amount</span>
            </label>
        </div>
        <div class="convert__divider">
            <div class="convert__divider-inner">
                <img class="convert__divider-icon" src="/img/icon-convert-buy.svg" alt="" role="presentation">
            </div>
        </div>

        <div class="u-section u-container">
            <label class="bip-field bip-field--row bip-field--select" :class="{'is-error': $v.form.coinFrom.$error}">
                <span class="bip-field__label">Coin you have</span>
                <select class="bip-field__input"
                        v-model="form.coinFrom"
                        @blur="$v.form.coinFrom.$touch(); inputBlur()"
                >
                    <option v-for="coin in $store.state.balance" :key="coin.coin" :value="coin.coin">{{ coin.coin }} ({{ coin.amount | pretty }})</option>
                </select>
                <span class="bip-field__error" v-if="$v.form.coinFrom.$dirty && !$v.form.coinFrom.required">Enter coin</span>
            </label>
        </div>

        <div class="u-section--bottom u-container">
            <div class="convert__panel" :class="{'is-loading': isEstimationWaiting}" v-if="!$v.$invalid && !isEstimationErrorVisible">
                <div class="convert__panel-content">
                    You will pay approximately
                    <p class="convert__panel-amount">{{ $options.filters.pretty(estimation || 0) }} {{ form.coinFrom }}</p>
                </div>
                <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                    <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                </svg>
            </div>
            <div class="convert__panel" v-if="!$v.$invalid && isEstimationErrorVisible">{{ estimationError }}</div>
            <p class="convert__panel-note">The final amount depends on&nbsp;the&nbsp;exchange rate at&nbsp;the&nbsp;moment of&nbsp;transaction.</p>
        </div>

        <div class="list">
            <a class="list-item">
                <div class="list-item__center">
                    <span class="list-item__name u-text-nowrap">Transaction Fee</span>
                </div>
                <div class="list-item__right u-text-right">
                    <div class="list-item__label list-item__label--strong">
                        {{ fee.coinSymbol }} {{ fee.value | pretty }}
                        <span class="u-display-ib" v-if="!fee.isBaseCoin">({{ $store.getters.COIN_NAME }} {{ fee.baseCoinValue | pretty }})</span>
                    </div>
                </div>
            </a>
        </div>

        <div class="u-section u-container">
            <button class="bip-button bip-button--main" :class="{'is-loading': isFormSending, 'is-disabled': $v.$invalid}">
                <span class="bip-button__content">Exchange</span>
                <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                    <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                </svg>
            </button>
            <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
        </div>
    </form>
</template>
