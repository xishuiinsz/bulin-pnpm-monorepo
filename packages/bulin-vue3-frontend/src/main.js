import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue'; // 样式
import highlight from './directives/highlight';
import lazy from './directives/lazy';
import resize from './directives/resize';
import installElementPlus from './plugins/element';
import installElementPlusIcon from './plugins/elementIcon';
import router from './router';
import rem from './utils/rem';
import './assets/css/bootstrap.css';
import './assets/css/atomic.css';
import './assets/css/icon.css';
import 'highlight.js/styles/atom-one-dark.css';

const app = createApp(App);
app.use(lazy);
app.use(highlight);
app.use(resize);
app.use(installElementPlus);
app.use(installElementPlusIcon);
app.use(rem);
app.use(createPinia()).use(router).mount('#app');
