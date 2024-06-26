const { createFFmpeg, fetchFile } = require("@ffmpeg/ffmpeg");
import { supportWASM } from "@/assets/js/public";
export default ({ app, store }, inject) => {
  const initFFmpeg = ({ log, logger, progress }) => {
    return createFFmpeg({
      corePath: "/ffmpeg-wasm/ffmpeg-core.js",
      log: log ? true : false,
      logger: ({ type, message }) => {
        try {
          if (!supportWASM()) {
            logger({
              type: "init",
              load: false,
              message: "error",
            });
            return;
          }
          const aboutInitLog = ["ffmpeg-core loaded", "ffmpeg-core loadFailed"];
          if (aboutInitLog.includes(message)) {
            const isLoad = message === aboutInitLog[0];
            logger({
              type: "init",
              load: isLoad,
              message: isLoad ? "success" : "error",
            });
          } else {
            logger({ type: type, message: message });
          }
        } catch (error) {
          logger({ type: "init", message: error, load: false });
        }
      },
      progress: ({ ratio }) => {
        const num = ratio * 100;
        // 当前进度为负数时不回调
        if (ratio >= 0) {
          progress(num);
        }
      },
    });
  };
  inject("fetchFile", fetchFile);
  inject("initFFmpeg", initFFmpeg);
};
