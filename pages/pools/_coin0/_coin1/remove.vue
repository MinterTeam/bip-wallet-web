<script>
import Big from 'big.js';
import {IMaskDirective} from 'vue-imask';
import {validationMixin} from 'vuelidate';
import required from 'vuelidate/lib/validators/required';
import {TX_TYPE} from 'minterjs-util/src/tx-types.js';
import {getPool, getPoolProvider, getStatus} from "~/api/explorer.js";
import {getExplorerTxUrl, pretty, prettyExact} from "~/assets/utils.js";
import getTitle from '~/assets/get-title.js';
import FeeBus from '~/assets/fee.js';
import {getErrorText} from '~/assets/server-error.js';
import Layout from '~/components/LayoutDefault.vue';
import Modal from '~/components/Modal.vue';
import {postTx} from '~/api/gate.js';

let feeBus;

export default {
    PAGE_TITLE: 'Add liquidity',
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
    components: {
        Layout,
        Modal,
    },
    mixins: [validationMixin],
    directives: {
        imask: IMaskDirective,
    },
    asyncData({ store, params, error }) {
        if (!params.coin0 || !params.coin1 || params.coin0 === params.coin1) {
            return error({
                statusCode: 404,
                message: 'Pool not found',
            });
        }

        const poolPromise = getPool(params.coin0, params.coin1);
        const providerPromise = getPoolProvider(params.coin0, params.coin1, store.getters.address)
            .catch((requestError) => {
                console.log(requestError);
            });
        const statusPromise = getStatus();

        return Promise.all([poolPromise, providerPromise, statusPromise])
            .then(([pool, providerPool, statusData]) => {
                return {
                    pool: {
                        ...pool,
                        yourAmount0: providerPool?.amount0 || 0,
                        yourAmount1: providerPool?.amount1 || 0,
                        yourLiquidity: providerPool?.liquidity || 0,
                        yourLiquidityBip: providerPool?.liquidityBip || 0,
                        yourLiquidityShare: providerPool?.liquidityShare || 0,
                    },
                    bipPriceUsd: statusData.bipPriceUsd,
                };
            })
            .catch((requestError) => {
                console.log(requestError);
                let statusCode = requestError.request && requestError.request.status;
                error({
                    statusCode,
                    message: statusCode === 404 ? 'Pool not found' : getErrorText(requestError),
                });
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
            /** @type Pool */
            pool: {},
            bipPriceUsd: 0,
            isFormSending: false,
            successTx: null,
            serverError: '',
            form: {
                liquidity: '',
            },
            /** @type FeeData */
            fee: {},
            isUseMax: false,
            isConfirmModalOpen: false,
            isSuccessModalOpen: false,
        };
    },
    validations() {
        const form = {
            liquidity: {
                //@TODO maxValue
                //@TODO validAmount
                required,
            },
        };

        return {
            form,
        };
    },
    computed: {
        poolName() {
            return this.pool.coin0.symbol + ' / ' + this.pool.coin1.symbol;
        },
        // liquidityUsd() {
        //     return this.pool.liquidityBip * this.bipPriceUsd;
        // },
        // coin0Price() {
        //     return calculateTradeReturn(this.pool.amount0, this.pool.amount1);
        // },
        // coin1Price() {
        //     return calculateTradeReturn(this.pool.amount1, this.pool.amount0);
        // },
        coin0Amount() {
            if (!this.pool.yourAmount0 || !this.form.liquidity) {
                return 0;
            }

            return new Big(this.form.liquidity).div(this.pool.yourLiquidity).times(this.pool.yourAmount0).toFixed();
        },
        coin1Amount() {
            if (!this.pool.yourAmount1 || !this.form.liquidity) {
                return 0;
            }

            return new Big(this.form.liquidity).div(this.pool.yourLiquidity).times(this.pool.yourAmount1).toFixed();
        },
        coin1Max() {
            const slippagePart = new Big(this.form.slippage || 0).div(100).plus(1);
            return slippagePart.times(this.coin1Amount).toFixed(18);
        },
        feeBusParams() {
            return {
                txParams: this.txParams,
                baseCoinAmount: this.$store.getters.baseCoin && this.$store.getters.baseCoin.amount,
                fallbackToCoinToSpend: true,
            };
        },
        txParams() {

            return {
                type: TX_TYPE.REMOVE_LIQUIDITY,
                data: {
                    coin0: this.pool.coin0.id,
                    coin1: this.pool.coin1.id,
                    liquidity: this.form.liquidity,
                },
            };
        },
    },
    watch: {
        feeBusParams: {
            handler(newVal) {
                if (feeBus && typeof feeBus.$emit === 'function') {
                    feeBus.$emit('update-params', newVal);
                }
            },
            deep: true,
        },
    },
    created() {
        feeBus = new FeeBus(this.feeBusParams);
        this.fee = feeBus.fee;
        feeBus.$on('update-fee', (newVal) => {
            this.fee = newVal;
            if (this.isUseMax) {
                // update form amount to consider updated feeValue
                this.useMax();
            }
        });
    },
    methods: {
        pretty,
        prettyExact,
        getExplorerTxUrl,
        onAcceptAmount(e) {
            this.form.liquidity = e.detail._unmaskedValue;
            this.isUseMax = false;
        },
        openConfirmModal() {
            if (this.isFormSending) {
                return;
            }
            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            this.isConfirmModalOpen = true;
        },
        sendTx() {
            if (this.isFormSending) {
                return;
            }

            if (this.$v.$invalid) {
                this.$v.$touch();
                return;
            }

            this.isFormSending = true;
            this.isConfirmModalOpen = false;
            this.serverError = '';
            this.successTx = null;
            const txParams = {
                ...this.txParams,
                gasCoin: this.fee.coin,
            };

            return postTx(txParams, {privateKey: this.$store.getters.privateKey})
                .then((tx) => {
                    this.isFormSending = false;
                    this.isSuccessModalOpen = true;
                    this.successTx = tx;
                    this.clearForm();
                })
                .catch((error) => {
                    console.log(error);
                    this.isFormSending = false;
                    this.serverError = getErrorText(error);
                });
        },
        // useMax() {
        //     this.form.volume0 = this.maxAmount;
        //     // this.amountMasked = this.maxAmount;
        //     this.$refs.amountInput.maskRef.typedValue = this.maxAmount;
        //     const cursorPos = this.maxAmount.toString().length;
        //     this.$refs.amountInput.maskRef._selection = {start: cursorPos, end: cursorPos};
        //     this.isUseMax = true;
        // },
        clearForm() {
            this.form.volume0 = '';
            this.$refs.amountInput.maskRef.typedValue = '';
            this.$v.$reset();
        },
    },
};

function calculateTradeReturn(amountIn, amountOut) {
    if (Number(amountIn) === 0) {
        return 0;
    }
    return new Big(amountOut).div(amountIn);
    // return amountOut - (amountIn * amountOut / (amountIn + 1));
}
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true">
        <div class="list-item">
            <div class="list-item__center u-text-decent u-text-center">
                Remove liquidity
            </div>
        </div>
        <div class="list-item">
            <div class="list-item__center">
                <div class="list-item__sup u-text-uppercase">LP tokens</div>
                <div class="list-item__name">{{ poolName }}</div>
            </div>
            <div class="list-item__right">
                <div class="list-item__sup u-text-uppercase">Balance</div>
                <div class="list-item__amount">{{ pretty(pool.yourLiquidity) }}</div>
            </div>
        </div>

        <form novalidate @submit.prevent="openConfirmModal()" >
            <div class="u-section u-container">
                <label class="bip-field bip-field--row bip-field--with-max" :class="{'is-error': $v.form.liquidity.$error}">
                    <span class="bip-field__label">LP amount</span>
                    <input class="bip-field__input" type="text" inputmode="decimal" ref="amountInput"

                           v-imask="$options.amountImaskOptions"
                           @accept="onAcceptAmount"
                           @blur="$v.form.liquidity.$touch()"
                    >
<!--                    <button class="bip-field__button bip-link u-semantic-button" type="button" @click="useMax">Use max</button>-->
                    <span class="bip-field__error" v-if="$v.form.liquidity.$dirty && !$v.form.liquidity.required">Enter amount</span>
<!--                    <span class="bip-field__error" v-else-if="$v.form.liquidity.$dirty && !$v.form.liquidity.maxAmount">Not enough LP tokens</span>-->
                </label>
                <label class="bip-field bip-field--row">
                    <span class="bip-field__label">{{ pool.coin0.symbol }} amount</span>
                    <span class="bip-field__input">
                        {{ pretty(coin0Amount) }}
                    </span>
                </label>
                <label class="bip-field bip-field--row">
                    <span class="bip-field__label">{{ pool.coin1.symbol }} amount</span>
                    <span class="bip-field__input">
                        {{ pretty(coin1Amount) }}
                    </span>
                </label>
            </div>

            <div class="list">
                <a class="list-item">
                    <div class="list-item__center">
                        <span class="list-item__name u-text-nowrap">Transaction fee</span>
                    </div>
                    <div class="list-item__right list-item__right--with-loader u-text-right" :class="{'is-loading': fee.isLoading}">
                        <div class="list-item__label list-item__label--strong">
                            {{ fee.coin }} {{ pretty(fee.value) }}
                            <span class="u-display-ib" v-if="!fee.isBaseCoin">({{ $store.getters.COIN_NAME }} {{ pretty(fee.baseCoinValue) }})</span>
                        </div>
                        <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                            <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                        </svg>
                    </div>
                </a>
            </div>

            <div class="u-section u-container">
                <button class="bip-button bip-button--main" :class="{'is-loading': isFormSending, 'is-disabled': $v.$invalid}">
                    <span class="bip-button__content">Remove</span>
                    <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                    </svg>
                </button>
                <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
            </div>
        </form>

        <!-- confirm send modal -->
        <Modal :isOpen.sync="isConfirmModalOpen" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">
                    You're removing
                </h3>
                <div class="modal__content u-text-left">
                    <label class="bip-field bip-field--row">
                        <span class="bip-field__label">{{ poolName }} LP amount</span>
                        <span class="bip-field__input">{{ form.liquidity }}</span>
                    </label>
                    <label class="bip-field bip-field--row">
                        <span class="bip-field__label">{{ pool.coin0.symbol }} amount</span>
                        <span class="bip-field__input">{{ pretty(coin0Amount) }}</span>
                    </label>
                    <label class="bip-field bip-field--row">
                        <span class="bip-field__label">{{ pool.coin1.symbol }} amount</span>
                        <span class="bip-field__input">{{ pretty(coin1Amount) }}</span>
                    </label>
                </div>
                <div class="modal__footer">
                    <button class="bip-button bip-button--main" @click="sendTx">Confirm</button>
                    <button class="bip-button bip-button--ghost-main" @click="isConfirmModalOpen = false">Cancel</button>
                </div>
            </div>
        </Modal>

        <!-- wait modal -->
        <Modal :isOpen.sync="isFormSending" :hideCloseButton="true">
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
        <Modal :isOpen.sync="isSuccessModalOpen" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Success</h3>
                <div class="modal__content">
                    <p>Transaction is received by</p>
                </div>
                <div class="modal__footer">
                    <a class="bip-button bip-button--ghost-main" :href="getExplorerTxUrl(successTx.hash)" target="_blank" v-if="successTx">View transaction</a>
                    <button class="bip-button bip-button--ghost-main" @click="isSuccessModalOpen = false">Close</button>
                </div>
            </div>
        </Modal>
    </Layout>
</template>
