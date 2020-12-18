<template lang="pug">
    div
        .word-title.flex(:id="word.word")
            label.word-name {{ word.word }}
            span.stretch-space
            span.dictionary-name {{ word.dictionaryName }}
        .word-verbose.flex
            .word-trans-area.half(v-if="showTrans")
                .word-trans.title 訳語
                .word-trans.text
                    div(v-for="trans in transList") {{ trans }}
            .word-exp-area.half(v-if="showExp")
                .word-exp.title 内容
                .word-exp.text
                    div(v-for="exp in expList") {{ exp }}
            .word-pron-area.half(v-if="showPron")
                .word-pron.title 発音
                .word-pron.text {{ word.pron }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { PDicWord } from '@/libs/dictionary/pdic';

@Component
export default class PDicResult extends Vue {
    @Prop() word!: PDicWord;
    @Prop() hiddenEmptyContents!: boolean;

    constructor() {
        super();
    }

    public get transList(): string[] {
        return this.word.trans.replaceAll("\r\n", "\n").split("\n");
    }

    public get expList(): string[] {
        return this.word.exp.replaceAll("\r\n", "\n").split("\n");
    }

    public get showTrans(): boolean {
        return !this.hiddenEmptyContents || this.word.trans.length > 0;
    }

    public get showExp(): boolean {
        return !this.hiddenEmptyContents || this.word.exp.length > 0;
    }

    public get showPron(): boolean {
        return !this.hiddenEmptyContents || this.word.pron.length > 0;
    }
}
</script>

 <style lang="scss" scoped>
$main-color: black;
$sub-color: white;

.word-title {
    color: $sub-color;
    background-color: $main-color;
    padding-top: 3px;
    padding-bottom: 3px;

    .word-name,
    .word-tag,
    .dictionary-name {
        padding-top: 3px;
        padding-bottom: 3px;
        padding-left: 8px;
        padding-right: 8px;
    }

    .word-name {
        font-weight: bold;
    }

    .word-tag {
        margin-left: 2px;
        margin-right: 2px;
        color: $main-color;
        background-color: $sub-color;
    }
}

.word-verbose {
    flex-wrap: wrap;

    .half {
        box-sizing: border-box;
        flex-basis: 50%;
        flex-shrink: 0;
        flex-grow: 0;
    }

    @each $name in trans, exp, pron {
        .word-#{$name}-area {
            padding: 2px;

            .word-#{$name} {
                border-bottom: solid 1px $main-color;
                border-left: solid 1px $main-color;
                border-right: solid 1px $main-color;
                box-sizing: border-box;

                &.title,
                &.text {
                    padding-top: 3px;
                    padding-bottom: 3px;
                    padding-left: 5px;
                    padding-right: 5px;
                }

                &.title {
                    border-top : solid 1px $main-color
                }

                .word-#{$name}-title {
                    flex-grow: 0;
                    flex-shrink: 0;
                    border-right: solid 1px $main-color;
                }
            }
        }
    }
}
 </style>