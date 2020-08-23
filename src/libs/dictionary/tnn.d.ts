export interface TnnDictionary {
    dictionaryName?: string;
    words: TnnWord[];
    dictionary: TnnDictionarySetting;
}

export interface TnnWord {
    dictionaryName?: string;
    dictionaryType?: string;
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
