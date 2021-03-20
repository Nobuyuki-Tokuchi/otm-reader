<template lang="pug">
    v-app#app
        div.top-panel
            v-card
                v-tabs(background-color="secondary", dark, v-model="openTab")
                    v-tab(v-for="item in tabItems", :key="item.code") {{ item.name }}
                v-tabs-items(v-model="openTab")
                    v-tab-item(:key='"search"')
                        v-card(flat)
                            Search.search-main(@search-word="search", @search-script="searchScript")
                            v-pagination(background-color="secondary", dark, v-model="pageCount", :length="maxPageCount", :total-visible="8")
                    v-tab-item(:key='"option"')
                        v-card(flat)
                            Options
        Viewer(:result="result", v-model="pageCount", :listingCount="listingCount")
        CommandPallet
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Search from './components/Search.vue';
import Viewer from './components/Viewer.vue';
import Options from './components/Options.vue';
import CommandPallet from  './components/CommandPallet.vue';
import { BaseWord } from './libs/dictionary/dictionary';
import { getModule } from 'vuex-module-decorators';
import DisplayStore from './store/modules/display.store';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/rubyblue.css';
import DictionaryStore from './store/modules/dictionary.store';
import { SearchItem } from './libs/search.item';

@Component({
    components: {
        Search,
        Viewer,
        Options,
        CommandPallet,
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
    private openTab: string;
    
    private readonly tabItems = [
        { code: "search", name: "検索" },
        { code: "option", name: "設定" },
    ];

    constructor () {
        super();

        this.originalWord = null;
        this.result = [];
        this.listingCount = 16;
        this.pageCount = 1;
        this.openTab = "search";
    }
    
    public get count(): number {
        return this.result.length;
    }

    public get maxPageCount(): number {
        const count =  Math.ceil(this.count / this.listingCount);
        if (count === 0) {
            return 1;
        }
        else {
            return count;
        }
    }

    search(searchItem: SearchItem): void {
        const dictionary = getModule(DictionaryStore, this.$store);
        this.result = dictionary.search(searchItem);
        
        const display = getModule(DisplayStore, this.$store);
        if (display.updateAfter) {
            this.pageCount = 1;
        }
    }

    searchScript(searchItem: SearchItem): void {
        const dictionary = getModule(DictionaryStore, this.$store);
        this.result = dictionary.searchScript(searchItem);

        const display = getModule(DisplayStore, this.$store);
        if (display.updateAfter) {
            this.pageCount = 1;
        }
    }

}
</script>

<style lang="scss">
body {
    margin: 0;
    padding: 0;
}
#app {
    font-family: "Yu Gothic", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 10px;
}

// custom

.d-flex > .flex-half {
    flex-basis: 50%;
}

.top-panel {
    position: sticky;
    margin: 0;
    padding: 0;
    top: 10px;
    z-index: 2;
}

.dialog {
    display: none;
    position: fixed;
    top: 30%;
    left: 25%;
    z-index: 10;

    &.open {
        display:flex;
        flex-direction: column;
    }

    .edit-area {
        width: calc(100% - 10px);
        resize: vertical;
    }
}

.close {
    font-weight: bold;
    padding: 2px;
    cursor: pointer;
}
</style>