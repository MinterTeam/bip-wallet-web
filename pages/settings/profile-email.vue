<script>
    import {validationMixin} from 'vuelidate';
    import email from 'vuelidate/lib/validators/email';
    import {updateProfile} from "~/api";
    import getTitle from '~/assets/get-title';
    import {getServerValidator, fillServerErrors, getErrorText} from "~/assets/server-error";
    import Layout from '~/components/LayoutDefault';

    export default {
        PAGE_TITLE: 'Change Email',
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
                    email: this.$store.state.auth.email || '',
                },
                sve: {
                    email: {invalid: false, isActual: false, message: ''},
                },
            };
        },
        validations: {
            form: {
                email: {
                    email,
                    server: getServerValidator('email'),
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

                updateProfile(this.form)
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
            },
        },
    };
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true" back-url="/settings">

        <form class="u-section u-container" novalidate @submit.prevent="submit">
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.email.$error}">
                <span class="bip-field__label">Email</span>
                <input class="bip-field__input" type="email"
                       v-model="form.email"
                       @blur="$v.form.email.$touch()"
                       @input="sve.email.isActual = false"
                >
                <span class="bip-field__error" v-if="$v.form.email.$dirty && !$v.form.email.email">Not valid email</span>
                <span class="bip-field__error" v-if="$v.form.email.$dirty && !$v.form.email.server">{{ sve.email.message }}</span>
            </label>
            <div class="bip-field--row">
                <button class="bip-button bip-button--main">Save</button>
            </div>
            <div class="bip-form__error" v-if="serverError">{{ serverError }}</div>
        </form>

    </Layout>
</template>
