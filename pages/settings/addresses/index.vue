<script>
    import {getAddressList} from "~/api";
    import {EXPLORER_URL} from "~/assets/variables";
    import getTitle from '~/assets/get-title';
    import * as clipboard from '~/assets/clipboard';
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
            }
        },
        data() {
            return {
                isAddressListLoading: false,
                /** @type Array<Address> */
                addressList: [],
                selectedAddress: null,
                isToastVisible: false,
            }
        },
        computed: {
            isClipboardSupported() {
                return clipboard.isSupported();
            },
        },
        created() {
            getAddressList()
                .then((addressList) => {
                    this.addressList = addressList;
                    this.selectedAddress = this.addressList[0].address;
                    this.isAddressListLoading = false;
                })
                .catch(() => {
                    this.isAddressListLoading = false;
                });
        },
        methods: {
            copy(str) {
                clipboard.copy(str);
                this.isToastVisible = true;
            },
            getAddressLink(address) {
                return EXPLORER_URL + '/address/' + address;
            }
        }
    }
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

                <div class="list-title" :key="address.address">
                    <span v-if="index === 0">Main address</span>
                    <span v-else>Address #{{ index + 1 }}</span>
                </div>
                <div class="list" :key="address.address">
                    <div class="list-item">
                        <div class="list-item__center list-item--address__hash">{{ address.address }}</div>
                        <div class="list-item__right" v-if="isClipboardSupported">
                            <button class="bip-button--value u-semantic-button" @click="copy(address.address)">Copy</button>
                        </div>
                    </div>
                    <a class="list-item list-item--chevron list-item--tappable" :href="getAddressLink(address.address)" target="_blank">
                        <div class="list-item__center">Balance</div>
                        <div class="list-item__right list-item--chevron__right">
                            <div class="list-item__label list-item__label--strong">{{ address.balance }}</div>
                        </div>
                    </a>
                    <nuxt-link class="list-item list-item--chevron list-item--tappable" :to="'/settings/addresses/manage?id=' + address.id">
                        <div class="list-item__center">Secured by</div>
                        <div class="list-item__right list-item--chevron__right">
                            <div class="list-item__label list-item__label--strong">{{ address.isServerSecured ? 'Bip Wallet' : 'You' }}</div>
                        </div>
                    </nuxt-link>
                    <div class="list-item">
                        <div class="list-item__center">Set as main</div>
                        <div class="list-item__right">
                            <label class="switch">
                                <input type="radio" class="switch__input" :value="address.address" v-model="selectedAddress">
                                <div class="switch__toggle">
                                    <div class="switch__handle"></div>
                                </div>
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
