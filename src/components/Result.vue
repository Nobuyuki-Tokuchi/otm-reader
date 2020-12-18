<template lang="pug">
    .word-list
        .word(v-for="word in words")
            OtmResult(v-if="word.dictionaryType === 'otm'", :word="word", :hiddenEmptyContents="hiddenEmptyContents")
            NtdicResult(v-else-if="word.dictionaryType === 'ntdic'", :word="word", :hiddenEmptyContents="hiddenEmptyContents")
            PDicResult(v-else-if="word.dictionaryType === 'pdic'", :word="word", :hiddenEmptyContents="hiddenEmptyContents")
            TnnResult(v-else-if="word.dictionaryType === 'tnn'", :word="word", :hiddenEmptyContents="hiddenEmptyContents")
            div(v-else) 何かミスってる
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BaseWord } from '@/libs/dictionary/dictionary';
import OtmResult from "./OtmResult.vue";
import PDicResult from "./PDicResult.vue";
import TnnResult from "./TnnResult.vue";
import NtdicResult from "./NtdicResult.vue";
import DisplayStore from '@/store/modules/display.store';
import { getModule } from 'vuex-module-decorators';

@Component({
    components: {
        OtmResult,
        PDicResult,
        TnnResult,
        NtdicResult,
    }
})
export default class Result extends Vue {
    @Prop() words!: BaseWord[];

    constructor() {
        super();
    }

    get hiddenEmptyContents(): boolean {
        const instance = getModule(DisplayStore, this.$store);
        return instance.hiddenEmptyContent;
    }
}

</script>
 
 <style lang="scss" scoped>
$main-color: black;
$sub-color: white;

.word {
    box-sizing: border-box;
    border: solid 1px $main-color;
}
 </style>