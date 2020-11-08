import { BaseDictionary, BaseWord } from "./dictionary";

export interface TnnDictionary extends BaseDictionary<TnnWord> {
    dictionary: TnnDictionarySetting;
}

export interface TnnWord extends BaseWord {
    entry: TnnEntry;
    contents: TnnContent[];
}

export interface TnnEntry {
    id: number;
    form: string[];
    pronunciation: string[];
    tags: number[];
    tagNames?: string[];
    char: string[];
}

export interface TnnContent {
    class: number;
    className?: string;
    trans: string[];
    detail: TnnDetail[];
}

export interface TnnDetail {
    title: number;
    titleName?: string;
    text: string;
}

export interface TnnDictionarySetting {
    type: string;
    version: string;
    language: string;
    tags: TnnMaster[];
    classes: TnnMaster[];
    titles: TnnMaster[];
}

export interface TnnMaster {
    id: number;
    name: string;
}
