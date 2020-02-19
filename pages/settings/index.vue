<script>
    import getTitle from '~/assets/get-title';
    import Layout from '~/components/LayoutDefault';
    import Navbar from '~/components/Navbar';
    import AvatarField from '~/components/AvatarField';



    export default {
        PAGE_TITLE: 'Settings',
        components: {
            Layout,
            Navbar,
            AvatarField,
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

            };
        },
        methods: {
            logout() {
                this.$store.commit('LOGOUT');
                this.$router.push('/auth');
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
            <!-- Settings for user with profile -->
            <AvatarField v-if="$store.getters.isUserWithProfile"/>
            <div class="list" v-if="$store.getters.isUserWithProfile">
                <nuxt-link class="list-item list-item--chevron list-item--tappable" to="/settings/profile-username">
                    <div class="list-item__center">Username</div>
                    <div class="list-item__right list-item--chevron__right">
                        <div class="list-item__label list-item__label--strong">@{{ $store.state.user.username }}</div>
                    </div>
                </nuxt-link>
                <!--<nuxt-link class="list-item list-item&#45;&#45;chevron list-item&#45;&#45;tappable" to="/settings/profile-phone">
                    <div class="list-item__center">Mobile</div>
                    <div class="list-item__right list-item&#45;&#45;chevron__right">
                        <div class="list-item__label list-item__label&#45;&#45;strong" v-if="$store.state.user.phone">{{ $store.state.user.phone }}</div>
                        <div class="list-item__label" v-else>Add</div>
                    </div>
                </nuxt-link>-->
                <nuxt-link class="list-item list-item--chevron list-item--tappable" to="/settings/profile-email">
                    <div class="list-item__center">Email</div>
                    <div class="list-item__right list-item__overflow list-item--chevron__right">
                        <div class="list-item__label list-item__label--strong u-text-overflow" v-if="$store.state.user.email">{{ $store.state.user.email }}</div>
                        <div class="list-item__label" v-else>Add</div>
                    </div>
                </nuxt-link>
                <nuxt-link class="list-item list-item--chevron list-item--tappable" to="/settings/profile-password">
                    <div class="list-item__center">Password</div>
                    <div class="list-item__right list-item--chevron__right">
                        <div class="list-item__label">Change</div>
                    </div>
                </nuxt-link>
            </div>
            <!-- Settings for all users -->
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
        </div>
    </Layout>
</template>
