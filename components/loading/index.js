export default (store) => {
  return {
    show: (config = {}) => {
      store.commit("setLoading", {
        show: true,
        ...config,
      });
    },
    hide: () => {
      store.commit("setLoading", {
        show: false,
      });
    },
    update: (config = {}) => {
      store.commit("setLoading", {
        show: store.state.loading.show,
        ...config,
      });
    },
  };
};
