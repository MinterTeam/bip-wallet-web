<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import withParams from 'vuelidate/lib/withParams';
    import getTitle from '~/assets/get-title';
    import {isValidMnemonic} from "~/assets/utils";
    import Layout from '~/components/LayoutDefault';

    const mnemonicValidator = withParams({type: 'mnemonic'}, isValidMnemonic);

    export default {
        PAGE_TITLE: 'Advanced Mode',
        components: {
            Layout,
        },
        mixins: [validationMixin],
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
                mnemonic: '',
            }
        },
        validations: {
            mnemonic: {
                required,
                validMnemonic: mnemonicValidator,
            }
        },
        computed: {

        },
        methods: {
            authorize() {
                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }
                this.$store.commit('SET_AUTH', {mnemonic: this.mnemonic});
                this.$router.push('/');
            }
        }
    }
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true" back-url="/auth">

        <div class="u-section u-container">
            <nuxt-link class="bip-button bip-button--main" to="/auth/create-wallet-advanced/">Generate Address</nuxt-link>
        </div>

        <div class="u-section-divider-text">
            <div class="u-section-divider-text__inner">or</div>
        </div>

        <div class="u-section u-container">
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
                <button class="bip-button bip-button--main" :class="{'is-disabled': $v.$invalid}" @click="authorize">Activate</button>
            </div>
        </div>

    </Layout>
</template>

