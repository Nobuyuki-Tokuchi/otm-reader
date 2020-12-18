<template lang="pug">
    div
        .word-title.flex(:id="word.entry.id")
            label.word-name {{ word.entry.form }}
            .stretch-space
            .word-tag(v-for="tag in word.tags") {{ tag }}
            .dictionary-name {{ word.dictionaryName }}
        .word-verbose.flex
            .word-translations.half(v-if="showTranslation")
                .word-translation.title 訳語
                .word-translation.flex(v-for="translation in word.translations")
                    .word-translation-title {{ translation.title }}
                    .word-translation-text
                        span.word-translation-form(v-for="form in translation.forms") {{ form }}
            .word-contents.half(v-if="showContent")
                .word-content.title 内容
                .word-content.flex(v-for="content in contents")
                    .word-content-title(v-if="content.title !== ''") {{ content.title }}
                    .word-content-text
                        div(v-for="text in content.textList") {{ text }}
            .word-variations.half(v-if="showVariation")
                .word-variation.title 変化形
                .word-variation.flex(v-for="variation in word.variations")
                    .word-variation-title(v-if="variation.title !== ''") {{ variation.title }}
                    .word-variation-text {{ variation.form }}
            .word-relations.half(v-if="showRelation")
                .word-relation.title 関連語
                .word-relation.flex(v-for="relation in word.relations")
                    .word-relation-title(v-if="relation.title !== ''") {{ relation.title }}
                    .word-relation-text {{ relation.entry.form }}
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
        flex-shrink: 0;
        flex-grow: 0;
    }

    @each $name in translation, content, variation, relation {
        .word-#{$name}s {
            padding: 2px;

            .word-#{$name} {
                border-bottom: solid 1px $main-color;
                border-left: solid 1px $main-color;
                border-right: solid 1px $main-color;
                box-sizing: border-box;

                &.title,
                .word-#{$name}-title,
                .word-#{$name}-text {
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

    .word-translation-form {
        &::after {
            content: ",";
            margin-right: 5px;
        }
        &:last-child::after {
            content: initial;
            margin-right: 0px;
        }
    }
}
 </style>