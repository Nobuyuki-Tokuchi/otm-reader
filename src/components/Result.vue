<template lang="pug">
    .word-list
        .word(v-for="word in words")
            OtmResult(v-if="word.dictionaryType === 'otm'", :word="word", :hiddenEmptyContents="hiddenEmptyContents")
            PDicResult(v-else-if="word.dictionaryType === 'pdic'", :word="word", :hiddenEmptyContents="hiddenEmptyContents")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Word } from '@/libs/dictionary.manager';
import OtmResult from "./OtmResult.vue";
import PDicResult from "./PDicResult.vue";

@Component({
    components: {
        OtmResult,
        PDicResult,
    }
})
export default class Result extends Vue {
    @Prop() private words!: Word[];
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