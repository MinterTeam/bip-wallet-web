import {getProfile} from "~/api";

export default {
    UPDATE_PROFILE: ({ commit }) => {
        return getProfile()
            .then((profile) => commit('SET_PROFILE', profile));
    }
}
