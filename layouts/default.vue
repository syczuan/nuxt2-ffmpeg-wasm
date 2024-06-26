<template>
  <v-app id="app">
    <v-app-bar dark light app>
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ navTitle }}</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer dark app v-model="drawer" temporary>
      <v-list nav dense>
        <v-list-item
          nuxt
          exact-active-class="active_item"
          v-for="(item, index) of routeList"
          :key="index"
          :to="{ name: item.routeName }"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <Nuxt />
        <handler-loading
          v-if="loading.show"
          :text="loading.text"
          :reverse="loading.reverse"
          :indeterminate="loading.indeterminate"
          :progress="loading.progress"
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import handlerLoading from "@/components/loading/loading";
export default {
  name: "layout",
  components: {
    "handler-loading": handlerLoading,
  },
  data() {
    return {
      drawer: false,
      routeList: [
        {
          name: "首页",
          routeName: "index",
          icon: "mdi-home",
        },
        {
          name: "视频帧提取",
          routeName: "video-frames",
          icon: "mdi-image-multiple",
        },
        {
          name: "视频转码",
          routeName: "video-transcode",
          icon: "mdi-play-circle",
        },
      ],
    };
  },
  computed: {
    loading() {
      return this.$store.state.loading;
    },
    activeIndex() {
      const index = this.routeList.findIndex(
        (e) => e.routeName === this.$route.name
      );
      return index;
    },
    navTitle() {
      return this.routeList[this.activeIndex]?.name || "";
    },
  },
};
</script>
<style lang="scss">
@import "~/assets/default";
// .active-head-list {
//   background: transparent;
// }
.v-list-item--link::before {
  background: transparent;
}
.active_item::before {
  background: currentColor;
}
</style>
