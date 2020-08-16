<template lang="pug">
    .add-space
        Search(@search-word="search", @search-script="searchScript", :dictionaries="dictionaries", v-model="hiddenEmptyContents")
        .flex.between
            .flex.grow
                button(@click="firstPage") 最初へ
                button(@click="prevPage") 前へ
                input(type="number", v-model.number="pageCount", min="1", :max="maxPageCount")
                button(@click="nextPage") 次へ
                button(@click="lastPage") 最後へ
            .flex.text-right
                .px-10px
                    span {{ pageCount }} / {{ maxPageCount }}
                .px-10px
                    span 件数：
                    span {{ count }}
        Result(:words="displayWords", :hiddenEmptyContents="hiddenEmptyContents")
        hr(v-if="count > 0")
        .flex.between(v-if="count > 0")
            .flex.grow
                button(@click="firstPage") 最初へ
                button(@click="prevPage") 前へ
                span {{ pageCount }}
                button(@click="nextPage") 次へ
                button(@click="lastPage") 最後へ
            .flex.text-right
                .px-10px
                    span {{ pageCount }} / {{ maxPageCount }}
                .px-10px
                    span 件数：
                    span {{ count }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Search from './Search.vue';
import Result from "./Result.vue";
import { DictionaryManager, Word } from '@/libs/dictionary.manager';
import { SearchItem } from '@/libs/search.item';
import { PDicWord } from '@/libs/dictionary/pdic';
import { OtmWord } from '@/libs/dictionary/otm';

@Component({
    components: {
         Search,
         Result
    },
})
export default class Viewer extends Vue {
    @Prop() private dictionaries!: DictionaryManager;

    private result: Word[];
    private listingCount: number;
    private pageCount: number;
    private maxPageCount: number;
    private hiddenEmptyContents: boolean;

    constructor() {
        super();
        this.result = [];
        this.listingCount = 16;
        this.pageCount = 1;
        this.maxPageCount = 1;
        this.hiddenEmptyContents = false;
    }
    
    public get count(): number {
        return this.result.length;
    }

    public get displayWords (): Word[] {
        const pageCount = this.pageCount;
        const listingCount = this.listingCount;
        const start = (pageCount - 1) * listingCount;
        const end = start + listingCount;

        return this.result.filter((x: Word, index: number) => index >= start && index < end);
    }

    search(searchItem: SearchItem): void {
        this.result = this.dictionaries.search(searchItem).sort((x, y) => {
            const xWord = Viewer.getWord(x);
            const yWord = Viewer.getWord(y);
            if (xWord < yWord) {
                return -1;
            }
            else if (xWord > yWord) {
                return 1;
            }
            else {
                return 0;
            }
        });
        this.maxPageCount = Math.ceil(this.result.length / this.listingCount); 
        this.firstPage();
    }

    searchScript(searchItem: SearchItem): void {
        this.result = this.dictionaries.searchScript(searchItem).sort((x, y) => {
            const xWord = Viewer.getWord(x);
            const yWord = Viewer.getWord(y);
            if (xWord < yWord) {
                return -1;
            }
            else if (xWord > yWord) {
                return 1;
            }
            else {
                return 0;
            }
        });
        this.maxPageCount = Math.ceil(this.result.length / this.listingCount);
        this.firstPage();
    }

    private static getWord(x: Word): string {
        if (x.dictionaryType === "pdic") {
            return (x as PDicWord).word;
        }
        else {
            return (x as OtmWord).entry.form;
        }
    }

    firstPage(): void {
        this.pageCount = 1;
        this.scrollPageTop();
    }

    nextPage(): void {
        const toPage = this.pageCount + 1;
        if (toPage < this.maxPageCount) {
            this.pageCount = toPage;
            this.scrollPageTop();
        }
        else {
            this.lastPage();
        }
    }
    
    prevPage(): void {
        const toPage = this.pageCount - 1;
        if (toPage > 0) {
            this.pageCount = toPage;
            
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            })
        }
        else {
            this.scrollPageTop();
        }
    }

    lastPage(): void {
        this.pageCount = this.maxPageCount;
        this.scrollPageTop();
    }

    private scrollPageTop(): void {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }
}

</script>

<style lang="scss" scoped>
.add-space {
    > * {
        margin-top: 5px;
        margin-bottom: 5px;
    }

    .px-10px {
        padding-left: 10px;
        padding-right: 10px;
    }

    .text-right {
        text-align: right;
    }

    button {
        margin-left: 5px;
        margin-right: 5px;
    }
}
</style>