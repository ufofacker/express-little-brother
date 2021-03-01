
<template>
  <game-box></game-box>
</template>

<script>
import GameBox from "./components/GameBox.vue";

export default {
  name: "App",
  components: {
    GameBox
  },
  data() {
    return {
      // logoImg: require("@/assets/logo.png")
    };
  }
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-size: 12px;
  width: 100%;
  height: 100%;
  color: #606266;
  overflow: hidden;
}
#app {
  position: absolute;
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
