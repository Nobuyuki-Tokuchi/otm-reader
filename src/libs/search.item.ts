
export type SearchFunction = (target: string | string[], word: string) => boolean;

export interface SearchItem {
    word: string;
    searchType: SearchType;
    matchType: MatchType;
    script: string;
    targetNames: string[];
}

export enum SearchType {
    WORD,
    TRANSLATION,
    ALL,
    TAG,
    TRANSLATION_TITLE,
    VARIATION_TITLE,
}

export enum MatchType {
    FORWARD,
    BACKWARD,
    PARTIAL,
    EXACT,
    NOT,
}
