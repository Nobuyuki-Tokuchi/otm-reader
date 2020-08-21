import { PersonalDictionary, PDicWord } from '../dictionary/pdic';
import { SearchFunction, SearchItem, SearchType, MatchType } from '../search.item';

export default class PDicSearcher {
    public static search(dict: PersonalDictionary, searchItem: SearchItem, matchFunc: SearchFunction): PDicWord[] {
        let result: PDicWord[]; 
        switch (searchItem.searchType) {
            case SearchType.WORD:
                result = dict.words.filter(x => matchFunc(x.word, searchItem.word));
                break;
            case SearchType.TRANSLATION:
                result = dict.words.filter(x => matchFunc(x.trans, searchItem.word));
                break;
            case SearchType.TAG:
            case SearchType.TRANSLATION_TITLE:
            case SearchType.VARIATION_TITLE:
                result = this.getAllOrEmpty(dict, searchItem);
                break;
            case SearchType.ALL:
            default:
                result = dict.words.filter(x => matchFunc(x.word, searchItem.word)
                    || matchFunc(x.trans, searchItem.word)
                    || matchFunc(x.exp, searchItem.word));
                break;
        }

        return result;
    }

    private static getAllOrEmpty(dict: PersonalDictionary, searchItem: SearchItem): PDicWord[] {
        const emptyWord = searchItem.word === "" || searchItem.word == null;
        const isNotExact = searchItem.matchType !== MatchType.EXACT && searchItem.matchType !== MatchType.NOT

        if (emptyWord && isNotExact) {
            return dict.words;
        }
        else {
            return [];
        }
    }
}