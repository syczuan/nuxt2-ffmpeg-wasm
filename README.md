# nuxt-ffmpeg



```bash
# 安装依赖
$ yarn install

# 运行 localhost:7373
$ yarn serve

# 打包运行
$ yarn build
$ yarn start

```

`yarn serve` 后请使用本机地址`127.0.0.1` 或 `localhost`访问，否则ffmpeg.wasm无法加载；部署在线上则必须使用`https`



`yarn build` 后需要的文件夹及文件

​	`.nuxt` 

​	`patches`

​	`static`

​	`nuxt.config.js`

​	`package.json` 

​	`	yarn.lock`
