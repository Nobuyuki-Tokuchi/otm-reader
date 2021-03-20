<template lang="pug">
    v-card
        v-card-title.secondary.white--text.d-flex.py-2(:id="word.entry.id")
            .font-weight-bold {{ word.entry.form }}
            v-chip.mx-3.py-1.px-2.d-flex(small, label, v-if="showPronunciations")
                span.multiple-join(v-for="pronunciation in word.entry.pronunciations") {{ pronunciation }}
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
                                    .translation-attribute.black--text.obsolete(v-if="translation.obsolete")
                                    .translation-attribute.black--text.slang(v-if="translation.slang")
                                    .translation-attribute.black--text.pattern(v-if="translation.pattern") {{ translation.pattern }}
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
                    v-col(cols=6)
                        v-card
                            v-card-title.py-1.secondary.white--text
                                div(v-if="hasOnlyHistoryOrNone") 履歴
                                .d-flex.flex-grow-1(v-else, @click="toggleHistory")
                                    div(:class="{ 'only-new': !showHistory }") 履歴
                                    .flex-grow-1.flex-shrink-1
                                    .toggle(:class="{ open: openHistory }")
                            v-card-text.pa-2
                                .text-content.histories(v-for="history in histories", :class="{ 'show-last-history': !showHistory }")
                                    .secondary.white--text.flex-grow-0.flex-shrink-0 {{ history.datetime }}
                                    .black--text.flex-grow-1 {{ history.text }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NtdicWord } from '@/libs/dictionary/ntdic';

@Component
export default class NtdicResult extends Vue {
    @Prop() word!: NtdicWord;
    @Prop() hiddenEmptyContents!: boolean;

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
            let year: string;
            let month: string;
            let date: string;

            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(x.datetime)) {
                const datetime = new Date(x.datetime);
                year = datetime.getFullYear().toString();
                month = (datetime.getMonth() + 1).toString().padStart(2, "0");
                date = datetime.getDate().toString().padStart(2, "0");
            }
            else if (/^\d{4}-\d{2}-\d{2}$/.test(x.datetime)) {
                year = x.datetime.substring(0, 4);
                month = x.datetime.substring(6, 8);
                date = x.datetime.substring(9) + "?";
            }
            else if (/^(\d{4}-\d{2}-\?\?)|(\d{4}-\d{2})$/.test(x.datetime)) {
                year = x.datetime.substring(0, 4);
                month = x.datetime.substring(6, 8);
                date = "??";
            }
            else if (/^(\d{4}-\?\?-\?\?)|(\d{4}-\?\?)|(\d{4})$/.test(x.datetime)) {
                year = x.datetime.substring(0, 4);
                month = "??";
                date = "??";
            }
            else {
                year = "????";
                month = "??";
                date = "??";
            }

            return {
                datetime: year + "-" + month + "-" + date,
                text: x.text,
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

    public toggleHistory() {
        if (!this.hasOnlyHistoryOrNone) {
            this.openHistory = !this.openHistory;
        }
    }

    private static readonly _dateFormatOption: Record<string, string> = { dateStyle: "long" };
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

    &.obsolete::before {
        content: "廃";
    }
    
    &.slang::before {
        content: "俗";
    }

    &.pattern {
        &::before {
            content: "(";
        }
        &::after {
            content: ")";
        }   
    }

    &:first-child {
        margin-right: 0;
    }
    &:last-child {
        margin-left: 0;
    }
}

.only-new::after {
    content: "(最新)";
    margin-left: 2px;
}

.histories {
    display: flex;
    &.show-last-history:not(:last-child) {
        display: none;
    }
    &.show-last-history:last-child {
        margin-top: 0px;
    }
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
</style>
