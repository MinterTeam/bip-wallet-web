<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import minLength from 'vuelidate/lib/validators/minLength';
    import sameAs from 'vuelidate/lib/validators/sameAs';
    import {updateProfilePassword} from "~/api";
    import getTitle from '~/assets/get-title';
    import {getServerValidator, fillServerErrors, getErrorText} from "~/assets/server-error";
    import {getPasswordToStore} from "minter-js-org";
    import Layout from '~/components/LayoutDefault';

    export default {
        PAGE_TITLE: 'Change Password',
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
            };
        },
        data() {
            return {
                isFormSending: false,
                serverError: '',
                form: {
                    password: '',
                    passwordConfirm: '',
                },
                sve: {
                    password: {invalid: false, isActual: false, message: ''},
                    passwordConfirm: {invalid: false, isActual: false, message: ''},
                },
            };
        },
        validations: {
            form: {
                password: {
                    required,
                    minLength: minLength(6),
                    server: getServerValidator('password'),
                },
                passwordConfirm: {
                    required,
                    sameAsPassword: sameAs('password'),
                },
            },
        },
        methods: {
            submit() {
                if (this.isFormSending) {
                    return;
                }
                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }
                this.isFormSending = true;

                const passwordToStore = getPasswordToStore(this.form.password);
                updateProfilePassword(this.$store.state.auth.password, passwordToStore)
                    .then((newAddressList) => {
                        this.$store.commit('UPDATE_PROFILE_PASSWORD', passwordToStore);
                        this.$store.commit('SET_PROFILE_ADDRESS_LIST', newAddressList);
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
            },
        },
    };
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true" back-url="/settings">

        <form class="u-section u-container" @submit.prevent="submit">
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.password.$error}">
                <span class="bip-field__label">New password</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.required">Enter password</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.minLength">Password is too short</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.server">{{ sve.password.message }}</span>
                <input class="bip-field__input" type="password"
                       v-model="form.password"
                       @blur="$v.form.password.$touch()"
                       @input="sve.password.isActual = false"
                >
            </label>
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.passwordConfirm.$error}">
                <span class="bip-field__label">Repeat new password</span>
                <span class="bip-field__error" v-if="$v.form.passwordConfirm.$dirty && !$v.form.passwordConfirm.required">Confirm password</span>
                <span class="bip-field__error" v-if="$v.form.passwordConfirm.$dirty && $v.form.passwordConfirm.required && !$v.form.passwordConfirm.sameAsPassword">Passwords don't match</span>
                <input class="bip-field__input" type="password"
                       v-model="form.passwordConfirm"
                       @blur="$v.form.passwordConfirm.$touch()"
                >
            </label>
            <div class="bip-field--row">
                <button class="bip-button bip-button--main">Save</button>
            </div>
            <div class="bip-form__error" v-if="serverError">{{ serverError }}</div>
        </form>

    </Layout>
</template>
