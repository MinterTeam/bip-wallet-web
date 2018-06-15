<script>
    import {validationMixin} from 'vuelidate';
    import minLength from 'vuelidate/lib/validators/minLength';
    import maxLength from 'vuelidate/lib/validators/maxLength';
    import {putProfile} from "~/api";
    import getTitle from '~/assets/get-title';
    import {getServerValidator, fillServerErrors, getErrorText} from "~/assets/server-error";
    import {makeAccepter} from "~/assets/utils";
    import Layout from '~/components/LayoutDefault';
    import InputMaskedPhone from '~/components/InputMaskedPhone';

    export default {
        PAGE_TITLE: 'Change Mobile Number',
        components: {
            Layout,
            InputMaskedPhone,
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
                isFormSending: false,
                serverError: '',
                form: {
                    phone: this.$store.state.auth.phone || '',
                },
                sve: {
                    phone: {invalid: false, isActual: false, message: ''},
                },
            }
        },
        validations: {
            form: {
                phone: {
                    minLength: minLength(11),
                    maxLength: maxLength(13),
                    server: getServerValidator('phone'),
                },
            }
        },
        methods: {
            onAcceptPhone: makeAccepter('phone', true),
            submit() {
                if (this.isFormSending) {
                    return;
                }
                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }
                this.isFormSending = true;

                putProfile(this.form)
                    .then(() => {
                        this.$store.commit('SET_PROFILE_USER', {
                            ...this.$store.state.auth.user,
                            ...this.form,
                        });
                        this.$router.push('/settings');
                        this.isFormSending = false;
                    })
                    .catch((error) => {
                        let hasValidationErrors = fillServerErrors(error, this.sve);
                        if (!hasValidationErrors) {
                            this.serverError = getErrorText(error);
                        }
                        this.isFormSending = false;
                    });
            }
        }
    }
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true" back-url="/settings">

        <form class="u-section u-container" novalidate @submit.prevent="submit">
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.phone.$error}">
                <span class="bip-field__label">Mobile number</span>
                <span class="bip-field__error" v-if="$v.form.phone.$error">Not valid number</span>
                <!--<span class="bip-field__error" v-if="$v.form.phone.$dirty && !$v.form.phone.server">{{ sve.phone.message }}</span>-->
                <InputMaskedPhone class="bip-field__input"
                                  :initialValue="form.phone"
                                  @accept="onAcceptPhone"
                                  @blur.native="$v.form.phone.$touch()"
                                  @input.native="sve.phone.isActual = false"
                />
            </label>
            <div class="bip-field--row">
                <button class="bip-button bip-button--main">Save</button>
            </div>
            <div class="bip-form__error" v-if="serverError">{{ serverError }}</div>
        </form>

    </Layout>
</template>
