<script>
    import * as clipboard from 'clipbrd';
    import {setMainProfileAddress} from "~/api";
    import {EXPLORER_HOST} from "~/assets/variables";
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';
    import Navbar from '~/components/Navbar';
    import Toast from '~/components/Toast';

    export default {
        PAGE_TITLE: 'My Addresses',
        components: {
            Layout,
            Navbar,
            Toast,
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
                selectedAddress: null,
                isToastVisible: false,
            };
        },
        computed: {
            /** @type Array<Address> */
            addressList() {
                return this.$store.getters.addressList;
            },
            isClipboardSupported() {
                return clipboard.isSupported();
            },
            isUserWithProfile() {
                return this.$store.getters.isUserWithProfile;
            },
        },
        watch: {
            // Save new isMain address
            // if user with profile, main address can be set only to profileAddress
            // otherwise main address can be set only to advancedAddress
            selectedAddress(newVal) {
                if (this.isUserWithProfile) {
                    let addressToEdit;
                    this.$store.state.profileAddressList.some((address) => {
                        if (address.address === newVal) {
                            addressToEdit = address;
                            return true;
                        }
                    });
                    setMainProfileAddress(addressToEdit.id);
                } else {
                    this.$store.commit('SET_MAIN_ADVANCED_ADDRESS', newVal);
                }
            },
        },
        beforeMount() {
            // if user with profile, main address can be set only to profile address
            const addressListWithMain = this.isUserWithProfile ? this.$store.state.profileAddressList : this.$store.state.auth.advanced;
            addressListWithMain.forEach((address) => {
                if (address.isMain) {
                    this.selectedAddress = address.address;
                }
            });
        },
        methods: {
            copy(str) {
                clipboard.copy(str);
                this.isToastVisible = true;
            },
            getAddressLink(addressHash) {
                return EXPLORER_HOST + '/address/' + addressHash;
            },
            getManageAddressLink(address) {
                return {path: '/settings/addresses/manage', query: address.isServerSecured ? {id: address.id} : {hash: address.address}};
            },
        },
    };
</script>

<template>
    <Layout :title="$options.PAGE_TITLE">
        <template slot="toolbar">
            <Navbar :title="$options.PAGE_TITLE" back-url="/settings">
                <template slot="toolbar-right">
                    <nuxt-link class="toolbar-button u-fw-700 u-semantic-button" to="/settings/addresses/add">Add New</nuxt-link>
                </template>
            </Navbar>
        </template>

        <div class="u-section">
            <div class="u-container">
                <p>Addresses are similar to bank accounts except for being operated only by you.</p>
                <p>All funds are received and sent from Main Address which is linked to your profile data — @username, email, or mobile number.</p>
            </div>
            <template v-for="(address, index) in addressList">

                <div class="list-title" :key="'title' + address.address">
                    <span v-if="index === 0">Main address</span>
                    <span v-else>Address #{{ index + 1 }}</span>
                </div>
                <div class="list" :key="address.address">
                    <div class="list-item">
                        <div class="list-item__center list-item--address__hash u-text-decent">{{ address.address }}</div>
                        <div class="list-item__right" v-if="isClipboardSupported">
                            <button class="bip-link u-text-decent u-semantic-button" @click="copy(address.address)">Copy</button>
                        </div>
                    </div>
                    <a class="list-item list-item--chevron list-item--tappable" :href="getAddressLink(address.address)" target="_blank">
                        <div class="list-item__center">Balance</div>
                        <div class="list-item__right list-item--chevron__right">
                            <div class="list-item__label list-item__label--strong">{{ address.balance }}</div>
                        </div>
                    </a>
                    <nuxt-link class="list-item list-item--chevron list-item--tappable" :to="getManageAddressLink(address)">
                        <div class="list-item__center">Secured by</div>
                        <div class="list-item__right list-item--chevron__right">
                            <div class="list-item__label list-item__label--strong">{{ address.isServerSecured ? 'Bip Wallet' : 'You' }}</div>
                        </div>
                    </nuxt-link>
                    <div class="list-item" v-if="!isUserWithProfile || (isUserWithProfile && address.isServerSecured)">
                        <div class="list-item__center">Set as main</div>
                        <div class="list-item__right">
                            <label class="switch">
                                <input type="radio" class="switch__input" :value="address.address" v-model="selectedAddress">
                                <span class="switch__toggle">
                                    <span class="switch__handle"></span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <template slot="toast">
            <Toast text="Copied to clipboard" :isVisible.sync="isToastVisible"/>
        </template>

    </Layout>
</template>
