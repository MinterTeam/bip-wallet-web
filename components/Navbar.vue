<script>


    export default {
        components: {

        },
        props: {
            title: String,
            backUrl: String,
        },
        computed: {
            url() {
                // if no history use '/' as backUrl
                if (this.backUrl || !this.$store.state.history.length) {
                    return this.backUrl || '/';
                } else {
                    return undefined;
                }
            },
        },
        methods: {
            goBack() {
                this.$router.go(-1);
            },
        },
    };
</script>

<template>
    <div class="toolbar u-container">
        <div class="toolbar__left">
            <nuxt-link class="back-button" :to="url" v-if="url">
                <img class="back-button__icon" src="/img/icon-back.svg" width="14" height="24" alt="" role="presentation"/>
                <span class="back-button__label">Back</span>
            </nuxt-link>
            <button class="back-button u-semantic-button" @click="goBack" v-else>
                <img class="back-button__icon" src="/img/icon-back.svg" width="14" height="24" alt="" role="presentation"/>
                <span class="back-button__label">Back</span>
            </button>
        </div>

        <div class="toolbar__center">
            {{ title }}
        </div>

        <div class="toolbar__right">
            <!--<span class="toolbar-button">Label</span>-->
            <slot name="toolbar-right"></slot>
        </div>
    </div>
</template>
