<script>
    import getTitle from '~/assets/get-title';
    import {getErrorText, getValidationError} from '~/assets/server-error';
    import {BOT_WALLET_API_URL, BOT_WALLET_ENCRYPTED, BOT_WALLET_PASSWORD} from '~/assets/variables';
    import Layout from '~/components/LayoutDefault';
    import Navbar from '~/components/Navbar';
    import Modal from '~/components/Modal';

    let getCoinsDecrypt;

    export default {
        PAGE_TITLE: 'Settings',
        components: {
            Layout,
            Navbar,
            Modal,
        },
        head() {
            return {
                title: getTitle(this.$options.PAGE_TITLE),
                meta: [
                    { hid: 'og-title', name: 'og:title', content: getTitle(this.$options.PAGE_TITLE) },
                ],
            };
        },
        data() {
            return {
                isCoinsAvailable: false,
                isCoinsRequestPending: false,
                isCoinsSuccessModalOpen: false,
                coinsServerError: '',
            };
        },
        mounted() {
            // import('@minterteam/bip-wallet-js-coins')
            //     .then((module) => {
            //         getCoinsDecrypt = module.getCoinsDecrypt;
            //         this.isCoinsAvailable = true;
            //     })
            //     .catch(() => {
            //         console.log('coins not available');
            //     });
        },
        methods: {
            logout() {
                this.$store.commit('LOGOUT');
                this.$router.push('/auth');
            },
            requestCoins() {
                if (this.isCoinsRequestPending || typeof getCoinsDecrypt !== 'function') {
                    return;
                }
                this.isCoinsRequestPending = true;
                getCoinsDecrypt({
                    baseURL: BOT_WALLET_API_URL,
                    address: this.$store.getters.address,
                    secretKeyEncrypted: BOT_WALLET_ENCRYPTED,
                    encryptionPassword: BOT_WALLET_PASSWORD,
                })
                    .then(() => {
                        this.isCoinsRequestPending = false;
                        this.isCoinsSuccessModalOpen = true;
                    })
                    .catch((error) => {
                        this.isCoinsRequestPending = false;
                        this.coinsServerError = getValidationError(error) || getErrorText(error);
                    });
            },
        },
    };
</script>

<template>
    <Layout :title="$options.PAGE_TITLE">
        <template slot="toolbar">
            <Navbar :title="$options.PAGE_TITLE">
                <template slot="toolbar-right">
                    <button class="toolbar-button u-fw-700 u-semantic-button" @click="logout">Log Out</button>
                </template>
            </Navbar>
        </template>

        <div class="u-section--bottom">
            <!--<div class="list">
                <nuxt-link class="list-item list-item&#45;&#45;chevron list-item&#45;&#45;tappable" to="/settings/language">
                    <div class="list-item__center">Language</div>
                    <div class="list-item__right list-item&#45;&#45;chevron__right">
                        <div class="list-item__label list-item__label&#45;&#45;strong">{{ $store.state.user.language }}</div>
                    </div>
                </nuxt-link>
                <nuxt-link class="list-item list-item&#45;&#45;chevron list-item&#45;&#45;tappable" to="/settings/addresses">
                    <div class="list-item__center">My addresses</div>
                    <div class="list-item__right list-item&#45;&#45;chevron__right">
                        <div class="list-item__label">Manage</div>
                    </div>
                </nuxt-link>
            </div>-->
            <div class="u-section--top u-container" v-if="isCoinsAvailable">
                <button class="bip-button bip-button--ghost-main" :class="{'is-loading': isCoinsRequestPending}" @click="requestCoins">
                    <span class="bip-button__content">Get 100 MNT for free</span>
                    <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                    </svg>
                </button>
                <span class="bip-form__error" v-if="coinsServerError">{{ coinsServerError }}</span>
            </div>
        </div>

        <!-- success modal -->
        <Modal :isOpen.sync="isCoinsSuccessModalOpen" :hideCloseButton="true">
            <div class="modal__panel">
                <h3 class="modal__title u-h2">Success</h3>
                <div class="modal__content">
                    <p>We have sent you 100 MNT!</p>
                </div>
                <div class="modal__footer">
                    <button class="bip-button bip-button--ghost-main" @click="isCoinsSuccessModalOpen = false">Close</button>
                </div>
            </div>
        </Modal>
    </Layout>
</template>
