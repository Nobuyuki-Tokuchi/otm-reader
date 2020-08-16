import { BaseDictionary, BaseWord } from "./dictionary";

export interface OtmDictionary extends BaseDictionary {
    words: OtmWord[];
}

export interface OtmWord extends BaseWord {
    entry: OtmEntry;
    translations: OtmTranslation[];
    tags: string[];
    contents: OtmContent[];
    variations: OtmVariation[];
    relations: OtmRelation[];
}

export interface OtmEntry {
    id: number;
    form: string;
}

export interface OtmTranslation {
    title: string;
    forms: string[];
}

export interface OtmContent {
    title: string;
    text: string;
}

export interface OtmRelation {
    title: string;
    entry: OtmEntry;
}

export interface OtmVariation {
    title: string;
    form: string;
}
