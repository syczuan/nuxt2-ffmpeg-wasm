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
            设置分辨率
          </p>
        </div>
        <v-radio-group row v-model="form.resolution.value">
          <v-radio
            v-for="(item, index) of form.resolution.list"
            :key="index"
            :label="item.name"
            :value="item.value"
          ></v-radio>
        </v-radio-group>
      </div>
      <div>
        <div class="align-center d-flex">
          <p
            class="font-weight-bold text--secondary text-left text-primary mr-10"
          >
            设置关键帧数量
          </p>
        </div>
        <div class="align-center d-flex">
          <v-slider
            class="mr-10"
            style="max-width: 500px"
            :disabled="!form.size.limit"
            v-model="form.size.max"
            :max="100"
            :min="1"
            :label="form.size.max + ''"
          ></v-slider>
          <v-switch
            dense
            class="mt-0 pt-0"
            v-model="form.size.limit"
            inset
            :label="form.size.limit ? '限制' : '无限制'"
          ></v-switch>
        </div>
      </div>
      <v-row align="center" dense>
        <v-col>
          <v-btn color="primary" @click="handlerStart">开始</v-btn>
        </v-col>
      </v-row>
    </v-card>
    <div class="align-center d-flex" dense v-if="imgSrc.length">
      <div class="mr-5">
        <v-checkbox
          @change="checkboxChange"
          :input-value="checkAll.check"
          :indeterminate="checkAll.indeterminate"
          label="全选"
        ></v-checkbox>
      </div>
      <div class="mr-5">
        <v-btn icon @click="downloadCheck">
          <v-icon>mdi-download</v-icon>
        </v-btn>
      </div>
      <p class="text-left text--disabled text-caption mb-0">{{ resultTip }}</p>
    </div>
    <v-row dense>
      <v-col
        v-for="(item, index) of imgSrc"
        :key="index"
        cols="12"
        xl="2"
        lg="2"
        md="3"
        sm="4"
      >
        <v-lazy>
          <v-hover v-slot="{ hover }">
            <v-img
              :aspect-ratio="1 / 1"
              :src="item.src"
              style="border-radius: 8px; cursor: pointer"
              class="image"
            >
              <v-overlay
                @click="checkImage(item, true)"
                :absolute="true"
                :value="item.check ? true : hover"
                :opacity="0.8"
              >
                <v-row align="center">
                  <template v-if="!item.check">
                    <v-col>
                      <v-btn icon @click="previewImg(index)">
                        <v-icon>mdi-eye</v-icon>
                      </v-btn>
                    </v-col>
                    <v-col>
                      <v-btn icon :href="item.src" :download="item.name">
                        <v-icon>mdi-download</v-icon>
                      </v-btn>
                    </v-col>
                  </template>
                  <v-col>
                    <v-btn icon @click.stop="checkImage(item)">
                      <v-icon>mdi-check</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-overlay>
            </v-img>
          </v-hover>
        </v-lazy>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { downloadZip } from "@/assets/js/public";
