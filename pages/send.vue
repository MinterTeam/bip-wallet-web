<script>
    import axios from 'axios';
    import {IMaskDirective} from 'vue-imask';
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import maxValue from 'vuelidate/lib/validators/maxValue';
    import withParams from 'vuelidate/lib/withParams';
    import SendTxParams from "minter-js-sdk/src/tx-params/send";
    import {getAddressInfoByContact} from "~/api";
    import {postTx} from '~/api/minter-node';
    import {getServerValidator, fillServerErrors, getErrorText, getErrorCode} from "~/assets/server-error";
    import {getAvatarUrl, pretty, getExplorerTxUrl} from '~/assets/utils';
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';
    import Modal from '~/components/Modal';

    const isValidAmount = withParams({type: 'validAmount'}, (value) => {
        return parseFloat(value) > 0;
    });

    let recipientCheckData = null; // storage with latest recipient data to check
    let recipientCheckCancel;
    let recipientError = {
        username: {},
        email: {},
    };

    export default {
        PAGE_TITLE: 'Send Coins',
        components: {
            Layout,
            Modal,
        },
        mixins: [validationMixin],
        directives: {
            imask: IMaskDirective,
        },
        filters: {
            pretty,
        },
        fetch({ store }) {
            return store.dispatch('FETCH_BALANCE');
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
            const coinList = this.$store.state.balance;
            return {
                isFormSending: false,
                serverSuccess: '',
                serverError: '',
                form: {
                    coinSymbol: coinList && coinList.length ? coinList[0].coin : '',
                    address: '',
                    amount: '',
                },
                sve: {
                    address: {invalid: false, isActual: false, message: ''},
                },
                recipient: {
                    name: '',
                    address: '',
                    type: '',
                },
                // saved recipient entry for success modal
                lastRecipient: {
                    name: '',
                    address: '',
                    type: '',
                },
                recipientCheckTimer: null,
                recipientLoading: false, // latest recipient value sent to check and still loading
                amountImaskOptions: {
                    mask: /^[0-9]*\.?[0-9]*$/,
                },
                amountMasked: '',
                isSendForFree: false,
                isModalOpen: false,
                isWaitModalOpen: false,
                isSuccessModalOpen: false,
            };
        },
        validations() {
            return {
                form: {
                    coinSymbol: {
                        required,
                    },
                    address: {
                        required,
                        server: getServerValidator('address'),
                    },
                    amount: {
                        required,
                        validAmount: isValidAmount,
                        maxValue: maxValue(this.maxAmount || 0),
                    },
                },
            };
        },
        computed: {
            isRecipientCheckWait() {
                return this.recipientLoading || this.recipientCheckTimer;
            },
            maxAmount() {
                let selectedCoin;
                this.$store.state.balance.some((coin) => {
                    if (coin.coin === this.form.coinSymbol) {
                        selectedCoin = coin;
                        return true;
                    }
                });
                return selectedCoin ? selectedCoin.amount : 0;
            },
            feeCoinSymbol() {
                const SEND_FEE = 0.01;
                if (this.$store.getters.baseCoin && this.$store.getters.baseCoin.amount >= SEND_FEE) {
                    return this.$store.getters.baseCoin.coin;
                }
                // otherwise coinSymbol will be used as feeCoinSymbol
                return undefined;
            },
        },
        watch: {
            //@TODO loading indicator instead of error
            'recipient.name': {
                handler(newVal) {
                    this.form.address = '';
                    this.recipient.type = '';
                    recipientCheckData = null;
                    this.clearRecipientTimer();
                    if (!newVal) {
                        return;
                    }
                    if (newVal.substr(0, 2) === 'Mx') {
                        this.recipient.type = 'address';
                        // address
                        if (newVal.length !== 42) {
                            this.setAddressError('Wrong address length');
                            return;
                        }
                        if (!/^Mx[0-9abcdefABCDEF]*$/.test(newVal)) {
                            this.setAddressError('Wrong address');
                            return;
                        }
                        this.form.address = newVal;
                        this.recipient.address = newVal;
                    } else if (newVal.substr(0, 1) === '@') {
                        // username
                        if (!/^@\w*$/.test(newVal)) {
                            this.setAddressError('Wrong username');
                            return;
                        }
                        recipientCheckData = {username: newVal.substr(1)};
                        this.recipient.type = 'username';
                        this.recipientCheckTimer = setTimeout(this.checkRecipient, 1000);
                    } else if (newVal.indexOf('@') !== -1) {
                        // email
                        recipientCheckData = {email: newVal};
                        this.recipient.type = 'email';
                        this.recipientCheckTimer = setTimeout(this.checkRecipient, 1000);
                    } else {
                        // wrong recipient
                        this.setAddressError('Wrong recipient');
                    }
                },
            },
        },
        methods: {
            // force check after blur if needed
            recipientBlur() {
                if (
                    this.recipientCheckTimer // check was postponed
                    ||
                    (this.recipientLoading && this.recipientLoading !== this.recipient.name) // checking in progress and recipient value changed from last check
                ) {
                    this.clearRecipientTimer();
                    this.checkRecipient();
                }
            },
            clearRecipientTimer() {
                clearTimeout(this.recipientCheckTimer);
                this.recipientCheckTimer = null;
            },
            checkRecipient() {
                // cancel previous request
                this.clearRecipientTimer();
                if (this.recipientLoading && typeof recipientCheckCancel === 'function') {
                    recipientCheckCancel();
                }
                // check only username and email
                if (this.recipient.type !== 'username' && this.recipient.type !== 'email') {
                    return;
                }
                // new request
                this.recipientLoading = this.recipient.name;
                getAddressInfoByContact(recipientCheckData, new axios.CancelToken((cancelFn) => {
                    recipientCheckCancel = cancelFn;
                }))
                    .then((userInfo) => {
                        this.form.address = userInfo.address;
                        this.recipient.address = userInfo.address;
                        // @TODO user stored users
                        this.recipientLoading = false;
                    })
                    .catch((error) => {
                        recipientError = {
                            username: {},
                            email: {},
                        };
                        if (fillServerErrors(error, recipientError)) {
                            // validation error
                            Object.keys(recipientError).forEach((key) => {
                                if (recipientError[key].message) {
                                    this.setAddressError(recipientError[key].message);
                                }
                            });
                        } else if (error.response && error.response.status && error.response.status < 500) {
                            // server expected error
                            const errorCode = getErrorCode(error);
                            if (errorCode === 'not_found') {
                                if (this.recipient.type === 'username') {
                                    this.setAddressError(`Can't find address for username "${this.recipient.name}"`);
                                }
                                if (this.recipient.type === 'email') {
                                    this.setAddressError(`Can't find address for e-mail "${this.recipient.name}"`);
                                }
                            } else {
                                this.setAddressError(getErrorText(error, ''));
                            }
                        } else {
                            // unexpected error
                            this.setAddressError('Can\'t get address from server');
                        }
                        this.recipientLoading = false;
                    });
            },
            setAddressError(message, code) {
                this.sve.address = {invalid: true, isActual: true, message, code};
            },
            onAcceptAmount(e) {
                this.amountMasked = e.detail._value;
                this.form.amount = e.detail._unmaskedValue;
            },
            openTxModal() {
                if (this.isFormSending) {
                    return;
                }
                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }

                this.isModalOpen = true;
            },
            sendTx() {
                if (this.isFormSending) {
                    return;
                }

                this.lastRecipient = Object.assign({}, this.recipient);
                this.isFormSending = true;
                this.isModalOpen = false;
                this.isWaitModalOpen = true;
                this.serverError = '';
                this.serverSuccess = '';
                this.$store.dispatch('FETCH_ADDRESS_ENCRYPTED')
                    .then(() => {
                        postTx(new SendTxParams({
                            privateKey: this.$store.getters.privateKey,
                            ...this.form,
                            feeCoinSymbol: this.feeCoinSymbol,
                        })).then((txHash) => {
                            this.isFormSending = false;
                            this.isWaitModalOpen = false;
                            this.isSuccessModalOpen = true;
                            this.serverSuccess = txHash;
                            this.clearForm();
                            this.$store.dispatch('FETCH_BALANCE');
                        }).catch((error) => {
                            console.log(error);
                            this.isFormSending = false;
                            this.isWaitModalOpen = false;
                            this.serverError = getErrorText(error);
                        });
                    })
                    .catch((error) => {
                        this.isFormSending = false;
                        this.isWaitModalOpen = false;
                        this.serverError = getErrorText(error);
                    });
            },
            //@TODO exclude fee from amount
            useMax() {
                this.form.amount = this.maxAmount;
                this.amountMasked = this.maxAmount;
                this.$refs.amountInput.maskRef.typedValue = this.maxAmount;
            },
            clearForm() {
                this.form.address = '';
                this.form.amount = null;
                this.form.coinSymbol = this.$store.state.balance && this.$store.state.balance.length ? this.$store.state.balance[0].coin : '';
                this.recipient.name = '';
                this.recipient.type = '';
                this.recipient.address = '';
                this.amountMasked = '';
                this.$refs.amountInput.maskRef.typedValue = '';
                this.$v.$reset();
            },
            getAvatarUrl,
            getExplorerTxUrl,
        },
    };
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true">

        <form novalidate @submit.prevent="openTxModal" v-if="$store.state.balance && $store.state.balance.length">
            <div class="u-section u-container">
                <label class="bip-field bip-field--row bip-field--select" :class="{'is-error': $v.form.coinSymbol.$error}">
                    <span class="bip-field__label">Coin</span>
                    <select class="bip-field__input"
                            v-model="form.coinSymbol"
                            @blur="$v.form.coinSymbol.$touch()"
                    >
                        <option v-for="coin in $store.state.balance" :key="coin.coin" :value="coin.coin">{{ coin.coin }} ({{ coin.amount | pretty }})</option>
                    </select>
                    <span class="bip-field__error" v-if="$v.form.coinSymbol.$dirty && !$v.form.coinSymbol.required">Enter coin</span>
                </label>
                <label class="bip-field bip-field--row" :class="{'is-error': $v.form.address.$error}">
                    <span class="bip-field__label">To (@username, email or Mx address)</span>
                    <input class="bip-field__input " type="text"
                           v-model.trim="recipient.name"
                           @blur="$v.form.address.$touch(); recipientBlur()"
                           @input="sve.address.isActual = false"
                    >
                    <span class="bip-field__error" v-if="$v.form.address.$dirty && !$v.form.address.server">{{ sve.address.message }}</span>
                    <span class="bip-field__error" v-else-if="!isRecipientCheckWait && $v.form.address.$dirty && !$v.form.address.required">Enter recipient</span>
                </label>
                <label class="bip-field bip-field--row bip-field--with-max" :class="{'is-error': $v.form.amount.$error}">
                    <span class="bip-field__label">Amount</span>
                    <input class="bip-field__input" type="text" inputmode="numeric" ref="amountInput"
                           :value="amountMasked"
                           v-imask="amountImaskOptions"
                           @accept="onAcceptAmount"
                           @blur="$v.form.amount.$touch()"
                    >
                    <button class="bip-field__button bip-link u-semantic-button" type="button" @click="useMax">Use max</button>
                    <span class="bip-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">Enter amount</span>
                    <span class="bip-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.validAmount">Wrong amount</span>
                    <span class="bip-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.maxAmount">Not enough coins</span>
                </label>
            </div>

            <div class="list">
                <a class="list-item">
                    <div class="list-item__center">Transaction Fee</div>
                    <div class="list-item__right">
                        <div class="list-item__label list-item__label--strong">0.0100 {{ $store.getters.COIN_NAME }}</div>
                    </div>
                </a>
                <!--
                <div class="list-item">
                    <div class="list-item__center">Send for Free!</div>
                    <div class="list-item__right">
                        <label class="switch">
                            <input type="checkbox" class="switch__input" v-model="isSendForFree">
                            <span class="switch__toggle">
                                <span class="switch__handle"></span>
                            </span>
                        </label>
                    </div>
                </div>
                -->
            </div>

            <div class="u-section u-container">
                <button class="bip-button bip-button--main" :class="{'is-loading': isFormSending, 'is-disabled': $v.$invalid}">
                    <span class="bip-button__content">Send</span>
                    <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                    </svg>
                </button>
                <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
            </div>
        </form>

        <div class="u-section u-container" v-else>
            No coins to send
            <!--<span v-if="isBalanceLoading">Loading…</span>
            <span v-else>No coins to send</span>-->
        </div>

        <!-- confirm send modal -->
        <Modal :isOpen.sync="isModalOpen" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">You're sending</h3>
                <div class="modal__content">
                    <p class="send__modal-value">{{ form.amount | pretty }} {{ form.coinSymbol }}</p>
                    <p>to</p>
                    <p>
                        <img class="send__modal-image avatar avatar--large" :src="getAvatarUrl(form.address)" alt="" role="presentation">
                    </p>
                    <p class="u-text-wrap"><strong>{{ recipient.name }}</strong></p>
                </div>
                <div class="modal__footer">
                    <button class="bip-button bip-button--main" @click="sendTx">Send</button>
                    <button class="bip-button bip-button--ghost-main" @click="isModalOpen = false">Cancel</button>
                </div>
            </div>
        </Modal>

        <!-- wait modal -->
        <Modal :isOpen.sync="isWaitModalOpen" :hideCloseButton="true">
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
                    <p>Coins are received by</p>
                    <p>
                        <img class="send__modal-image avatar avatar--large" :src="getAvatarUrl(lastRecipient.address)" alt="" role="presentation">
                    </p>
                    <p class="u-text-wrap"><strong>{{ lastRecipient.name }}</strong></p>
                </div>
                <div class="modal__footer">
                    <a class="bip-button bip-button--ghost-main" :href="getExplorerTxUrl(serverSuccess)" target="_blank">View Transaction</a>
                    <button class="bip-button bip-button--ghost-main" @click="isSuccessModalOpen = false">Close</button>
                </div>
            </div>
        </Modal>
    </Layout>
</template>
