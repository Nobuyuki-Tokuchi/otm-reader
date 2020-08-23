<template lang="pug">
    div(data-dictionary-type="tnn")
        .word-title.flex(:id="word.entry.id")
            label.word-name(v-for="form in word.entry.form") {{ form }}
            span.word-pronunciation(v-for="pronunciation in word.entry.pronunciation") {{ pronunciation }}
            span.stretch-space
            span.word-tag(v-for="tag in word.entry.tagNames") {{ tag }}
            span.dictionary-name {{ word.dictionaryName }}
        .word-verbose
            .word-contents
                .word-content-title 内容
                .flex
                    .word-content.half(v-for="content in contents")
                        .word-content-translation.flex
                            .word-content-class {{ content.className }}
                            .word-content-trans.flex
                                .word-content-trans-text(v-for="translation in content.translations") {{ translation }}
                        .word-content-detail.flex(v-for="detail in content.details")
                            .word-content-detail-title {{ detail.titleName }}
                            .word-content-detail-text
                                div(v-for="text in detail.text") {{ text }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TnnWord } from '@/libs/dictionary/tnn';

@Component
export default class TnnResult extends Vue {
    @Prop() private word!: TnnWord;

    constructor() {
        super();
    }

    public get contents() {
        return this.word.contents.map(x => {
            return {
                className: x.className,
                translations: x.trans,
                details: x.detail.map(y => {
                    return {
                        titleName: y.titleName,
                        text: y.text.split("\n"),
                    };
                }),
            };
        });
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
    .word-pronunciation,
    .dictionary-name {
        padding-top: 3px;
        padding-bottom: 3px;
        padding-left: 8px;
        padding-right: 8px;
    }

    .word-name {
        font-weight: bold;
    }

    .word-tag,
    .word-pronunciation {
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

    .word-contents {
        .word-content-title,
        .word-content-class,
        .word-content-trans,
        .word-content-detail-title,
        .word-content-detail-text {
            padding-top: 3px;
            padding-bottom: 3px;
            padding-left: 5px;
            padding-right: 5px;
        }

        .word-content-title {
            flex-grow: 1;
            margin: 2px;
            border: solid 1px $main-color;
        }

        .word-content {
            padding: 2px;

            .word-content-translation,
            .word-content-detail {
                border: solid 1px $main-color;

                &:not(:first-child) {
                    border-top: 0px;
                }

                .word-content-class,
                .word-content-detail-title {
                    border-right: solid 1px $main-color;
                }
            }
            
            .word-content-trans-text {
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
    }
}
 </style>