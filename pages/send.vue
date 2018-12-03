<script>
    import {mapState} from 'vuex';
    import axios from 'axios';
    import {IMaskDirective} from 'vue-imask';
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import maxValue from 'vuelidate/lib/validators/maxValue';
    import withParams from 'vuelidate/lib/withParams';
    import {getAddressInfoByContact} from "~/api";
    import {getServerValidator, fillServerErrors, getErrorText} from "~/assets/server-error";
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
            uppercase: (value) => value.toUpperCase(),
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
                serverError: '',
                form: {
                    coin: coinList && coinList.length ? coinList[0].coin : '',
                    address: '',
                    amount: '',
                },
                sve: {
                    address: {invalid: false, isActual: false, message: ''},
                },
                recipient: '',
                recipientCheckTimer: null,
                recipientLoading: false, // latest recipient value sent to check and still loading
                amountImaskOptions: {
                    mask: /^[0-9]*\.?[0-9]*$/,
                },
                amountMasked: '',
                isSendForFree: false,
                isModalOpen: false,
            };
        },
        validations() {
            return {
                form: {
                    coin: {
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
                this.balance.some((coin) => {
                    if (coin.coin === this.form.coin) {
                        selectedCoin = coin;
                        return true;
                    }
                });
                return selectedCoin ? selectedCoin.amount : 0;
            },
            ...mapState({
                balance: 'balance',
            }),
        },
        watch: {
            recipient(newVal) {
                this.form.address = '';
                recipientCheckData = null;
                this.clearRecipientTimer();
                if (!newVal) {
                    return;
                }
                if (newVal.substr(0, 2) === 'Mx') {
                    // address
                    if (newVal.length !== 42) {
                        this.setAddressError('Wrong address length');
                        return;
                    }
                    if (!/^Mx[0-9abcdefABCDEF]$/.test(newVal)) {
                        this.setAddressError('Wrong address');
                        return;
                    }
                    this.form.address = newVal;
                } else if (newVal.substr(0, 1) === '@') {
                    // username
                    if (!/^@\w*$/.test(newVal)) {
                        this.setAddressError('Wrong username');
                        return;
                    }
                    recipientCheckData = {username: newVal.substr(1)};
                    this.recipientCheckTimer = setTimeout(this.checkRecipient, 1000);
                } else if (newVal.indexOf('@') !== -1) {
                    // email
                    recipientCheckData = {email: newVal};
                    this.recipientCheckTimer = setTimeout(this.checkRecipient, 1000);
                } else {
                    // wrong recipient
                    this.setAddressError('Wrong recipient');
                }
            },
        },
        methods: {
            // force check after blur if needed
            recipientBlur() {
                if (
                    this.recipientCheckTimer // check was postponed
                    ||
                    (this.recipientLoading && this.recipientLoading !== this.recipient) // checking in progress and recipient value changed from last check
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
                this.clearRecipientTimer();
                if (this.recipientLoading && typeof recipientCheckCancel === 'function') {
                    // cancel previous request
                    recipientCheckCancel();
                }
                this.recipientLoading = this.recipient;
                getAddressInfoByContact(recipientCheckData, new axios.CancelToken((cancelFn) => {
                    recipientCheckCancel = cancelFn;
                }))
                    .then((user) => {
                        this.form.address = user.address;
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
                            this.setAddressError(getErrorText(error, ''));
                        } else {
                            // unexpected error
                            this.setAddressError('Can\'t get address from server');
                        }
                        this.recipientLoading = false;
                    });
            },
            setAddressError(message) {
                this.sve.address = {invalid: true, isActual: true, message};
            },
            onAcceptAmount(e) {
                this.amountMasked = e.detail._value;
                this.form.amount = e.detail._unmaskedValue;
            },
            openTxModal() {
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

                this.isFormSending = true;
            },
        },
    };
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true">

        <div v-if="balance && balance.length">
            <div class="u-section u-container">
                <label class="bip-field bip-field--row" :class="{'is-error': $v.form.coin.$error}">
                    <span class="bip-field__label">Coin</span>
                    <span class="bip-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">Enter coin</span>
                    <select class="bip-field__input bip-field__input--select"
                            v-model="form.coin"
                            @blur="$v.form.coin.$touch()"
                    >
                        <option v-for="coin in balance" :key="coin.coin" :value="coin.coin">{{ coin.coin | uppercase }} ({{ coin.amount }})</option>
                    </select>
                </label>
                <label class="bip-field bip-field--row" :class="{'is-error': $v.form.address.$error}">
                    <span class="bip-field__label">To (@username, email or Mx address)</span>
                    <span class="bip-field__error" v-if="$v.form.address.$dirty && !$v.form.address.server">{{ sve.address.message }}</span>
                    <span class="bip-field__error" v-else-if="!isRecipientCheckWait && $v.form.address.$dirty && !$v.form.address.required">Enter recipient</span>

                    <input class="bip-field__input " type="text"
                           v-model.trim="recipient"
                           @blur="$v.form.address.$touch(); recipientBlur()"
                           @input="sve.address.isActual = false"
                    >
                </label>
                <label class="bip-field bip-field--row" :class="{'is-error': $v.form.amount.$error}">
                    <span class="bip-field__label">Amount</span>
                    <span class="bip-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">Enter amount</span>
                    <span class="bip-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.validAmount">Wrong amount</span>
                    <span class="bip-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.maxAmount">Not enough coins</span>
                    <input class="bip-field__input" type="text" inputmode="numeric" placeholder="0"
                           :value="amountMasked"
                           v-imask="amountImaskOptions"
                           @accept="onAcceptAmount"
                           @blur="$v.form.amount.$touch()"
                    >
                </label>
            </div>
<!--

            <div class="list">
                <a class="list-item">
                    <div class="list-item__center">Transaction Fee</div>
                    <div class="list-item__right">
                        <div class="list-item__label list-item__label&#45;&#45;strong">123</div>
                    </div>
                </a>
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
            </div>
-->

            <div class="u-section u-container">
                <button class="bip-button bip-button--main" :class="{'is-disabled': $v.$invalid}" @click="openTxModal">Send!</button>
                <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
            </div>
        </div>

        <div class="u-section u-container" v-else>
            No coins to send
            <!--<span v-if="isBalanceLoading">Loading…</span>
            <span v-else>No coins to send</span>-->
        </div>


        <Modal :isOpen.sync="isModalOpen" :hideCloseButton="true">
            <h3 class="modal__title u-h2">You're sending</h3>
            <p class="modal__text">{{ this.form.amount }} {{ this.form.coin | uppercase }}</p>
            <button class="bip-button bip-button--main" @click="sendTx">BIP!</button>
            <button class="bip-button bip-button--ghost-main" @click="isModalOpen = false">Cancel</button>
        </Modal>
    </Layout>
</template>
