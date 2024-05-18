<template>
  <div id="app">
    <AverageAccessTimeChart />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AverageAccessTimeChart from './components/AverageAccessTimeChart.vue';

export default defineComponent({
  name: 'App',
  components: {
    AverageAccessTimeChart,
  },
});
</script>

<style>
 @import url('./styles/main.css');
</style>
