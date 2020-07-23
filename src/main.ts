import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.directive("select", {
    bind: (el, binding) => {
        const hasSelected = el.classList.contains("selected");
        const value = el.getAttribute("data-value");

        if (hasSelected && binding.value !== value) {
            el.classList.remove("selected");
        }
        else if (!hasSelected && binding.value === value) {
            el.classList.add("selected");
        }
    },
    update: (el, binding) => {
        const hasSelected = el.classList.contains("selected");
        const value = el.getAttribute("data-value");

        if (hasSelected && binding.value !== value) {
            el.classList.remove("selected");
        }
        else if (!hasSelected && binding.value === value) {
            el.classList.add("selected");
        }
    }
})

new Vue({
  render: h => h(App)
}).$mount('#app')
