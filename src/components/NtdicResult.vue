<template lang="pug">
    div
        .word-title.flex(:id="word.entry.id")
            label.word-name {{ word.entry.form }}
            span.word-pronunciations(v-if="showPronunciations")
                span(v-for="pronunciation in word.entry.pronunciations") {{ pronunciation }}
            span.stretch-space
            span(v-if="showTags")
                span.word-tag(v-for="tag in word.tags") {{ tag }}
            span.dictionary-name {{ word.dictionaryName }}
        .word-verbose.flex
            .word-translations.half(v-if="showTranslation")
                .word-translation.title 訳語
                .word-translation.flex(v-for="translation in word.translations")
                    .word-translation-title {{ translation.title }}
                    .flex
                        .word-translation-attribute.obsolete(v-if="translation.obsolete")
                        .word-translation-attribute.slang(v-if="translation.slang")
                    .word-translation-pattern(v-if="translation.pattern") {{ translation.pattern }}
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
            .word-histories.half
                .word-history.title.flex(v-if="hasOnlyHistoryOrNone")
                    span 履歴
                .word-history.title.flex(v-else, @click="toggleHistory")
                    span(:class="{ 'only-new': !showHistory }") 履歴
                    span.stretch-space
                    span.toggle(:class="{ open: openHistory }")
                div()
                    .word-history.flex(v-for="history in histories", :class="{ 'show-last-history': !showHistory }")
                        .word-history-title {{ history.datetime }}
                        .word-history-text {{ history.text }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NtdicWord } from '@/libs/dictionary/ntdic';
import { BaseWord } from '@/libs/dictionary/dictionary';

@Component
export default class NtdicResult extends Vue {
    @Prop() private word!: NtdicWord;
    @Prop() private hiddenEmptyContents!: boolean;
    @Prop() private updateWord!: (word: BaseWord) => void;

    private openHistory: boolean;

    constructor() {
        super();

        this.openHistory = false;
    }

    public get contents(): { title: string; textList: string[] }[] {
        return this.word.contents.map(x => {
            return {
                title: x.title,
                textList: x.text.split("\n")
            };
        });
    }

    public get hasOnlyHistoryOrNone(): boolean {
        return this.word.histories.length <= 1;
    }

    public get histories(): { datetime: string; text: string }[] {
        return this.word.histories.map(x => {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(x.datetime)) {
                return {
                    datetime: new Date(x.datetime).toLocaleDateString(undefined, NtdicResult._dateFormatOption),
                    text: x.text
                };
            }
            else if (/^\d{4}-\d{2}-\d{2}$/.test(x.datetime)) {
                const datetime = x.datetime.split('-');
                return {
                    datetime: datetime[0] + "/" + datetime[1] + "/" + datetime[2],
                    text: x.text
                };
            }
            else {
                return {
                    datetime: x.datetime,
                    text: x.text
                };
            }
        });
    }

    public get showPronunciations(): boolean {
        return (this.word.entry.pronunciations?.length ?? 0) > 0;
    }

    public get showTags(): boolean {
        return this.word.tags.length > 0;
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

    public get showHistory(): boolean {
        return this.openHistory && this.word.histories.length > 0;
    }

    public editWord() {
        this.updateWord(this.word);
    }

    public toggleHistory() {
        if (!this.hasOnlyHistoryOrNone) {
            this.openHistory = !this.openHistory;
        }
    }

    private static readonly _dateFormatOption = { year: "numeric", month: "2-digit", day: "2-digit" };
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
    .word-pronunciations,
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
    .word-pronunciations {
        color: $main-color;
        background-color: $sub-color;
    }

    .word-tag {
        margin-left: 2px;
        margin-right: 2px;
    }

    .word-pronunciations {
        margin-left: 10px;
        font-size: 0.875rem;
        padding-top: 0;
        padding-bottom: 0;
        margin-top: 2px;
        margin-bottom: 2px;
        
        span::after {
            content: ",";
            margin-right: 4px;
        }
        span:last-child::after {
            content: initial;
            margin-right: 0px;
        }
    }
}

.word-verbose {
    flex-wrap: wrap;

    .half {
        box-sizing: border-box;
        flex-shrink: 0;
        flex-grow: 0;
    }

    @each $name in translation, content, variation, relation, history {
        $names: #{$name}s;
        @if $name == history {
            $names: histories;
        }
        .word-#{$names} {
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

    .word-translations {
        .word-translation-pattern,
        .word-translation-attribute {
            padding-top: 3px;
            padding-bottom: 3px;
            font-size: 0.875rem;
            margin-top: 0.125rem;
        }

        .word-translation-pattern {
            &::before {
                content: "(";
                margin-left: 2px;
            }
            &::after {
                content: ")";
                margin-right: 2px;
            }
        }

        .word-translation-attribute {
            &.obsolete::before,
            &.slang::before {
                font-weight: bold;
                margin-left: 1px;
                margin-right: 1px;
                padding-left: 2px;
                padding-right: 2px;
                border: 1px solid black;
                border-radius: 25%;
            }

            &.obsolete::before {
                content: "廃";
            }
            
            &.slang::before {
                content: "俗";
            }

            &:first-child {
                margin-right: 0;
            }
            &:last-child {
                margin-left: 0;
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

    .only-new::after {
        content: "(最新)";
        margin-left: 2px;
    }

    .show-last-history:not(:last-child) {
        display: none;
    }

    .toggle {
        $margin-vertical: calc(0.625rem);

        display: inline-block;
        box-sizing: border-box;
        border: 0.5rem solid transparent;
        border-top-color: black;
        margin-top: $margin-vertical;
        margin-bottom: 0;

        &.open {
            margin-top: 0;
            margin-bottom: $margin-vertical;
            border-top-color: transparent;
            border-bottom-color: black;
        }
    }
}
 </style>