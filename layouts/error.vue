<script>
    import {getErrorText} from '~/assets/server-error';
    import Layout from '~/components/LayoutDefault';

    export default {
        components: {
            Layout,
        },
        props: ['error'],
        computed: {
            statusCode() {
                // error's statusCode not used, because it shows invalid 500 on network errors
                if (this.error.response) {
                    return this.error.response.status;
                } else if (this.error.request) {
                    return this.error.request.status;
                } else {
                    // custom status
                    return this.error.status;
                }
            },
            message() {
                // if (this.statusCode === 404) {
                //     return `Oops, there are no ${this.$store.getters.COIN_NAME}s here. Please try again!`;
                // }
                // if (this.statusCode === 405) {
                //     return 'Unfortunately, this resource is not available to US persons';
                // }
                let errorText = getErrorText(this.error, '');
                //@TODO workaround for https://github.com/axios/axios/issues/2103
                if (errorText === 'timeout of 0ms exceeded') {
                    errorText = 'Network error: request timed out';
                }
                return errorText;
            },
        },
    };
</script>

<template>
    <Layout :title="'Error'" :is-bg-white="true" back-url="/">
        <div class="error__container u-container u-container--small">
            <div class="error__section u-section">
                <h1 class="error__title">{{ statusCode }} error</h1>
                <p class="error__description" v-if="message">{{ message }}</p>
            </div>
        </div>
    </Layout>
</template>
