<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import withParams from 'vuelidate/lib/withParams';
    import {isValidMnemonic} from 'minterjs-wallet';
    import {addressFromMnemonic} from "minter-js-org";

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
                this.$store.commit('ADD_AUTH_ADVANCED', addressFromMnemonic(this.mnemonic, this.isAuthAddress));
                this.$emit('addressAdded');
            },
        },
    };
</script>

<template>
    <form class="u-section u-container" @submit.prevent="addAddress">
        <label class="bip-field bip-field--row" :class="{'is-error': $v.mnemonic.$error, 'is-success': !$v.mnemonic.$invalid}">
            <span class="bip-field__label">Paste Seed Phrase</span>
            <span class="bip-field__error" v-if="$v.mnemonic.$dirty && !$v.mnemonic.required">Enter phrase</span>
            <span class="bip-field__error" v-if="$v.mnemonic.$dirty && $v.mnemonic.required && !$v.mnemonic.validMnemonic">Invalid phrase</span>
            <textarea class="bip-field__input" rows="3"
                      v-model="mnemonic"
                      @blur="$v.mnemonic.$touch()"
            ></textarea>
        </label>
        <div class="bip-field--row">
            <button class="bip-button bip-button--main" :class="{'is-disabled': $v.$invalid}">Activate</button>
        </div>
    </form>
</template>
