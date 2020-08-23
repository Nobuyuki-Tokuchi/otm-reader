<template lang="pug">
    .word-list
        .word(v-for="word in words")
            OtmResult(v-if="word.dictionaryType === 'otm'", :word="word", :hiddenEmptyContents="hiddenEmptyContents")
            PDicResult(v-else-if="word.dictionaryType === 'pdic'", :word="word", :hiddenEmptyContents="hiddenEmptyContents")
            TnnResult(v-else-if="word.dictionaryType === 'tnn'", :word="word", :hiddenEmptyContents="hiddenEmptyContents")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BaseWord } from '@/libs/dictionary/dictionary';
import OtmResult from "./OtmResult.vue";
import PDicResult from "./PDicResult.vue";
import TnnResult from "./TnnResult.vue";

@Component({
    components: {
        OtmResult,
        PDicResult,
        TnnResult,
    }
})
export default class Result extends Vue {
    @Prop() private words!: BaseWord[];
    @Prop() private hiddenEmptyContents!: boolean;

    constructor() {
        super();
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