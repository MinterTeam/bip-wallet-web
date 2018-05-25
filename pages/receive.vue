<script>
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';

    export default {
        PAGE_TITLE: 'Receive Coins',
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
    }
</script>

<template>
    <Layout :title="$options.PAGE_TITLE" :is-bg-white="true">

        <div class="u-section">

        </div>

    </Layout>
</template>
