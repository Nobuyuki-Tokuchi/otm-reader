import Vue from 'vue'
import App from './App.vue'
import store from './store'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/rubyblue.css';
import vuetify from '@/plugins/vuetify';

Vue.config.productionTip = false

new Vue({
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')
