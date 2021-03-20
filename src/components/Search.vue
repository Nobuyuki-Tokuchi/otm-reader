<template lang="pug">
    .search.d-flex
        v-container(fluid).flex-half
            v-row
                v-col
                    v-text-field(dense, hide-details="auto", label="検索文字列", v-model="searchItem.word", @keydown="searchWhenEnter")
                v-col
                    v-select(dense, hide-details="auto", label="検索対象", v-model="searchItem.searchType", :items="searchTypes")
                v-col
                    v-select(dense, hide-details="auto", label="検索方法", v-model="searchItem.matchType", :items="matchTypes")
                v-col(cols="auto")
                    v-btn(small, block, @click="$emit('search-word', searchItem)") 検索
            v-row
                v-col(cols="auto")
                    v-btn(small, @click="callDialog", data-value="command") コマンドパレット表示
        v-divider(vertical)
        v-container(fluid).flex-half
            v-row
                v-col.pr-1
                    CodeMirrorVue.script(v-model="searchItem.script", @keydown="searchScriptWhenEnter", :height="120")
                v-col.pl-1(cols="auto")
                    .d-flex.flex-column
                        v-btn.my-1(small, elevation="2", @click="$emit('search-script', searchItem)") 検索
                        v-btn.my-1(small, elevation="2", @click="removeText") 削除
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SearchItem, SearchType, MatchType } from '@/libs/search.item';
import CodeMirrorVue from "@/components/CodeMirrorVue.vue";
import DisplayStore from '@/store/modules/display.store';
import { getModule } from 'vuex-module-decorators';

@Component({
    components: {
        CodeMirrorVue,
    }
})
export default class Search extends Vue {
    private readonly searchTypes = [
        { value: SearchType.WORD, text: "単語" },
        { value: SearchType.TRANSLATION, text: "訳語" },
        { value: SearchType.ALL, text: "全文"},
        { value: SearchType.TAG, text: "タグ"},
        { value: SearchType.TRANSLATION_TITLE, text: "訳語タイトル"},
        { value: SearchType.VARIATION_TITLE, text: "変化形タイトル"}
    ];

    private readonly matchTypes = [
        { value: MatchType.FORWARD, text: "前方一致" },
        { value: MatchType.BACKWARD, text: "後方一致" },
        { value: MatchType.PARTIAL, text: "部分一致" },
        { value: MatchType.EXACT, text: "完全一致" },
        { value: MatchType.NOT, text: "除外" },
    ];

    private searchItem: SearchItem;

    constructor() {
        super();

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

    callDialog(event: Event) {
        let target = event.target as HTMLElement | null;
        let option = target?.getAttribute("data-value");

        while(option === null && (target !== null && target !== event.currentTarget)) {
            target = target.parentElement;
            option = target?.getAttribute("data-value");
        }

        switch (option) {
            case "command":
                this.openCommand();
                break;
        }
    }

    private openCommand() {
        const instance = getModule(DisplayStore, this.$store);
        instance.setOpenCommand(true);
    }

    removeText() {
        this.searchItem.script = "";
    }
}
</script>

<style lang="scss" scoped>
.search {
    height: 150px;
}
</style>