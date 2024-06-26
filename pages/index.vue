<template>
  <div class="home">
    <div class="content">
      <nuxt-link :to="{ name: 'video-frames' }">视频帧提取</nuxt-link>
      <nuxt-link :to="{ name: 'video-transcode' }">视频转码</nuxt-link>
      <div>请求结果：{{ text }}</div>
      <nuxt-child />
    </div>
  </div>
</template>

<script>
const imitateData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("测试文本");
    }, 500);
  });
};
export default {
  name: "index",
  data() {
    return {};
  },
  // 请求示例
  async asyncData({ params, query, req, res, redirect, error }) {
    const data = {};
    try {
      const res = await imitateData();
      data.text = res;
    } catch (error) {
      console.log(error);
    }
    return data;
  },
  methods: {},
  beforeDestroy() {},
  computed: {},
};
</script>
<style lang="scss" scoped>
.home {
  width: 100%;
  .content {
    margin: 100px auto;
    width: 100%;
    min-height: 500px;
    border-radius: 8px;
    box-shadow: 0px 2px 4px 1px rgba(128, 128, 128, 0.2);
    box-sizing: border-box;
    padding: 20px;
    background: #ffffff;
  }
}
</style>
