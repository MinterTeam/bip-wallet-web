<script>
    import FileInput from 'v-file-input/src/FileInput';
    import {updateProfileAvatar} from "~/api";
    import {getValidationError, getErrorText} from "~/assets/server-error";
    import Modal from '~/components/Modal';

    const MAX_FILE_SIZE = 0.5; // MB
    const MAX_FILE_WIDTH = 500;
    const MAX_FILE_HEIGHT = 500;

    export default {
        MAX_FILE_WIDTH,
        MAX_FILE_HEIGHT,
        components: {
            FileInput,
            Modal,
        },
        data() {
            return {
                isFormSending: false,
                serverError: '',
                fileError: '',
                fileApiError: false,
                isDragLayerVisible: false,
            };
        },
        computed: {

        },
        methods: {
            updateFile(files) {
                if (files[0].size > MAX_FILE_SIZE * 1024 * 1024) {
                    this.fileError = `Maximum file size is ${MAX_FILE_SIZE} MB`;
                    return;
                }

                this.isFormSending = true;
                this.fileError = '';
                updateProfileAvatar(files[0].blob)
                    .then((userAvatar) => {
                        this.$store.commit('SET_PROFILE_USER', {
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
            //     this.$store.commit('SET_PROFILE_USER', {
            //         ...this.$store.state.auth.user,
            //         avatar: null,
            //     });
            //     this.fileError = '';
            // },
        },
    };
</script>

<template>
    <div class="u-section u-container u-bg-white">
        <div class="avatar-field">
            <div class="avatar-field__avatar avatar avatar--large"
                 :style="{backgroundImage: `url('${$store.getters.avatar}')`}"
            ></div>

            <label class="bip-button bip-button--ghost-main avatar-field__button"
                   :class="{'is-loading': isFormSending}"
                   v-if="!fileApiError"
            >
                <span class="bip-button__content">Change userpic</span>
                <FileInput accept="image/*" class="avatar-field__input"
                           :max-width="$options.MAX_FILE_WIDTH"
                           :max-height="$options.MAX_FILE_HEIGHT"
                           @on-add="updateFile"
                           @on-error="fileApiError = true"
                           @on-drag-start="isDragLayerVisible = true"
                           @on-drag-end="isDragLayerVisible = false"
                />
                <svg class="loader loader--button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                    <circle class="loader__path" cx="25" cy="25" r="16"></circle>
                </svg>
            </label>
        </div>
        <div class="bip-form__error" v-if="fileError">{{ fileError }}</div>

        <Modal :isOpen.sync="isDragLayerVisible"
               :hideCloseButton="true"
               modal-class="file-input__drag-layer"
               modal-container-class="file-input__drag-layer-container"
        >
            <h3 class="modal__title u-h2">Upload image</h3>
            <p class="modal__text">Drop image anywhere to upload</p>
        </Modal>
    </div>
</template>
