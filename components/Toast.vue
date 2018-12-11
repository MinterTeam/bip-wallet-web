<script>
    let timer;

    export default {
        props: {
            isVisible: {
                type: Boolean,
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            closeText: {
                type: [String, Boolean],
                default: 'OK',
            },
            timeout: {
                type: [Number, Boolean],
                default: 5000,
            },
        },
        watch: {
            isVisible(newValue) {
                if (newValue) {
                    // show
                    clearTimeout(timer);
                    timer = setTimeout(this.hide, this.timeout);
                }
            },
        },
        methods: {
            hide() {
                this.$emit('update:isVisible', false);
                clearTimeout(timer);
            },
        },
    };
</script>

<template>
    <transition name="v-transition-toast">
        <div class="toast" v-show="isVisible">
            <div class="toast__message">{{ text }}</div>
            <button class="toast__button" v-if="closeText" @click="hide">{{ closeText }}</button>
        </div>
    </transition>
</template>
