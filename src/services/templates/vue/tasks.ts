
export default {
  files: [
    {
      path: 'App.vue',
      content: `<script setup>
import { ref } from 'vue';
const tasks = ref([{ text: 'Learn Vue', done: false }]);
</script>
<template>
  <div style="font-family: sans-serif; padding: 20px;">
    <h1>Vue Task Manager</h1>
    <ul>
      <li v-for="(task, index) in tasks" :key="index">
        <input type="checkbox" v-model="task.done" /> {{ task.text }}
      </li>
    </ul>
  </div>
</template>`
    },
    {
      path: 'main.js',
      content: `import { createApp } from 'vue';
import App from './App.vue';
createApp(App).mount('#app');`
    }
  ]
};
