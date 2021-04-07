<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import withParams from 'vuelidate/lib/withParams';
    import {isValidMnemonic, walletFromMnemonic} from 'minterjs-wallet';

    const mnemonicValidator = withParams({type: 'mnemonic'}, isValidMnemonic);

    export default {
        mixins: [validationMixin],
        props: {
            // address used for sign in
            isAuthAddress: {
                type: Boolean,
                default: false,
            },
        },
        data() {
            return {
                mnemonic: '',
            };
        },
        validations: {
            mnemonic: {
                required,
                validMnemonic: mnemonicValidator,
            },
        },
        methods: {
            addAddress() {
                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }
                // clear old format stored data
                this.$store.commit('LOGOUT');
                this.$store.commit('ADD_AUTH_ADVANCED', this.mnemonic);
                this.$emit('address-added');
            },
        },
    };
</script>

<template>
    <form class="u-section u-container" @submit.prevent="addAddress">
        <label class="bip-field bip-field--row" :class="{'is-error': $v.mnemonic.$error, 'is-success': !$v.mnemonic.$invalid}">
            <span class="bip-field__label">Paste Seed Phrase</span>
            <textarea class="bip-field__input" rows="3" autocapitalize="off"
                      v-model="mnemonic"
                      @blur="$v.mnemonic.$touch()"
            ></textarea>
            <span class="bip-field__error" v-if="$v.mnemonic.$dirty && !$v.mnemonic.required">Enter phrase</span>
            <span class="bip-field__error" v-if="$v.mnemonic.$dirty && $v.mnemonic.required && !$v.mnemonic.validMnemonic">Invalid phrase</span>
        </label>
        <div class="bip-field--row">
            <button class="bip-button bip-button--main" :class="{'is-disabled': $v.$invalid}">Activate</button>
        </div>
    </form>
</template>
