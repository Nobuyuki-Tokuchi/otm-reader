<template lang="pug">
    v-card
        v-card-title.secondary.white--text.d-flex.py-2(:id="word.word")
            .font-weight-bold {{ word.word }}
            v-chip.mx-3.py-1.px-2.d-flex(small, label, v-if="showPron") {{ word.pron }}
            div.flex-grow-1.flex-shrink-1
            div.ml-4 {{ word.dictionaryName }}
        v-card-text.px-0
            v-container(fluid)
                v-row
                    v-col(cols=6, v-if="showTrans")
                        v-card
                            v-card-title.py-1.secondary.white--text 訳語
                            v-card-text.pa-2
                                .text-content(v-for="trans in transList")
                                    .multiple-join.black--text {{ trans }}
                    v-col(cols=6, v-if="showExp")
                        v-card
                            v-card-title.py-1.secondary.white--text 内容
                            v-card-text.pa-2
                                .text-content(v-for="exp in expList")
                                    .black--text {{ exp }}
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
.multiple-join + .multiple-join {
    &::before {
        content: ",";
        padding-left: 0px;
        padding-right: 4px;
    }
}

.text-content {
    margin-top: 4px;
    margin-bottom: 4px;

    &:first-child {
        margin-top: 0px;
    }

    &:last-child {
        margin-bottom: 0px;
    }

    > * {
        padding-left: 4px;
        padding-right: 4px;
    }
}

</style>
