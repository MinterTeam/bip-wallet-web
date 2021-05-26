<script>
import {pretty, prettyUsd} from '~/assets/utils.js';

export default {
    props: {
        /** @type Pool */
        pool: {
            type: Object,
            required: true,
        },
        bipPriceUsd: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
        };
    },
    computed: {
        poolName() {
            return this.pool.coin0.symbol + ' / ' + this.pool.coin1.symbol;
        },
        liquidityUsd() {
            return this.pool.liquidityBip * this.bipPriceUsd;
        },
        tradeVolumeUsd() {
            return this.pool.tradeVolumeBip30D * this.bipPriceUsd;
        },
        yourLiquidityUsd() {
            return this.pool.yourLiquidityBip * this.bipPriceUsd;
        },
        apr() {
            if (!this.liquidityUsd) {
                return 0;
            }
            const reward = this.tradeVolumeUsd * 0.02;
            const earlyReward = reward * 12;
            return earlyReward / this.liquidityUsd * 100; // percent
        },
        isUnstakeAvailable() {
            return this.pool.yourLiquidity > 0;
        },
    },
    methods: {
        pretty,
        prettyUsd,
    },
};
</script>

<template>
    <div class="card">
        <div class="list-item">
            <div class="list-item__center">
                <div class="list-item__sup u-text-uppercase">Pool</div>
                <div class="list-item__name">{{ poolName }}</div>
            </div>
            <div class="list-item__right">
                <nuxt-link class="pools__control-button bip-button--main u-semantic-button" :to="`/pools/${pool.coin0.symbol}/${pool.coin1.symbol}/remove`" :class="{'is-disabled': !isUnstakeAvailable}">
                    <span class="pools__icon--minus">-</span>
                </nuxt-link>
                <nuxt-link class="pools__control-button bip-button--main u-semantic-button" :to="`/pools/${pool.coin0.symbol}/${pool.coin1.symbol}/add`">
                    <span class="pools__icon--plus">+</span>
                </nuxt-link>
            </div>
        </div>
        <div class="pools__item-body u-container">
            <dl class="pools__desc-list">
                <dt class="pools__desc-term">APR</dt>
                <dd class="pools_desc-detail u-text-decent">{{ prettyUsd(apr) }}%</dd>
            </dl>
            <dl class="pools__desc-list">
                <dt class="pools__desc-term">Volume (30d)</dt>
                <dd class="pools_desc-detail u-text-decent">${{ prettyUsd(tradeVolumeUsd) }}</dd>
            </dl>
            <dl class="pools__desc-list">
                <dt class="pools__desc-term">Liquidity</dt>
                <dd class="pools_desc-detail u-text-decent">${{ prettyUsd(liquidityUsd) }}</dd>
            </dl>
            <dl class="pools__desc-list">
                <dt class="pools__desc-term">Your liquidity</dt>
                <dd class="pools_desc-detail u-text-decent">${{ pretty(yourLiquidityUsd) }}</dd>
            </dl>
        </div>
    </div>
</template>
