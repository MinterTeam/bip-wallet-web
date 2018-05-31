<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import getTitle from '~/assets/get-title';
    import {generateMnemonic} from "~/assets/utils";
    import * as clipboard from '~/assets/clipboard';
    import Layout from '~/components/LayoutDefault';
    import Toast from '~/components/Toast';

    export default {
        PAGE_TITLE: 'Generate Address',
        components: {
            Layout,
            Toast,
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
                isMnemonicSaved: false,
                isToastVisible: false,
            }
        },
        validations: {
            isMnemonicSaved: {
                required,
            }
        },
        computed: {
            isClipboardSupported() {
                return clipboard.isSupported();
            },
        },
        mounted() {
            this.mnemonic = generateMnemonic();
        },
        methods: {
            copyMnemonic() {
                clipboard.copy(this.mnemonic);
                this.isToastVisible = true;
            },
            authorize() {
                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }
                this.$store.commit('AUTH', {mnemonic: this.mnemonic});
                this.$router.push('/');
            },
        }
    }
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true" back-url="/auth/sign-in-advanced">

        <div class="u-section u-container">
            Save this seed phrase in case you plan to use this address in the future.
        </div>
        <div class="list">
            <div class="list-item list-item--address">
                <div class="list-item__center list-item--address__seed-phrase">{{ mnemonic }}</div>
                <div class="list-item__right" v-if="isClipboardSupported">
                    <button class="bip-button--value u-semantic-button" @click="copyMnemonic">Copy</button>
                </div>
            </div>
            <a class="list-item list-item--tappable list-item--chevron">
                <div class="list-item__center">Secured by</div>
                <div class="list-item__right list-item--chevron__right">
                    <div class="list-item__label list-item__label--strong">Bip Wallet</div>
                </div>
            </a>
            <div class="list-item">
                <div class="list-item__center">I've saved the phrase!</div>
                <div class="list-item__right">
                    <label class="switch">
                        <input type="checkbox" class="switch__input" v-model="isMnemonicSaved">
                        <div class="switch__toggle">
                            <div class="switch__handle"></div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
        <div class="u-section u-container">
            <button class="bip-button bip-button--main" :class="{'is-disabled': !isMnemonicSaved}" @click="authorize">Launch the Wallet</button>
            <span class="bip-form__error" v-if="$v.isMnemonicSaved.$error">You need to save the phrase</span>
        </div>

        <template slot="toast">
            <Toast text="Copied to clipboard" :isVisible.sync="isToastVisible"/>
        </template>


    </Layout>
</template>

