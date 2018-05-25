<script>
    import {IMaskDirective} from 'vue-imask';

    export default {
        directives: {
            imask: IMaskDirective,
        },
        data() {
            return {
                imaskNameOptions: {
                    mask: /^@\w*$/,
                    prepare: (char, masked) => {
                        if (char && char !== '@' && !masked._value.length) {
                            return '@' + char;
                        } else {
                            return char;
                        }
                    },
                },
                usernameMasked: '',
            }
        },
        methods: {
            onAcceptUsername(e) {
                this.usernameMasked = e.detail._value;
                e.detail._unmaskedValue = this.usernameMasked.replace(/^@/, '');
                this.$emit('accept', e)
            },
        }
    }
</script>

<template>
    <input type="text" :value="usernameMasked" v-imask="imaskNameOptions" @accept="onAcceptUsername"/>
</template>
