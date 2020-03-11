<script>
    import ConnectionNotice from '~/components/ConnectionNotice.vue';

    export default {
        components: {
            ConnectionNotice,
        },
        head: {
            bodyAttrs: {
                class: 'default-layout',
            },
        },
    };
</script>

<template>
    <div>
        <nuxt class="default-layout__container"/>
        <ConnectionNotice/>
    </div>
</template>
