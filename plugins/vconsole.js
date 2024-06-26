import VConsole from "vconsole";
const isDev = process.env.NODE_ENV !== "production";
let vconsole = {};
if (isDev && false) {
  vconsole = new VConsole();
}
export default vconsole;
