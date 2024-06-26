export function supportWASM() {
  let useWasm = false;
  var webAsmObj = window["WebAssembly"];
  if (typeof webAsmObj === "object") {
    if (typeof webAsmObj["Memory"] === "function") {
      if (
        typeof webAsmObj["instantiateStreaming"] === "function" ||
        typeof webAsmObj["instantiate"] === "function"
      )
        useWasm = true;
    }
  }
  return useWasm;
}

/**
 *  判断数据类型
 * @param data 需判断的数据
 */
export function dataType(data) {
  if (typeof data == "object") {
    let dataType;
    switch (Object.prototype.toString.call(data)) {
      case "[object Object]":
        dataType = "object";
        break;
      case "[object Array]":
        dataType = "array";
        break;
      case "[object Null]":
        dataType = "null";
        break;
      default:
        break;
    }
    return dataType;
  } else {
    return typeof data;
  }
}

/**
 *  链接转blob
 * @param {String} url 链接
 * @param {String} responseType 读取类型
 * @callback callback 进度回调
 */
export function urlToBlob(url, responseType = "blob", callback) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = responseType;
    xhr.onload = function () {
      if (xhr.status == 200) {
        resolve(xhr.response);
      } else {
        reject(xhr.status);
      }
    };
    xhr.onerror = function () {
      reject("Request error");
    };
    xhr.onprogress = function (event) {
      if (event.lengthComputable) {
        let percentage = (event.loaded / event.total) * 100;
        callback && callback(Math.floor(percentage));
      }
    };
    xhr.send();
  });
}

export async function downloadZip(zipName, files) {
  if (!process.client) {
    return;
  }
  const JSZip = require("jszip");
  const FileSaver = require("file-saver");

  const zip = new JSZip(); // 创建实例对象
  const promises = [];
  files.forEach((item) => {
    const promise = urlToBlob(item.src).then((res) => {
      const fileName = item.name + "";
      // 创建文件用file()，创建文件夹用 floder()
      zip.file(fileName, res, { binary: true });
    });
    promises.push(promise);
  });
  // 生成 zip 文件
  Promise.all(promises).then(() => {
    // 生成zip 文件
    zip
      .generateAsync({
        type: "blob",
        compression: "DEFLATE", // STORE: 默认不压缩， DEFLATE：需要压缩
        compressionOptions: {
          level: 9, // 压缩等级 1~9   1 压缩速度最快， 9 最优压缩方式
        },
      })
      .then((res) => {
        FileSaver.saveAs(res, zipName); // 使用FileSaver.saveAs保存文件，文件名可自定义
      });
  });
}
