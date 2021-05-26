<script>
import {getPoolList, getStatus, getProviderPoolList} from '~/api/explorer.js';
import getTitle from '~/assets/get-title.js';
import VOnsSelect from 'vue-onsenui/esm/components/VOnsSelect.js';
import Layout from '~/components/LayoutDefault.vue';
import PoolListItem from '~/components/PoolListItem.vue';

export default {
    PAGE_TITLE: 'Pools',
    SORT_TYPE: ['Liquidity'],
    components: {
        VOnsSelect,
        Layout,
        PoolListItem,
    },
    fetch() {
        const statusPromise = getStatus()
            .then((statusData) => {
                this.bipPriceUsd = statusData.bipPriceUsd;
            });

        const providerPromise = getProviderPoolList(this.$store.getters.address)
            .then((providerInfo) => {
                this.providerPoolList = providerInfo.data;
            });

        return Promise.all([this.loadPoolList(), providerPromise, statusPromise]);
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
            selectedSort: this.$options.SORT_TYPE[0],
            isFilterStaked: false,
            bipPriceUsd: 0,
            isLoading: false,
            /** @type Array<Pool> */
            poolList: [],
            /** @type PaginationMeta */
            pagination: {},
            /** @type Array<PoolProvider> */
            providerPoolList: [],
        };
    },
    computed: {
        poolListFormatted() {
            return this.poolList.map((pool) => {
                const providerPool = this.providerPoolList.find((providerPool) => providerPool.token.id === pool.token.id);
                return {
                    ...pool,
                    yourLiquidity: providerPool?.liquidity || 0,
                    yourLiquidityBip: providerPool?.liquidityBip || 0,
                    yourLiquidityShare: providerPool?.liquidityShare || 0,
                };
            });
        },
    },
    methods: {
        loadPoolList(page) {
            if (this.isLoading) {
                return;
            }
            this.isLoading = true;

            return getPoolList({page, limit: 10})
                .then((poolListInfo) => {
                    poolListInfo.data.forEach((newPool) => {
                        const alreadyHasPool = this.poolList.find((poolItem) => poolItem.token.id === newPool.token.id);
                        if(!alreadyHasPool) {
                            this.poolList.push(newPool);
                        }
                    });
                    // this.poolList = poolListInfo.data;
                    this.pagination = poolListInfo.meta;
                    this.isLoading = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.isLoading = false;
                    throw error;
                });
        },
        loadMore() {
            this.loadPoolList(this.pagination.currentPage + 1);
        },
    },
};
</script>

<template>
    <Layout :title="$options.PAGE_TITLE">
        <div class="list list--noborder">
            <div class="list-item">
                <div class="list-item__center list-item__center--horizontal">
                    <span class="pools__filter-label">Staked only</span>
                    <label class="switch">
                        <input type="checkbox" class="switch__input" v-model="isFilterStaked">
                        <span class="switch__toggle">
                            <span class="switch__handle"></span>
                        </span>
                    </label>
                </div>
                <div class="list-item__right">
                    <span class="pools__filter-label">Sort by</span>
                    <VOnsSelect v-model="selectedSort">
                        <option v-for="item in $options.SORT_TYPE" :value="item" :key="item">
                            {{ item }}
                        </option>
                    </VOnsSelect>
                </div>
            </div>
        </div>
        <div class="u-section u-container" v-if="poolListFormatted.length">
            <PoolListItem
                v-for="pool in poolListFormatted"
                :pool="pool" :key="pool.token.id"
                :bipPriceUsd="bipPriceUsd"
            />

            <div class="u-section--small" v-if="pagination.currentPage < pagination.lastPage">
                <button class="bip-button bip-button--ghost-main" type="button"
                        :class="{'is-loading': isLoading}"
                        @click="loadMore"
                >
                    <span class="bip-button__content">Load more</span>
                    <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                    </svg>
                </button>
            </div>
        </div>

        <p class="u-section u-container u-text-center" v-else>
            <span v-if="isLoading">Loading…</span>
            <span v-else>No pools</span>
        </p>

    </Layout>
</template>
