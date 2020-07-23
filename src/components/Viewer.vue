<template lang="pug">
    .add-space
        Search(v-on:search-word="search", v-on:search-script="searchScript" :dictionaries="dictionaries")
        div.px-10px
            span 件数：
            span {{ count }}
        Result(:words="result",)
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Search from './Search.vue';
import Result from "./Result.vue";
import { DictionaryManager } from '../libs/dictionary.manager';
import { SearchType, MatchType } from '../libs/search.enum';
import { SearchItem } from '../libs/search.item';
import { OtmWord } from '../libs/otm';

@Component({
    components: {
         Search,
         Result
    },
    computed: {
        count: function (): number {
            return this.$data["result"].length;
        }
    }
})
export default class Viewer extends Vue {
    @Prop() private dictionaries!: DictionaryManager;
    private result: OtmWord[];

    constructor() {
        super();
        this.result = [];
    }

    search(searchItem: SearchItem): void {
        this.result = this.dictionaries.search(searchItem).sort((x, y) => {
            if (x.entry.form < y.entry.form) {
                return -1;
            }
            else if (x.entry.form > y.entry.form) {
                return 1;
            }
            else {
                return 0;
            }
        });
    }

    searchScript(searchItem: SearchItem): void {
        this.result = this.dictionaries.searchScript(searchItem).sort((x, y) => {
            if (x.entry.form < y.entry.form) {
                return -1;
            }
            else if (x.entry.form > y.entry.form) {
                return 1;
            }
            else {
                return 0;
            }
        });
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
}
</style>