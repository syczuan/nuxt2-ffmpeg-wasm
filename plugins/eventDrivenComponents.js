import Vue from "vue";

// 提示组件
import message from "@/components/message";
const messageComponent = () => {
  const id = "FFmpegMessage";
  const messageComponent = Vue.extend(message);
  let messageInstance = new messageComponent();
  messageInstance.$mount();
  messageInstance.$el.id = id;
  document.body.appendChild(messageInstance.$el);
  return {
    close: () => {
      messageInstance.$nextTick(() => {
        messageInstance.setType();
      });
    },
    show: (data) => {
      let text = "";
      let time = 2000;
      if (typeof data === "string") {
        text = data;
      } else {
        text = data.text;
        time = data.time;
      }
      messageInstance.$nextTick(() => {
        messageInstance.setType({
          text: text,
          time: time,
        });
      });
    },
  };
};
if (!Vue._use_message) {
  Vue._use_message = true;
  Vue.use({
    install(Vue) {
      Vue.prototype.$message = messageComponent();
    },
  });
}

// 创建预览图片组件
import previewImage from "@/components/previewImage";
const previewImgComponent = () => {
  const id = "FFmpegPreviewImage";
  const previewComponent = Vue.extend(previewImage);
  let previewInstance = null;
  return {
    close: () => {
      previewInstance && previewInstance.$destroy();
      previewInstance = null;
      const dom = document.getElementById(id);
      if (dom) {
        document.body.removeChild(dom);
      }
    },
    show: ({ index, tool, src, maskClose }) => {
      const dom = document.getElementById(id);
      if (dom) {
        document.body.removeChild(dom);
      }
      previewInstance = new previewComponent({
        propsData: {
          index: index || 0,
          tool: tool,
          src: src || "",
          maskClose: maskClose,
        },
      });
      previewInstance.$mount();
      previewInstance.$el.id = id;
      document.body.appendChild(previewInstance.$el);
    },
  };
};
if (!Vue._use_previewImage) {
  Vue._use_previewImage = true;
  Vue.use({
    install(Vue) {
      Vue.prototype.$previewImage = previewImgComponent();
    },
  });
}
