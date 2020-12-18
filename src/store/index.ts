import Vue from 'vue'
import Vuex from 'vuex'
import DictionaryStore from './modules/dictionary.store';
import DisplayStore from './modules/display.store';

Vue.use(Vuex);

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
        get _apiUrl(): string {
            return localStorage.getItem("apiUrl") ?? "";
        },
        set _apiUrl(value: string) {
            localStorage.setItem("apiUrl", value);
        },
    },
    getters: {
        apiUrl(state) {
            return state._apiUrl;
        }
    },
    mutations: {
        setApiUrl(state, apiUrl: string) {
            state._apiUrl = apiUrl;  
        }
    },
    modules: {
        dictionary: DictionaryStore,
        display: DisplayStore,
    }
});
