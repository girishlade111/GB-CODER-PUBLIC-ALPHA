      import { createApp } from 'vue';
      import App from './App.vue';

      // Styles must be a real .css file imported from the module graph - the bundler
      // collects CSS that way. The playground injects #app for us; guard the mount.
      import './style.css';

      const host = document.getElementById('app');

      if (host) {
        createApp(App).mount(host);
      }