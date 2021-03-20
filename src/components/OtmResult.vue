<template lang="pug">
    v-card
        v-card-title.secondary.white--text.d-flex.py-2(:id="word.entry.id")
            .font-weight-bold {{ word.entry.form }}
            div.flex-grow-1.flex-shrink-1
            v-chip.mx-1(label, v-for="(tag, i) in word.tags", :key="i") {{ tag }}
            div.ml-4 {{ word.dictionaryName }}
        v-card-text.px-0
            v-container(fluid)
                v-row
                    v-col(cols=6, v-if="showTranslation")
                        v-card
                            v-card-title.py-1.secondary.white--text 訳語
                            v-card-text.pa-2
                                .text-content.d-flex(v-for="translation in word.translations")
                                    .secondary.white--text.flex-shrink-0 {{ translation.title }}
                                    .flex-grow-1.d-flex
                                        .multiple-join.black--text(v-for="form in translation.forms") {{ form }}
                    v-col(cols=6, v-if="showContent")
                        v-card
                            v-card-title.py-1.secondary.white--text 内容
                            v-card-text.pa-2
                                .text-content.d-flex(v-for="content in contents")
                                    .secondary.white--text.flex-shrink-0(v-if="content.title !== ''") {{ content.title }}
                                    .flex-grow-1
                                        .black--text(v-for="text in content.textList") {{ text }}
                    v-col(cols=6, v-if="showVariation")
                        v-card
                            v-card-title.py-1.secondary.white--text 変化形
                            v-card-text.pa-2
                                .text-content.d-flex(v-for="variation in word.variations")
                                    .secondary.white--text.flex-shrink-0.flex-shrink-0(v-if="variation.title !== ''") {{ variation.title }}
                                    .black--text.flex-grow-1 {{ variation.form }}
                    v-col(cols=6, v-if="showRelation")
                        v-card
                            v-card-title.py-1.secondary.white--text 関連語
                            v-card-text.pa-2
                                .text-content.d-flex(v-for="relation in word.relations")
                                    .secondary.white--text.flex-shrink-0.flex-shrink-0(v-if="relation.title !== ''") {{ relation.title }}
                                    .black--text.flex-grow-1 {{ relation.entry.form }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { OtmWord } from '@/libs/dictionary/otm';

@Component
export default class OtmResult extends Vue {
    @Prop() word!: OtmWord;
    @Prop() hiddenEmptyContents!: boolean;

    constructor() {
        super();
    }

    public get contents(): { title: string; textList: string[] }[] {
        return this.word.contents.map(x => {
            return {
                title: x.title,
                textList: x.text.split("\n")
            };
        });
    }

    public get showTranslation(): boolean {
        return !this.hiddenEmptyContents || this.word.translations.length > 0;
    }

    public get showContent(): boolean {
        return !this.hiddenEmptyContents || this.word.contents.length > 0;
    }

    public get showVariation(): boolean {
        return !this.hiddenEmptyContents || this.word.variations.length > 0;
    }

    public get showRelation(): boolean {
        return !this.hiddenEmptyContents || this.word.relations.length > 0;
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
        border-width: 1px 0px;
        border-style: solid;
    }
    > :first-child {
        padding-left: 8px;
        padding-right: 8px;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }
    > :last-child {
        border-right-width: 1px;
    }
}

.translation-attribute {
    &.obsolete::before,
    &.slang::before {
        font-weight: bold;
        border: 1px solid black;
    }

    &:first-child {
        margin-right: 0;
    }
    &:last-child {
        margin-left: 0;
    }
}

</style>
