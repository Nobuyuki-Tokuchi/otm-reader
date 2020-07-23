<template lang="pug">
    .word-list
        .word(v-for="word in words")
            .word-title.flex(v-bind:id="word.entry.id")
                label.word-name {{ word.entry.form }}
                span.word-tag(v-for="tag in word.tags") {{ tag }}
                span.dictionary-name {{ word.dictionaryName }}
            .word-verbose.flex
                .word-translations.half
                    .word-translation.title 訳語
                    .word-translation.flex(v-for="translation in word.translations")
                        .word-translation-title {{ translation.title }}
                        .word-translation-text {{ translation.forms.join(",") }}
                .word-contents.half
                    .word-content.title 内容
                    .word-content.flex(v-for="content in word.contents")
                        .word-content-title {{ content.title }}
                        .word-content-text {{ content.text }}
                .word-variations.half
                    .word-variation.title 変化形
                    .word-variation.flex(v-for="variation in word.variations")
                        .word-variation-title {{ variation.title }}
                        .word-variation-text {{ variation.form }}
                .word-relations.half
                    .word-relation.title 関連語
                    .word-relation.flex(v-for="relation in word.relations")
                        .word-relation-title {{ relation.title }}
                        .word-relation-text {{ relation.entry.form }}

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { OtmWord } from '../libs/otm';


@Component
export default class Result extends Vue {
    @Prop() private words!: OtmWord[];

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

        .dictionary-name {
            flex-grow: 1;
            text-align: right;
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
    }
}
 </style>