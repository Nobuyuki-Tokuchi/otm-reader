<template lang="pug">
    .search
        .search-tab.flex(@click="changeSelected")
            button.search-tab-btn(v-select="selected", data-value="1") 通常検索
            button.search-tab-btn(v-select="selected", data-value="2") OtmSearch検索
            button.search-tab-btn(v-select="selected", data-value="3") 辞書一覧
            button.search-tab-btn(v-select="selected", data-value="4") オプション
        .search-contents
            .search-tab-content.search-panel(v-select="selected", data-value="1")
                .flex
                    label 検索文字列
                    input(type="text", v-model="searchItem.word", @keydown="searchWhenEnter")
                    select(v-model="searchItem.searchType")
                        option(v-for="type in searchTypes", :value="type[0]") {{ type[1] }}
                    select(v-model="searchItem.matchType")
                        option(v-for="type in matchTypes", :value="type[0]") {{ type[1] }}
                    button(@click="$emit('search-word', searchItem)") 検索
            .search-tab-content(v-select="selected", data-value="2")
                .flex
                    textarea.script(rows="5", v-model="searchItem.script", @keydown="searchWhenEnter")
                    button(@click="$emit('search-script', searchItem)") 検索
            .search-tab-content.dictionary-list(v-select="selected", data-value="3")
                .flex
                    ul.half(@click="removeDictionary")
                        li.no-mark(v-for="(name, index) in dictionaryNames", :key="index")
                            input(type="checkbox", name="dict-name", :value="name", v-model="searchItem.targetNames")
                            span {{ name }}
                            span.close(:data-key="index") &times;
                    div.half
                        input(type="file", multiple, @change="changeDictionaries")
            .search-tab-content(v-select="selected", data-value="4")
                .flex
                    div 内容が存在しない項目は表示しない：
                        input(type="checkbox", :checked="hiddenEmptyContents", @change="$emit('change', $event.target.checked)")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SearchType, MatchType } from '@/libs/search.enum';
import { SearchItem } from '@/libs/search.item';
import { DictionaryManager } from '@/libs/dictionary.manager';

@Component({
    model: {
        prop: "checked",
        event: "change"
    },
})
export default class Search extends Vue {
    @Prop() private dictionaries!: DictionaryManager;
    @Prop() private hiddenEmptyContents!: boolean;

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

    private selected: string;
    private dictionaryNames: string[];
    private searchItem: SearchItem;

    constructor() {
        super();

        this.selected = "1";
        this.dictionaryNames = [];
        this.searchItem = {
            word: "",
            searchType: SearchType.WORD,
            matchType: MatchType.FORWARD,
            script: "",
            targetNames: []
        };
    }

    searchWhenEnter(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === "Enter") {
            switch (this.selected) {
                case "1":
                    this.$emit("search-word", this.searchItem);
                    break;
                case "2":
                    this.$emit("search-script", this.searchItem);
                    break;
                default:
                    break;
            }
        }
    }

    changeSelected(event: Event): void {
        const el = event.target;

        if (el instanceof HTMLElement) {
            const value = el.getAttribute("data-value");

            if (value != null) {
                this.selected = value;
            }
        }
    }

    removeDictionary(event: Event): void {
        const el = event.target;

        if (el instanceof HTMLElement) {
            const value = el.getAttribute("data-key");

            if (value != null) {
                const removeNames = this.dictionaryNames.splice(parseInt(value), 1);
                if (removeNames.length > 0) {
                    const index = this.searchItem.targetNames.indexOf(removeNames[0]);
                    if (index !== -1) {
                        this.searchItem.targetNames.splice(index, 1);
                    }
                    this.dictionaries.remove(removeNames[0]);
                }
            }
        }
    }

    changeDictionaries(event: Event): void {
        const files = (event.target as HTMLInputElement).files;

        if (files) {
            for (const file of files) {
                const reader = new FileReader();
                reader.addEventListener("load", () => {
                    const dictionary = JSON.parse(reader.result as string);

                    if (!this.dictionaryNames.includes(file.name)) {
                        this.dictionaryNames.push(file.name);
                        this.searchItem.targetNames.push(file.name);
                    }
                    this.dictionaries.set(file.name, dictionary);

                    (event.target as HTMLInputElement).files = null;
                });
                reader.readAsText(file, "UTF-8");
            }
        }
    }
}
</script>

<style lang="scss" scoped>
$main-color: black;
$sub-color: white;

.search {
    .search-tab {
        padding: 0;

        button.search-tab-btn {
            color: $main-color;
            background-color: $sub-color;
            border: 0;
            border-top: solid 1px $main-color;
            border-left: solid 1px $main-color;
            padding: 5px 10px;
            margin: 0;

            &:last-child {
                border-right: solid 1px $main-color;
            }

            &.selected {
                color: $sub-color;
                background-color: $main-color;
            }
        }
    }

    .search-contents {
        border: solid 1px $main-color;
        padding: 2px;
        margin: 0;
        width: 100%;
        box-sizing: border-box;

        .search-tab-content {
            display: none;
            width: 100%;

            > .flex > * {
                box-sizing: border-box;
                margin-top: 5px;
                margin-bottom: 5px;
                margin-left: 10px;
                margin-right: 10px;
            }

            .script {
                resize: vertical;
                flex-grow: 1;
            }

            &.selected {
                display: initial;
            }

            &.search-panel {
                > .flex > * {
                    height: 26px;
                }

                input[type=text],
                select {
                    border-color: solid 1px $main-color;
                }
            }

            &.dictionary-list {
                ul {
                    max-height: 200px;
                    overflow-y: scroll;
                    padding-left: 0;
                    list-style: none;
                }
            }
        }
    }
}
</style>
