export interface BaseDictionary<T extends BaseWord = BaseWord> {
    dictionaryName?: string;
    dictionaryType?: string;
    words: T[];
}

export interface BaseWord {
    dictionaryName?: string;
    dictionaryType?: string;
}