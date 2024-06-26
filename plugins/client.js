import createLoading from "@/components/loading/index";
export default ({ app, store }, inject) => {
  inject("setLoading", createLoading(store));
};
