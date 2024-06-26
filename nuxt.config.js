const path = require("path");
const fs = require("fs");
const resolve = (dir) => {
  return path.join(__dirname, dir);
};
import colors from "vuetify/es5/util/colors";
const isDev = process.env.NODE_ENV !== "production";
export default {
  ssr: true,
  head: {
    titleTemplate: "%s",
    title: "Tools",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  css: ["@mdi/font/css/materialdesignicons.css"],

  plugins: [
    { src: "@/plugins/default" },
    { src: "@/plugins/client", ssr: false },
    { src: "@/plugins/ffmpeg" },
    // 事件驱动组件
    { src: "@/plugins/eventDrivenComponents", ssr: false },
    { src: "@/plugins/vconsole", ssr: false },
  ],

  // 运行时收集信息提示
  telemetry: false,

  // 自动导入组件
  components: false,

  buildModules: ["@nuxtjs/vuetify"],

  modules: ["@nuxtjs/pwa"],

  pwa: {
    manifest: {
      lang: "en",
    },
  },

  vuetify: {
    defaultAssets: false,
    customVariables: ["~/assets/variables.scss"],
    icons: {
      iconfont: "mdi",
    },
    // theme: {
    //   // dark: false,
    //   defaultTheme: "light",

    // },
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  serverMiddleware: [
    {
      handler: (req, res, next) => {
        res?.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        res?.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        next();
      },
    },
  ],
  build: {
    // 文件打包名
    filenames: {
      app: () => (isDev ? "[name].js" : "[name]-[contenthash].js"),
      chunk: () => (isDev ? "[name].js" : "[name]-[contenthash].js"),
      css: () => (isDev ? "[name].css" : "[name]-[contenthash].css"),
    },

    postcss: {
      preset: {
        // 自动添加兼容浏览器css前缀
        autoprefixer: true,
      },
    },

    // 分离js和css，利于seo(防止css显示在网页源代码中)
    extractCSS: {
      // 解决引入文件顺序不正确报错问题
      ignoreOrder: true,
    },
    extend(config, { isClient }) {
      // 使用svg配置
      const svgRule = config.module.rules.find((rule) =>
        rule.test.test(".svg")
      );
      svgRule.exclude = [resolve("assets/icons")];
      //添加loader规则
      config.module.rules.push({
        test: /\.svg$/, //匹配.svg
        include: [resolve("assets/icons")], //将存放svg的目录加入到loader处理目录
        use: [
          { loader: "svg-sprite-loader", options: { symbolId: "icon-[name]" } },
        ],
      });
    },
  },
  // 设置运行端口
  server: {
    port: 7373,
    host: "127.0.0.1",
  },
};
