<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import minLength from 'vuelidate/lib/validators/minLength';
    import maxLength from 'vuelidate/lib/validators/maxLength';
    import getTitle from '~/assets/get-title';
    import {login} from "~/api";
    import {getServerValidator, fillServerErrors, getErrorText} from "~/assets/server-error";
    import {makeAccepter} from "~/assets/utils";
    import {USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH} from '~/assets/variables';
    import Layout from '~/components/LayoutDefault';
    import InputMaskedName from '~/components/InputMaskedName';

    export default {
        PAGE_TITLE: 'Sign In',
        components: {
            Layout,
            InputMaskedName,
        },
        mixins: [validationMixin],
        fetch({redirect}) {
            return redirect('/auth');
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
                isFormSending: false,
                serverError: '',
                form: {
                    username: '',
                    password: '',
                },
                usernameMasked: '',
                sve: {
                    username: {invalid: false, isActual: false, message: ''},
                    password: {invalid: false, isActual: false, message: ''},
                },
            };
        },
        validations: {
            form: {
                username: {
                    required,
                    minLength: minLength(USERNAME_MIN_LENGTH),
                    maxLength: maxLength(USERNAME_MAX_LENGTH),
                    server: getServerValidator('username'),
                },
                password: {
                    required,
                    minLength: minLength(PASSWORD_MIN_LENGTH),
                    maxLength: maxLength(PASSWORD_MAX_LENGTH),
                    server: getServerValidator('password'),
                },
            },
        },
        methods: {
            onAcceptUsername: makeAccepter('username', true),
            submit() {
                if (this.isFormSending) {
                    return;
                }
                if (this.$v.$invalid) {
                    this.$v.$touch();
                    return;
                }
                this.isFormSending = true;

                login(this.form)
                    .then((authData) => {
                        // clear old format stored data
                        this.$store.commit('LOGOUT');
                        this.$store.commit('SET_AUTH_PROFILE', authData);
                        // redirect
                        const authRedirectPath = this.$store.state.authRedirectPath || '/';
                        this.$store.commit('SET_AUTH_REDIRECT_PATH', '');
                        this.$router.push(authRedirectPath);
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
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true" back-url="/auth">

        <form class="u-section u-container" novalidate @submit.prevent="submit">
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.username.$error}">
                <span class="bip-field__label">Your @username</span>
                <InputMaskedName class="bip-field__input"
                                 @accept="onAcceptUsername"
                                 @blur.native="$v.form.username.$touch()"
                                 @input.native="sve.username.isActual = false"
                />
                <span class="bip-field__error" v-if="$v.form.username.$dirty && !$v.form.username.required">Enter username</span>
                <span class="bip-field__error" v-if="$v.form.username.$dirty && !$v.form.username.minLength">Username is too short</span>
                <span class="bip-field__error" v-if="$v.form.username.$dirty && !$v.form.username.maxLength">Username is too long</span>
                <span class="bip-field__error" v-if="$v.form.username.$dirty && !$v.form.username.server">{{ sve.username.message }}</span>
            </label>
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.password.$error}">
                <span class="bip-field__label">Your password</span>
                <input class="bip-field__input" type="password"
                       v-model="form.password"
                       @blur="$v.form.password.$touch()"
                       @input="sve.password.isActual = false"
                >
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.required">Enter password</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.minLength">Password is too short</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.maxLength">Password is too long</span>
                <span class="bip-field__error" v-if="$v.form.username.$dirty && !$v.form.password.server">{{ sve.password.message }}</span>
            </label>
            <div class="bip-field--row">
                <button class="bip-button bip-button--main" :class="{'is-disabled': $v.form.$invalid}">Continue</button>
            </div>
            <div class="bip-form__error" v-if="serverError">{{ serverError }}</div>
        </form>

    </Layout>
</template>

