import Vue from 'vue';
import router from './router';
import App from './app.vue';
import iView from 'iview';
import env from './config/env';

import 'iview/dist/styles/iview.css';
import './styles/style.css'
import './styles/skin1.css'

Vue.use(iView);

if (env === 'development') {
    axios.defaults.baseURL = 'http://192.168.1.111/forum/';
    axios.defaults.withCredentials = true;
} else {
    axios.defaults.baseURL = '../';
}

new Vue({
    el: '#app',
    router,
    render: h => h(App)
});
