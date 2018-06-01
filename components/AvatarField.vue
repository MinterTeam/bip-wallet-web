<script>
    import {mapGetters} from 'vuex';
    import FileInput from 'v-file-input/src/FileInput';
    import {putProfileAvatar} from "~/api";
    import {getValidationError, getErrorText} from "~/assets/server-error";

    const MAX_FILE_SIZE = 0.5; // MB

    export default {
        components: {
            FileInput,
        },
        data() {
            return {
                isFormSending: false,
                serverError: '',
                fileError: '',
                isDragLayerVisible: false,
            }
        },
        computed: {
            ...mapGetters([
                'usernameLetter',
                'avatar',
            ]),
        },
        methods: {
            updateFile(files) {
                if (files[0].size > MAX_FILE_SIZE * 1024 * 1024) {
                    this.fileError = `Maximum file size is ${MAX_FILE_SIZE} MB`;
                    return;
                }

                this.isFormSending = true;
                this.fileError = '';
                putProfileAvatar(files[0].blob)
                    .then((userAvatar) => {
                        this.$store.commit('SET_PROFILE', {
                            ...this.$store.state.auth.user,
                            avatar: userAvatar,
                        });
                        this.isFormSending = false;
                    })
                    .catch((error) => {
                        this.fileError = getValidationError(error) || getErrorText(error);
                        this.isFormSending = false;
                    });
            },
            // clearFile() {
            //     deleteProfileAvatar();
            //     this.$store.commit('SET_PROFILE', {
            //         ...this.$store.state.auth.user,
            //         avatar: null,
            //     });
            //     this.fileError = '';
            // },
        },
    }
</script>

<template>
    <div class="u-section u-container u-bg-white">
        <div class="avatar-field">
            <div class="avatar-field__avatar user__avatar user__avatar--large"
                 :style="{backgroundImage: avatar ? `url('${avatar}')` : ''}"
                 :class="{'user__avatar--letter': !avatar}"
            >
                <span v-if="!avatar">{{ usernameLetter }}</span>
            </div>

            <label class="bip-button bip-button--ghost-main avatar-field__button" :class="{'is-loading': isFormSending}">
                <span class="bip-button__content">{{ avatar ? 'Change userpic' : 'Upload userpic' }}</span>
                <FileInput accept="image/*" class="avatar-field__input"
                           v-on:onAdd="updateFile"
                           v-on:onError="fileApiError = true"
                           v-on:onDragStart="isDragLayerVisible = true"
                           v-on:onDragEnd="isDragLayerVisible = false"
                />
                <svg class="button-loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                    <circle class="button-loader__path" cx="25" cy="25" r="16"></circle>
                </svg>
            </label>
        </div>
        <div class="bip-form__error" v-if="fileError">{{ fileError }}</div>
    </div>
</template>
