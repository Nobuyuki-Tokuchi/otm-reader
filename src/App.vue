<template lang="pug">
    #app
        .top-bar
            Search.search-main(@search-word="search", @search-script="searchScript")
            Pager.pager-main(v-model="pageCount", :count="count", :listingCount="listingCount")
        Viewer.view-area(:result="result", v-model="pageCount", :listingCount="listingCount")
        Sidebar
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Search from './components/Search.vue';
import Pager from "./components/Pager.vue";
import Viewer from './components/Viewer.vue';
import Sidebar from './components/Sidebar.vue';
import { BaseWord } from './libs/dictionary/dictionary';
import { getModule } from 'vuex-module-decorators';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/rubyblue.css';
import DictionaryStore from './store/modules/dictionary.store';
import { SearchItem } from './libs/search.item';

@Component({
    components: {
        Search,
        Pager,
        Viewer,
        Sidebar,
    },
    mounted: function () {
        const dictionaryInstance = getModule(DictionaryStore, this.$store);

        dictionaryInstance.loadDictionaries().then(x => {
            if (x.result !== "done") {
                console.log(x);
            }
        });
    }
})
export default class App extends Vue {
    private originalWord: BaseWord | null;
    private result: BaseWord[];
    private listingCount: number;
    private pageCount: number;

    constructor () {
        super();

        this.originalWord = null;
        this.result = [];
        this.listingCount = 16;
        this.pageCount = 1;
    }
    
    public get count(): number {
        return this.result.length;
    }

    search(searchItem: SearchItem): void {
        const instance = getModule(DictionaryStore, this.$store);
        this.result = instance.search(searchItem);
    }

    searchScript(searchItem: SearchItem): void {
        const instance = getModule(DictionaryStore, this.$store);
        this.result = instance.searchScript(searchItem);
    }

}
</script>

<style lang="scss">
$main-color: black;
$sub-color: white;

body {
    margin: 0;
    padding: 0;
}
.flex {
    display: flex;
    box-sizing: border-box;
    > .half {
        flex-basis: 50%;
    }
    > .stretch-space {
        flex-grow: 1;
        flex-shrink: 1;
    }
    > .between {
        justify-content: space-between;
    }
    > .grow {
        flex-grow: 1;
    }
}
button {
    color: $sub-color;
    background-color: $main-color;
    border: 0;
    padding-top: 2px;
    padding-bottom: 2px;
}
#app {
    color: $main-color;
    background-color: $sub-color;
    font-family: "Yu Gothic", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 25px;
}
.close {
    font-weight: bold;
    padding: 2px;
    cursor: pointer;
}
.none {
    display: none;
}

$search-main-height: 65px;
$pager-main-height: 45px;
.top-bar {
    position: fixed;
    width: calc(100% - 35px);
    background-color: white;

    .search-main {
        height: $search-main-height;
    }

    .pager-main {
        border: 1px solid black;
        padding: 5px;
        height: $pager-main-height;
    }
}
.view-area {
    padding-top: $search-main-height + $pager-main-height + 5px;
}
</style>