<template>
  <div class="loading_content">
    <p class="load_tip">{{ text }}</p>
    <div style="width: 100%" class="align-center d-flex">
      <v-progress-linear
        :reverse="reverse"
        :indeterminate="indeterminate"
        color="#ffffff"
        :value="progress"
      ></v-progress-linear>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    text: {
      type: [String],
      default: "Loading...",
    },
    // 反转方向
    reverse: {
      type: [Boolean],
      default: false,
    },
    // 等待加载
    indeterminate: {
      type: [Boolean],
      default: false,
    },
    // 进度
    progress: {
      type: [Number],
      default: 0,
    },
  },
};
</script>
<style lang="scss" scoped>
.loading_content {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0px;
  top: 0px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0px 10vw;
  box-sizing: border-box;
  .load_tip {
    font-size: 16px;
    line-height: 20px;
    color: #ffffff;
    margin-bottom: 20px;
    text-align: center;
  }
}
</style>
