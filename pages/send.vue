<script>
    import {IMaskDirective} from 'vue-imask';
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import withParams from 'vuelidate/lib/withParams';
    import {getServerValidator, fillServerErrors, getErrorText} from "~/assets/server-error";
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';

    const isValidAmount = withParams({type: 'validAmount'}, (value) => {
        return parseFloat(value) > 0;
    });

    export default {
        PAGE_TITLE: 'Send Coins',
        components: {
            Layout,
        },
        mixins: [validationMixin],
        directives: {
            imask: IMaskDirective,
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            }
        },
        data() {
            return {
                isFormSending: false,
                serverError: '',
                form: {
                    coin: '',
                    recipient: '',
                    amount: '',
                },
                sve: {
                    coin: {invalid: false, isActual: false, message: ''},
                    recipient: {invalid: false, isActual: false, message: ''},
                    amount: {invalid: false, isActual: false, message: ''},
                },
                isSendForFree: false,
                amountImaskOptions: {
                    mask: /^[0-9]*\.?[0-9]*$/,
                },
                amountMasked: '',
            }
        },
        validations: {
            form: {
                coin: {
                    required,
                },
                recipient: {
                    required,
                },
                amount: {
                    required,
                    validAmount: isValidAmount,
                },
            }
        },
        methods: {
            onAcceptAmount(e) {
                this.amountMasked = e.detail._value;
                this.form.amount = e.detail._unmaskedValue;
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
            },
        }
    }
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true">

        <div class="u-section u-container">
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.coin.$error}">
                <span class="bip-field__label">Coin</span>
                <span class="bip-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.required">Enter coin</span>
                <!--<span class="bip-field__error" v-if="$v.form.coin.$dirty && !$v.form.coin.server">{{ sve.coin.message }}</span>-->
                <select class="bip-field__input bip-field__input--select"
                       v-model="form.coin"
                       @blur="$v.form.coin.$touch()"
                       @input="sve.coin.isActual = false"
                >
                    <option value="mnt">MNT</option>
                    <option value="BIP">BIP</option>
                </select>
            </label>
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.recipient.$error}">
                <span class="bip-field__label">To (@username, email or Mx address)</span>
                <span class="bip-field__error" v-if="$v.form.recipient.$dirty && !$v.form.recipient.required">Enter recipient</span>
                <!--<span class="bip-field__error" v-if="$v.form.recipient.$dirty && !$v.form.recipient.server">{{ sve.recipient.message }}</span>-->
                <input class="bip-field__input " type="text"
                       v-model="form.recipient"
                       @blur="$v.form.recipient.$touch()"
                       @input="sve.recipient.isActual = false"
                >
            </label>
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.amount.$error}">
                <span class="bip-field__label">Amount</span>
                <span class="bip-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.required">Enter amount</span>
                <span class="bip-field__error" v-else-if="$v.form.amount.$dirty && !$v.form.amount.validAmount">Wrong amount</span>
                <!--<span class="bip-field__error" v-if="$v.form.amount.$dirty && !$v.form.amount.server">{{ sve.amount.message }}</span>-->
                <input class="bip-field__input" type="text" inputmode="numeric" placeholder="0"
                       :value="amountMasked"
                       v-imask="amountImaskOptions"
                       @accept="onAcceptAmount"
                       @blur="$v.form.amount.$touch()"
                       @input="sve.amount.isActual = false"
                >
            </label>
        </div>

        <div class="list">
            <a class="list-item">
                <div class="list-item__center">Transaction Fee</div>
                <div class="list-item__right">
                    <div class="list-item__label list-item__label--strong">123</div>
                </div>
            </a>
            <div class="list-item">
                <div class="list-item__center">Send for Free!</div>
                <div class="list-item__right">
                    <label class="switch">
                        <input type="checkbox" class="switch__input" v-model="isSendForFree">
                        <div class="switch__toggle">
                            <div class="switch__handle"></div>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <div class="u-section u-container">
            <button class="bip-button bip-button--main" :class="{'is-disabled': $v.$invalid}" @click="sendTx">Send!</button>
            <span class="bip-form__error" v-if="serverError">{{ serverError }}</span>
        </div>

    </Layout>
</template>
