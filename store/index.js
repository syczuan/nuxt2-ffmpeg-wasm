export const state = () => ({
  loading: {
    show: false,
  },
});
export const mutations = {
  setLoading(state, data) {
    let config;
    if (data.show) {
      config = { ...state.loading, ...data };
    } else {
      config = { show: false };
    }
    state.loading = config;
  },
};
const actions = {};
const getters = {};
export default {
  state,
  mutations,
  actions,
  getters,
};
