<template lang="pug">
    v-sheet(width="100%")
        .my-2.word(v-for="word in displayWords")
            OtmResult(v-if="word.dictionaryType === 'otm'", :word="word", :hiddenEmptyContents="hiddenEmptyContents", :updateWord="updateWord")
            NtdicResult(v-else-if="word.dictionaryType === 'ntdic'", :word="word", :hiddenEmptyContents="hiddenEmptyContents", :updateWord="updateWord")
            PDicResult(v-else-if="word.dictionaryType === 'pdic'", :word="word", :hiddenEmptyContents="hiddenEmptyContents", :updateWord="updateWord")
            TnnResult(v-else-if="word.dictionaryType === 'tnn'", :word="word", :hiddenEmptyContents="hiddenEmptyContents", :updateWord="updateWord")
            div(v-else) 何かミスってる
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BaseWord } from '@/libs/dictionary/dictionary';
import DisplayStore from '@/store/modules/display.store';
import OtmResult from "./OtmResult.vue";
import PDicResult from "./PDicResult.vue";
import NtdicResult from "./NtdicResult.vue";
import { getModule } from 'vuex-module-decorators';

@Component({
    model: {
        prop: "pageCount",
        event: "input",
    },
    components: {
        OtmResult,
        PDicResult,
        NtdicResult,
    },
})
export default class Viewer extends Vue {
    @Prop() updateWord!: (word?: BaseWord) => void;
    @Prop() result!: BaseWord[];
    @Prop() listingCount!: number;
    @Prop() pageCount!: number;

    constructor() {
        super();
    }

    public get count(): number {
        return this.result.length;
    }

    public get displayWords (): BaseWord[] {
        const pageCount = this.pageCount;
        const listingCount = this.listingCount;
        const start = (pageCount - 1) * listingCount;
        const end = start + listingCount;

        return this.result.filter((x: BaseWord, index: number) => index >= start && index < end);
    }

    public getPageCount(value: number) {
        this.$emit('input', value);
    }
    
    get hiddenEmptyContents(): boolean {
        const instance = getModule(DisplayStore, this.$store);
        return instance.hiddenEmptyContent;
    }
}

</script>
