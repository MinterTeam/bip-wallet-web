<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import minLength from 'vuelidate/lib/validators/minLength';
    import maxLength from 'vuelidate/lib/validators/maxLength';
    import email from 'vuelidate/lib/validators/email';
    import sameAs from 'vuelidate/lib/validators/sameAs';
    import getTitle from '~/assets/get-title';
    import {register} from '~/api';
    import {getServerValidator, fillServerErrors, getErrorText} from "~/assets/server-error";
    import {makeAccepter, removeEmptyKeys} from "~/assets/utils";
    import {USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH} from '~/assets/variables';
    import Layout from '~/components/LayoutDefault';
    import InputMaskedName from '~/components/InputMaskedName';

    export default {
        PAGE_TITLE: 'Create Wallet',
        components: {
            Layout,
            InputMaskedName,
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
                    username: '',
                    password: '',
                    passwordConfirm: '',
                    // email: '',
                    phone: '',
                },
                sve: {
                    username: {invalid: false, isActual: false, message: ''},
                    password: {invalid: false, isActual: false, message: ''},
                    // email: {invalid: false, isActual: false, message: ''},
                    phone: {invalid: false, isActual: false, message: ''},
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
                passwordConfirm: {
                    required,
                    sameAsPassword: sameAs('password'),
                },
                // email: {
                //     email,
                //     server: getServerValidator('email'),
                // },
                phone: {
                    minLength: minLength(11),
                    maxLength: maxLength(13),
                    server: getServerValidator('phone'),
                },
            },
        },
        methods: {
            onAcceptUsername: makeAccepter('username', true),
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

                register(removeEmptyKeys(this.form))
                    .then((authData) => {
                        this.$store.commit('SET_AUTH_PROFILE', authData);
                        this.$router.push('/');
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
                <span class="bip-field__label">Choose @username</span>
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
                <span class="bip-field__label">Choose password</span>
                <input class="bip-field__input" type="password"
                       v-model="form.password"
                       @blur="$v.form.password.$touch()"
                       @input="sve.password.isActual = false"
                >
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.required">Enter password</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.minLength">Password is too short</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.maxLength">Password is too long</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.server">{{ sve.password.message }}</span>
            </label>
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.passwordConfirm.$error}">
                <span class="bip-field__label">Confirm password</span>
                <input class="bip-field__input" type="password"
                       v-model="form.passwordConfirm"
                       @blur="$v.form.passwordConfirm.$touch()"
                >
                <span class="bip-field__error" v-if="$v.form.passwordConfirm.$dirty && !$v.form.passwordConfirm.required">Confirm password</span>
                <span class="bip-field__error" v-if="$v.form.passwordConfirm.$dirty && $v.form.passwordConfirm.required && !$v.form.passwordConfirm.sameAsPassword">Passwords don't match</span>
            </label>
            <!--<label class="bip-field bip-field&#45;&#45;row" :class="{'is-error': $v.form.email.$error}">
                <span class="bip-field__label">Email (Optional *)</span>
                <input class="bip-field__input" type="email"
                       v-model="form.email"
                       @blur="$v.form.email.$touch()"
                       @input="sve.email.isActual = false"
                >
                <span class="bip-field__error" v-if="$v.form.email.$dirty && !$v.form.email.email">Not valid email</span>
                <span class="bip-field__error" v-if="$v.form.email.$dirty && !$v.form.email.server">{{ sve.email.message }}</span>
            </label>-->
            <!--<label class="bip-field bip-field&#45;&#45;row" :class="{'is-error': $v.form.phone.$error}">
                <InputMaskedPhone class="bip-field__input"
                                  @accept="onAcceptPhone"
                                  @blur.native="$v.form.phone.$touch()"
                                  @input.native="sve.phone.isActual = false"
                />
                <span class="bip-field__label">Mobile Number (Optional *)</span>
                <span class="bip-field__error" v-if="$v.form.phone.$error">Not valid number</span>
                &lt;!&ndash;<span class="bip-field__error" v-if="$v.form.phone.$dirty && !$v.form.phone.server">{{ sve.phone.message }}</span>&ndash;&gt;
            </label>-->
            <div class="bip-field--row">
                <button class="bip-button bip-button--main" :class="{'is-disabled': $v.form.$invalid}">Create Wallet</button>
                <div class="bip-form__error" v-if="serverError">{{ serverError }}</div>
            </div>
            <!--<p class="bip-field&#45;&#45;row bip-field__asterisk">
                Email &lt;!&ndash;and Mobile Number are&ndash;&gt; is optional but can be very handy if you forget your password.
            </p>-->
        </form>

    </Layout>
</template>

