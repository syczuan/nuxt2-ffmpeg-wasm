<template>
  <div
    class="preview_image optimize_scrollbar"
    @click="closeMask($event, true)"
  >
    <div
      class="img_box"
      :style="`transform: rotate(${rotate}deg)`"
      @click.stop
      @dblclick.stop="doubleClick"
    >
      <transition name="slide">
        <img
          :key="current"
          v-show="load === true"
          @load="imageLoad(true)"
          @error="imageLoad(false)"
          @mousewheel="setImgSize($event)"
          class="image"
          :src="imgList[current]"
          alt=""
          ref="image"
        />
      </transition>

      <div class="load_status" v-if="loadTip">{{ loadTip }}</div>
    </div>

    <div class="tool_bar" @click.stop v-if="tool">
      <div class="btn" @click="setImgSize($event, 'amplify')">
        <svgicon iconClass="add" className="tool_svg" />
      </div>
      <div class="btn" @click="setImgSize($event, 'reduce')">
        <svgicon iconClass="reduce" className="tool_svg" />
      </div>
      <div class="btn" @click="rotateImg">
        <svgicon iconClass="rotate" className="tool_svg" />
      </div>
    </div>
    <div class="close_btn" @click="closeMask($event)">
      <svgicon iconClass="close" className="close_svg" />
    </div>
    <template v-if="imgList.length > 1">
      <div
        v-ripple
        class="switch_previous switch_icon"
        @click.stop
        @click="switchImage(false)"
      >
        <svgicon iconClass="arrow" className="arrow_svg" />
      </div>
      <div
        v-ripple
        class="switch_next switch_icon"
        @click.stop
        @click="switchImage(true)"
      >
        <svgicon iconClass="arrow" className="arrow_svg" />
      </div>
    </template>
  </div>
</template>
<script>
import { dataType } from "@/assets/js/public";
export default {
  name: "preview-image",
  props: {
    // 图片地址
    src: {
      type: [String, Array],
      default: "",
    },
    index: {
      type: [Number],
      default: 0,
    },
    // 工具栏开关
    tool: {
      type: [Boolean],
      default: true,
    },
    // 点击遮罩关闭
    maskClose: {
      type: [Boolean],
      default: true,
    },
  },
  data() {
    return {
      // 图片旋转角度
      rotate: 0,
      // 图片加载状态
      load: null,
      // 当前查看图片下标
      current: 0,
    };
  },
  mounted() {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  },
  methods: {
    // 切换图片
    switchImage(isNext) {
      const count = this.imgList.length;
      if (count < 2) {
        return;
      }
      if (isNext) {
        if (this.imgList[this.current + 1]) {
          this.current += 1;
        } else {
          this.current = 0;
        }
      } else {
        if (this.imgList[this.current - 1]) {
          this.current -= 1;
        } else {
          this.current = count - 1;
        }
      }
    },
    // 关闭蒙版
    closeMask(e, fromMask) {
      console.log(this.maskClose && fromMask);
      if (!this.maskClose && fromMask) {
        return;
      }
      this.$previewImage.close();
    },
    // 图片加载状态
    imageLoad(type) {
      this.load = type;
    },
    // 双击容器
    doubleClick() {
      this.$previewImage.close();
    },
    // 设置图片尺寸
    setImgSize(e, type) {
      if (this.load !== true) {
        return;
      }
      let isAmplify = true;
      if (type) {
        isAmplify = type === "amplify";
      } else {
        isAmplify = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail)) === 1;
      }

      let width = this.$refs.image.width;
      if (isAmplify) {
        width += 100;
      } else {
        width -= 100;
      }
      this.$refs.image.width = width;
      /**
       * 缩放时宽度设置后移除height属性
       * 否则object-fit: contain样式会导致图片尺寸固定
       */
      this.$refs.image.removeAttribute("height");
    },
    // 旋转图片
    rotateImg() {
      this.rotate += 90;
    },
  },
  beforeDestroy() {
    document.body.style.overflow = "initial";
    document.documentElement.style.overflow = "initial";
  },
  watch: {
    index: {
      handler(val) {
        if (this.imgList[val]) {
          this.current = val;
        } else {
          this.current = 0;
        }
      },
      immediate: true,
    },
    current: {
      handler() {
        this.load = null;
        this.rotate = 0;
        this.$nextTick(() => {
          const { innerWidth, innerHeight } = window;
          const img = this.$refs.image;
          img.onload = () => {
            if (img.width > innerWidth) {
              this.$refs.image.width = innerWidth;
            }
            if (img.height > innerHeight) {
              this.$refs.image.height = innerHeight;
            }
            // 初始化时设置当前宽度，否则第一次缩放没有过渡效果
            const width = this.$refs.image.width;
            this.$refs.image.width = width;
          };
        });
      },
    },
  },
  computed: {
    loadTip() {
      switch (this.load) {
        case false:
          return "加载失败";
        case null:
          return "加载中...";
        default:
          return "";
      }
    },
    imgList() {
      if (dataType(this.src) === "array") {
        return this.src;
      } else {
        return [this.src || ""];
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.slide-enter-active,
.slide-leave-active {
  animation-name: switchimg;
  animation-duration: 0.5s;
}
.slide-enter,
.slide-leave-to {
  opacity: 0;
}

@keyframes switchimg {
  0% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.preview_image {
  width: 100%;
  height: 100%;
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2101;
  top: 0px;
  left: 0px;
  animation-name: openpop;
  animation-duration: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
}
@keyframes openpop {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.img_box {
  user-select: none;
  transition: transform 0.4s;

  .image {
    min-width: 50px;
    max-width: 95vw;
    object-fit: contain;
    transition: 0.4s;
    -webkit-user-drag: none;
  }
  .load_status {
    font-size: 24px;
    color: #ffffff;
    animation-name: showtip;
    animation-duration: 0.5s;
  }
  @keyframes showtip {
    0% {
      opacity: 0;
    }
    90% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
}

.tool_bar {
  position: fixed;
  left: 50%;
  bottom: 100px;
  transform: translateX(-50%);
  height: 45px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 20px;
  box-sizing: border-box;
  .btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    cursor: pointer;
    &:hover .tool_svg {
      color: #00081c;
    }
    &:last-child {
      margin-right: 0px;
    }
    .tool_svg {
      font-size: 24px;
      color: #6e6e6e;
    }
  }
}

.close_btn {
  position: fixed;
  top: 50px;
  right: 50px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover .close_svg {
    color: rgba(255, 255, 255, 1);
  }
  .close_svg {
    font-size: 36px;
    color: rgba(255, 255, 255, 0.7);
  }
}

.switch_icon {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0px 2px 4px 1px rgba(128, 128, 128, 0.2);
  z-index: 1;
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    .arrow_svg {
      color: #00081c;
    }
  }
  .arrow_svg {
    font-size: 24px;
    color: #6e6e6e;
  }
}
.switch_previous {
  left: 20px;
  transform: rotate(-90deg);
}
.switch_next {
  right: 20px;
  transform: rotate(90deg);
}
</style>
