<script>


    export default {
        components: {

        },
        props: {
            title: String,
            backUrl: String,
        },
        computed: {
            route() {
                return this.$f7Router
            }
        },
        methods: {
            goBack() {
                if (this.$store.state.history.length) {
                    this.$router.go(-1);
                } else {
                    this.$router.push('/');
                }
            }
        },
    }
</script>

<template>
    <div class="toolbar">
        <div class="toolbar__left">
            <nuxt-link class="back-button" :to="backUrl" v-if="backUrl">
                <img class="back-button__icon" src="/img/icon-back.svg" alt="" role="presentation"/>
                <span class="back-button__label">Back</span>
            </nuxt-link>
            <button class="back-button u-semantic-button" @click="goBack" v-else>
                <img class="back-button__icon" src="/img/icon-back.svg" alt="" role="presentation"/>
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
