<script>
    import {validationMixin} from 'vuelidate';
    import required from 'vuelidate/lib/validators/required';
    import minLength from 'vuelidate/lib/validators/minLength';
    import maxLength from 'vuelidate/lib/validators/maxLength';
    import {updateProfile} from "~/api";
    import getTitle from '~/assets/get-title';
    import {getServerValidator, fillServerErrors, getErrorText} from "~/assets/server-error";
    import {makeAccepter} from "~/assets/utils";
    import Layout from '~/components/LayoutDefault';
    import InputMaskedName from '~/components/InputMaskedName';

    export default {
        PAGE_TITLE: 'Change Username',
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
                    username: this.$store.state.auth.user.username,
                },
                sve: {
                    username: {invalid: false, isActual: false, message: ''},
                },
            };
        },
        validations: {
            form: {
                username: {
                    required,
                    minLength: minLength(5),
                    maxLength: maxLength(32),
                    server: getServerValidator('username'),
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
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.username.$error}">
                <span class="bip-field__label">Username</span>
                <InputMaskedName class="bip-field__input"
                                 :initialValue="form.username"
                                 @accept="onAcceptUsername"
                                 @blur.native="$v.form.username.$touch()"
                                 @input.native="sve.username.isActual = false"
                />
                <span class="bip-field__error" v-if="$v.form.username.$dirty && !$v.form.username.required">Enter username</span>
                <span class="bip-field__error" v-if="$v.form.username.$dirty && !$v.form.username.minLength">Username is too short</span>
                <span class="bip-field__error" v-if="$v.form.username.$dirty && !$v.form.username.maxLength">Username is too long</span>
                <span class="bip-field__error" v-if="$v.form.username.$dirty && !$v.form.username.server">{{ sve.username.message }}</span>
            </label>
            <div class="bip-field--row">
                <button class="bip-button bip-button--main">Save</button>
            </div>
            <div class="bip-form__error" v-if="serverError">{{ serverError }}</div>
        </form>

    </Layout>
</template>
