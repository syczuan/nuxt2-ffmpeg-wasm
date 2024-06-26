<template>
  <v-container>
    <v-row align="center">
      <v-col>
        <v-file-input
          prepend-icon="mdi-video"
          @change="changeFile"
          show-size
          clearable
          label="选择视频文件"
          :accept="videoSupport"
        ></v-file-input>
      </v-col>
    </v-row>
    <v-card class="pa-5 mt-5 mb-5">
      <div>
        <div class="align-center d-flex">
          <p
            class="font-weight-bold text--secondary text-left text-primary mb-0 mr-10"
          >
            选择转换格式
          </p>
        </div>
        <v-radio-group row v-model="toFormat.value">
          <v-radio
            v-for="(item, index) of toFormat.list"
            :key="index"
            :label="item"
            :value="item"
          ></v-radio>
        </v-radio-group>
      </div>
      <v-btn color="primary" @click="handlerStart">开始</v-btn>
    </v-card>
    <div class="align-center d-flex" dense v-if="videoSrc">
      <div class="mr-5">
        <v-btn icon :href="videoSrc" :download="fileName">
          <v-icon>mdi-download</v-icon>
        </v-btn>
      </div>
      <p class="text-left text--disabled text-caption mb-0">{{ resultTip }}</p>
    </div>
    <div class="play_box pa-3 pt-5"></div>
  </v-container>
</template>
<script>
export default {
  head: {
    title: "FFmpeg-Transcode-Tools",
  },
  data() {
    return {
      // 视频文件对象
      video: null,
      // ffmpeg实例
      ffmpeg: null,
      // 处理进度
      progress: 0,
      // 视频播放地址
      videoSrc: "",
      // 文件名
      fileName: "",
      // 执行时间
      executionTime: "",
      // 转换格式数据
      toFormat: {
        list: ["mp4", "mkv", "3gp", "avi", "webm", "mov", "wmv", "dv"],
        value: "",
      },
    };
  },
  async mounted() {
    this.$setLoading.show({
      text: "FFmpeg.wasm正在加载，请稍候...",
      indeterminate: true,
    });
    this.ffmpeg = this.$initFFmpeg({
      log: false,
      logger: ({ type, message, load }) => {
        if (type === "init") {
          switch (load) {
            case true:
              this.$setLoading.hide();
              break;
            case false:
              this.$setLoading.hide();
              this.$message.show("FFmpeg.wasm加载失败");
              break;
            default:
              break;
          }
        }
      },
      progress: (e) => {
        console.log(">>>>>>> ", e);
        this.$setLoading.show({
          text: `正在处理，请稍候...${Math.trunc(e)}%`,
          reverse: false,
          progress: e,
        });
      },
    });
    await this.ffmpeg.load();
  },
  methods: {
    // 文件选择回调
    changeFile(e) {
      this.video = e;
    },
    // 开始处理
    async handlerStart() {
      if (!this.video) {
        return this.$message.show("请选择文件");
      }
      if (!this.ffmpeg?.isLoaded()) {
        return this.$message.show("ffmpeg未完成加载");
      }
      if (!this.toFormat.value) {
        return this.$message.show("请选择转换格式");
      }
      this.videoSrc = "";
      this.fileName = "";
      this.executionTime = "";
      let playBox = this.$el.querySelector(".play_box");
      playBox.innerHTML = "";
      this.$setLoading.show({
        text: "正在处理，请稍候...",
        indeterminate: false,
        reverse: true,
      });
      const t1 = window.performance.now();
      try {
        this.videoSrc = await this.videoTranscode(this.video);
        this.checkVideoPlay(this.videoSrc);
      } catch (error) {
        this.$message.show("处理失败");
        console.log(error);
      }
      const t2 = window.performance.now();
      if (t2 - t1 > 1000) {
        this.executionTime = Math.round((t2 - t1) / 1000) + "s";
      } else {
        this.executionTime = (t2 - t1).toFixed(2) + "ms";
      }

      this.$setLoading.hide();
    },
    // 视频转码
    videoTranscode(file) {
      const { name } = file;
      const videoName = encodeURIComponent(name);
      return new Promise(async (resolve, reject) => {
        try {
          if (this.ffmpeg.FS("cwd") !== "/video-transcode") {
            // 文件系统内创建工作区文件夹
            this.ffmpeg.FS("mkdir", "/video-transcode");
            this.ffmpeg.FS("chdir", "/video-transcode");
          }

          this.ffmpeg.FS("writeFile", videoName, await this.$fetchFile(file));

          this.fileName = `output.${this.toFormat.value}`;

          const list = [
            // 输入视频文件
            "-i",
            videoName,
            // 输出视频文件
            this.fileName,

            // // 模糊背景
            // "-i",
            // videoName,
            // "-vf",
            // "split[a][b];[a]crop=(ih/16*9):ih,scale=iw/10:-1,gblur=sigma=5,scale=720:1280[1];[b]scale=720:(720*ih/iw)[2];[1][2]overlay=0:(H-h)/2",
            // this.fileName,
            // "-y",
          ];
          await this.ffmpeg.run(...list);
          // 获取所有文件列表
          let fileList = this.ffmpeg.FS("readdir", "./");
          console.log(fileList);
          const fileData = this.ffmpeg.FS("readFile", `./${this.fileName}`);
          const videoSrc = URL.createObjectURL(
            new Blob([fileData.buffer], { type: "video/mp4" })
          );
          this.ffmpeg.FS("unlink", `./${this.fileName}`);
          this.ffmpeg.FS("unlink", `./${videoName}`);
          resolve(videoSrc);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    },
    // 检查是否支持播放转码后的视频
    checkVideoPlay(src) {
      let video = document.createElement("video");
      let playBox = this.$el.querySelector(".play_box");
      video.src = src;
      // 添加事件监听器检查视频能否播放
      video.oncanplaythrough = () => {
        video.style.maxWidth = "100%";
        video.controls = true;
        video.controlsList = "nodownload";
        playBox.appendChild(video);
      };

      video.onerror = () => {
        let tip = document.createElement("p");
        tip.innerText = "浏览器不支持此格式视频播放，请下载后查看";
        tip.style.fontSize = "14px";
        tip.style.color = "rgba(0, 0, 0, 0.38)";
        playBox.appendChild(tip);
      };
      video.load();
    },
  },
  computed: {
    videoSupport() {
      return ".mp4,.flv,.3gp,.avi,.mkv,.webm,.mov,.wmv";
    },
    // 结果提示
    resultTip() {
      if (this.videoSrc) {
        return `耗时${this.executionTime}`;
      } else {
        return "";
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
