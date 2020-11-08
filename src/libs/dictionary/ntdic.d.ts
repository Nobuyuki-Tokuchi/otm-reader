import { BaseDictionary, BaseWord } from "./dictionary";

export interface NtdicDictionary extends BaseDictionary<NtdicWord> {
    settings: NtdicSettings;
}

export interface NtdicWord extends BaseWord {
    entry: NtdicEntry;
    translations: NtdicTranslation[];
    tags: string[];
    histories: NtdicHistory[];
    contents: NtdicContent[];
    variations: NtdicVariation[];
    relations: NtdicRelation[];
}

export interface NtdicEntry {
    id: number;
    form: string;
    pronunciations?: string[];
}

export interface NtdicTranslation {
    title: string;
    pattern?: string;
    obsolete?: boolean;
    slang?: boolean; 
    forms: string[];
}

export interface NtdicHistory {
    datetime: string;
    text: string;
}

export interface NtdicContent {
    title: string;
    text: string;
}

export interface NtdicRelation {
    title: string;
    entry: NtdicEntry;
}

export interface NtdicVariation {
    title: string;
    form: string;
}

export interface NtdicSettings {
    order?: string;
    language: string;
    type: string;
}