export default {
  head: {
    title: "FFmpeg-Frames-Tools",
  },
  data() {
    return {
      // 视频文件对象
      video: null,
      // ffmpeg实例
      ffmpeg: null,
      // 处理进度
      progress: 0,
      // 图片列表
      imgSrc: [],
      // 文件名
      fileName: "",
      form: {
        resolution: {
          list: [
            {
              name: "原图",
              value: "",
            },
            {
              name: "480P",
              value: "scale=480:-1",
            },
            {
              name: "720P",
              value: "scale=720:-1",
            },
            {
              name: "1080P",
              value: "scale=1080:-1",
            },
            {
              name: "2K",
              value: "scale=2160:-1",
            },
            {
              name: "4K",
              value: "scale=4096:-1",
            },
          ],
          value: "",
        },
        // 提取数限制
        size: {
          // 限制
          limit: true,
          // 最大提取数
          max: 12,
        },
      },
      // 执行时间
      executionTime: "",
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
      // 重置进度
      this.imgSrc = [];
      this.fileName = "";
      this.executionTime = "";
      this.$setLoading.show({
        text: "正在处理，请稍候...",
        indeterminate: false,
        reverse: true,
      });
      const t1 = window.performance.now();
      try {
        this.imgSrc = await this.getVideoFrame(this.video);
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
    // 获取视频帧
    async getVideoFrame(file) {
      const { name } = file;
      const lastDotIndex = name.lastIndexOf(".");
      if (lastDotIndex !== -1 && lastDotIndex > 0) {
        this.fileName = name.slice(0, lastDotIndex);
      } else {
        this.fileName = name;
      }

      const videoName = encodeURIComponent(name);
      return new Promise(async (resolve, reject) => {
        try {
          if (this.ffmpeg.FS("cwd") !== "/video-frames") {
            // 文件系统内创建工作区文件夹
            this.ffmpeg.FS("mkdir", "/video-frames");
            this.ffmpeg.FS("chdir", "/video-frames");
          }

          this.ffmpeg.FS("writeFile", videoName, await this.$fetchFile(file));

          const imgFixedName = "_output.png";
          const { resolution, size } = this.ffmpegConfig;
          console.log(resolution, size);
          const list = [
            // 输入视频文件
            "-i",
            videoName,
            ...resolution,
            ...size,
            // 指定使用可变帧率来输出视频帧
            "-vsync",
            "vfr",
            // 输出文件名格式为5位数字
            `%05d${imgFixedName}`,
          ];
          await this.ffmpeg.run(...list);
          // 获取所有文件列表
          let fileList = this.ffmpeg.FS("readdir", "./");

          let resultList = [];
          for (let i = 0; i < fileList.length; i++) {
            const filename = fileList[i];
            // 过滤出帧图文件列表
            if (filename.includes(imgFixedName)) {
              const fileData = this.ffmpeg.FS("readFile", filename);
              const keyframe = URL.createObjectURL(
                new Blob([fileData.buffer], { type: `image/png` })
              );
              resultList.push({
                src: keyframe,
                name: filename,
              });
              this.ffmpeg.FS("unlink", filename);
            }
            if (filename === videoName) {
              this.ffmpeg.FS("unlink", filename);
            }
          }
          resolve(resultList);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    },
    // 预览图片
    previewImg(index) {
      this.$previewImage.show({
        src: this.imgSrc.map((e) => e.src),
        index: index,
      });
    },
    // 选中图片
    checkImage(item, toMask) {
      if (toMask) {
        if (item.check) {
          this.$set(item, "check", !item.check);
        }
        return;
      }
      this.$set(item, "check", !item.check);
    },
    // 设置多选状态
    checkboxChange(check) {
      for (let i = 0; i < this.imgSrc.length; i++) {
        this.$set(this.imgSrc[i], "check", check);
      }
    },
    // 下载已选中文件
    downloadCheck() {
      let srcList = [];
      for (let i = 0; i < this.imgSrc.length; i++) {
        const item = this.imgSrc[i];
        if (item.check) {
          srcList.push(item);
        }
      }
      if (!srcList.length) {
        return;
      }
      if (srcList.length > 1) {
        downloadZip(`${this.fileName}-video-frames.zip`, srcList);
      } else {
        const downloadTags = (url, name) => {
          const dom = document.querySelector(".tools_download");
          if (dom) {
            dom.remove();
          }
          let a = document.createElement("a");
          a.setAttribute("href", url);
          a.setAttribute("target", "_self");
          if (name) {
            a.setAttribute("download", name);
          }
          a.setAttribute("class", "tools_download");
          a.click();
        };
        downloadTags(srcList[0].src, srcList[0].name);
      }
    },
  },
  beforeDestroy() {
    try {
      this.ffmpeg && this.ffmpeg.exit();
    } catch (error) {
      console.log(error);
    }
  },
  watch: {},
  computed: {
    videoSupport() {
      return ".mp4,.flv,.3gp,.avi,.mkv,.webm,.mov,.wmv";
    },
    // 结果提示
    resultTip() {
      if (this.imgSrc.length) {
        return `找到${this.imgSrc.length}个关键帧 耗时${this.executionTime}`;
      } else {
        return "";
      }
    },
    checkAll() {
      if (!this.imgSrc.length) {
        return {
          check: false,
          indeterminate: false,
        };
      }
      let check = 0;
      let noCheck = 0;
      for (let i = 0; i < this.imgSrc.length; i++) {
        const img = this.imgSrc[i];
        if (img.check) {
          check++;
        } else {
          noCheck++;
        }
      }
      return {
        check: noCheck === 0,
        indeterminate: check && noCheck ? true : false,
      };
    },
    // 获取ffmpeg配置
    ffmpegConfig() {
      // 设置视频过滤器
      let resolution = ["-vf", "select='eq(pict_type,PICT_TYPE_I)'"];
      // 指定提取的关键帧数量
      let size = [];
      if (this.form.resolution.value) {
        resolution[1] = resolution[1] + "," + this.form.resolution.value;
      }
      if (this.form.size.limit) {
        size = ["-vframes", `${this.form.size.max}`];
      }
      return {
        resolution: resolution,
        size: size,
      };
    },
  },
};
</script>
<style lang="scss" scoped></style>
