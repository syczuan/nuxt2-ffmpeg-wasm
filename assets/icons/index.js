import Vue from "vue";
import svgicon from "@/components/SvgIcon";
if (!Vue._svgicon_components) {
  Vue._svgicon_components = true;
  // 全局注册组件
  Vue.component("svgicon", svgicon);
}

// 定义一个加载目录的函数
const requireAll = (requireContext) =>
  requireContext.keys().map(requireContext);
const req = require.context("@/assets/icons", true, /\.svg$/);
// 加载目录下的所有 svg 文件
requireAll(req);
