import { SearchType, MatchType } from './search.enum';

export interface SearchItem {
    word: string;
    searchType: SearchType;
    matchType: MatchType;
    script: string;
    targetNames: string[];
}
