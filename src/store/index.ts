import Vue from 'vue'
import Vuex from 'vuex'
import DictionaryStore from './modules/dictionary.store';
import DisplayStore from './modules/display.store';

Vue.use(Vuex);

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {},
    modules: {
        dictionary: DictionaryStore,
        display: DisplayStore,
    }
});
