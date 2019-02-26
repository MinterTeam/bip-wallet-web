<script>
    export default {
        data() {
            return {
                isTestnetNoticeActive: false, // don't init value here because of https://github.com/nuxt/nuxt.js/issues/1552
                isAndroid70: false,
                isAndroidOld: false,
            };
        },
        mounted() {
            // ssr fallback
            this.isTestnetNoticeActive = !window.localStorage.getItem('minter-testnet-notice-hidden');

            // android version
            const androidVersion = getAndroidVersion();
            if (androidVersion && parseFloat(androidVersion) === 7) {
                this.isAndroid70 = true;
            }
            if (androidVersion && parseFloat(androidVersion) < 7) {
                this.isAndroidOld = true;
            }
        },
        methods: {
            testnetNoticeHide() {
                window.localStorage.setItem('minter-testnet-notice-hidden', 'true');
                this.isTestnetNoticeActive = false;
            },
        },
    };


    function getAndroidVersion() {
        const ua = navigator.userAgent.toLowerCase();
        const match = ua.match(/android\s([0-9.]*)/);
        return match ? match[1] : undefined;
    }
</script>

<template>
    <div class="testnet-notice" v-if="isTestnetNoticeActive">
        <div class="testnet-notice__container u-container u-container--large">
            <div class="testnet-notice__content">
                <span class="testnet-notice__icon">
                    <span v-if="isAndroid70">‍‍‍👨‍🔬</span> <!-- &#x1F468;&#x200D;&#x1F52C; -->
                    <span v-else-if="isAndroidOld">‍🔬</span> <!-- &#x1F52C; -->
                    <span v-else>👨🏻‍🔬</span> <!-- &#x1F468;&#x1F3FB;&#x200D;&#x1F52C; -->
                </span>
                <span class="testnet-notice__caption">You are using testnet version. <br class="u-hidden-mini-down"> Not&nbsp;real&nbsp;money</span>
            </div>
            <button class="testnet-notice__close u-semantic-button" @click="testnetNoticeHide">
                <span class="testnet-notice__close-icon">Close</span>
            </button>
        </div>
    </div>
</template>
