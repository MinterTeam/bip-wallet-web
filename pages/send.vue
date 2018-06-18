<script>
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';

    export default {
        PAGE_TITLE: 'Send Coins',
        components: {
            Layout,
        },
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
                form: {
                    coin: '',
                }
            }
        }
    }
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true">

        <div class="u-section">
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.password.$error}">
                <span class="bip-field__label">Coin</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.required">Enter password</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.minLength">Password is too short</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.server">{{ sve.password.message }}</span>
                <input class="bip-field__input" type="password"
                       v-model="form.password"
                       @blur="$v.form.password.$touch()"
                       @input="sve.password.isActual = false"
                >
            </label>
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.password.$error}">
                <span class="bip-field__label">Coin</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.required">Enter password</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.minLength">Password is too short</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.server">{{ sve.password.message }}</span>
                <input class="bip-field__input" type="password"
                       v-model="form.password"
                       @blur="$v.form.password.$touch()"
                       @input="sve.password.isActual = false"
                >
            </label>
            <label class="bip-field bip-field--row" :class="{'is-error': $v.form.password.$error}">
                <span class="bip-field__label">Coin</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.required">Enter password</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.minLength">Password is too short</span>
                <span class="bip-field__error" v-if="$v.form.password.$dirty && !$v.form.password.server">{{ sve.password.message }}</span>
                <input class="bip-field__input" type="password"
                       v-model="form.password"
                       @blur="$v.form.password.$touch()"
                       @input="sve.password.isActual = false"
                >
            </label>
        </div>

    </Layout>
</template>
