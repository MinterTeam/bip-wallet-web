<script>
    import {IMaskDirective} from 'vue-imask';

    export default {
        directives: {
            imask: IMaskDirective,
        },
        props: {
            initialValue: {
                type: String,
                default: '',
            },
        },
        data() {
            return {
                imaskPhoneOptions: {
                    mask: /^\+[0-9 ()\-./]*$/,
                    prepare: (char, masked) => {
                        if (char && char !== '+' && !masked._value.length) {
                            return '+' + char;
                        } else {
                            return char;
                        }
                    },
                },
                phoneMasked: this.initialValue,
            }
        },
        methods: {
            onAcceptPhone(e) {
                this.phoneMasked = e.detail._value;
                e.detail._unmaskedValue = '+' + this.phoneMasked.replace(/\D/g, '');
                this.$emit('accept', e)
            },
        }
    }
</script>

<template>
    <input type="tel" inputmode="numeric" :value="phoneMasked" v-imask="imaskPhoneOptions" @accept="onAcceptPhone"/>
</template>
