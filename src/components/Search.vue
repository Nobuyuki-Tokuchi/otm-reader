<template lang="pug">
    .search.flex
        .default-area.flex
            .search-area
                label 検索文字列
                input(type="text", v-model="searchItem.word", @keydown="searchWhenEnter")
                select(v-model="searchItem.searchType")
                    option(v-for="type in searchTypes", :value="type[0]") {{ type[1] }}
                select(v-model="searchItem.matchType")
                    option(v-for="type in matchTypes", :value="type[0]") {{ type[1] }}
                button.search-btn(@click="$emit('search-word', searchItem)") 検索
        .vertical-line
        .script-area.flex
            CodeMirrorVue.script(v-model="searchItem.script", @keydown="searchScriptWhenEnter")
            button.search-btn(@click="$emit('search-script', searchItem)") 検索
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { SearchItem, SearchType, MatchType } from '@/libs/search.item';
import CodeMirrorVue from "@/components/CodeMirrorVue.vue";

@Component({
    components: {
        CodeMirrorVue,
    }
})
export default class Search extends Vue {
    private readonly searchTypes: [SearchType, string][] = [
        [SearchType.WORD, "単語"],
        [SearchType.TRANSLATION, "訳語"],
        [SearchType.ALL, "全文"],
        [SearchType.TAG, "タグ"],
        [SearchType.TRANSLATION_TITLE, "訳語タイトル"],
        [SearchType.VARIATION_TITLE, "変化形タイトル"]
    ];

    private readonly matchTypes: [MatchType, string][] = [
        [MatchType.FORWARD, "前方一致"],
        [MatchType.BACKWARD, "後方一致"],
        [MatchType.PARTIAL, "部分一致"],
        [MatchType.EXACT, "完全一致"],
        [MatchType.NOT, "除外"],
    ];

    private dictionaryNames: string[];
    private searchItem: SearchItem;

    constructor() {
        super();

        this.dictionaryNames = [];
        this.searchItem = {
            word: "",
            searchType: SearchType.WORD,
            matchType: MatchType.FORWARD,
            script: "",
        };
    }

    searchWhenEnter(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === "Enter") {
            this.$emit("search-word", this.searchItem);
        }
    }

    searchScriptWhenEnter(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === "Enter") {
            this.$emit("search-script", this.searchItem);
        }
    }
}
</script>

<style lang="scss" scoped>
$main-color: black;
$sub-color: white;

.search {
    width: 100%;
    border: solid 1px $main-color;
    margin: 0;
    box-sizing: border-box;
    
    select {
        min-width: 50px;
    }

    .default-area,
    .script-area {
        margin: 5px;
    }

    .search-btn {
        margin-left: 1px;
        margin-right: 1px;

        &:first-child {
            margin-left: 0;
        }
        &:last-child {
            margin-right: 0;
        }
    }

    .default-area {
        flex-direction: column;
        
        .search-area {
            label {
                margin-right: 3px;
            }
        }
    }

    .script-area {
        flex-grow: 1;

        .script {
            width: 100%;
        }
    }

    .vertical-line {
        margin-top: 0;
        margin-bottom: 0;
        margin-left: 5px;
        margin-right: 5px;
        padding: 1px;

        border: 1px none black;
        border-left-style: solid; 
        border-right-style: solid; 
    }
}
</style>
