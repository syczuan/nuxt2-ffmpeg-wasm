<template>
  <v-snackbar :dark="true" v-model="snackbar" :top="false" :timeout="time">
    {{ text }}
  </v-snackbar>
</template>
<script>
export default {
  props: {},
  data() {
    return {
      text: "",
      time: 2000,
      snackbar: false,
    };
  },
  methods: {
    setType(data) {
      if (!data) {
        this.snackbar = false;
        Object.assign(this.$data, this.$options.data());
      } else {
        const { text, time } = data;
        text && (this.text = text);
        time && (this.time = time);
        this.snackbar = true;
      }
    },
  },
};
</script>
