import { OtmWord, OtmDictionary } from '../dictionary/otm';
import { SearchFunction, SearchItem, SearchType } from '../search.item';

export default class OtmSearcher {
    public static search(dict: OtmDictionary, searchItem: SearchItem, matchFunc: SearchFunction): OtmWord[] {
        let result: OtmWord[]; 
        switch (searchItem.searchType) {
            case SearchType.WORD:
                result = dict.words.filter(x => matchFunc(x.entry.form, searchItem.word));
                break;
            case SearchType.TRANSLATION:
                result = dict.words.filter(x => x.translations.some(y => matchFunc(y.forms, searchItem.word)));
                break;
            case SearchType.TAG:
                result = dict.words.filter(x => matchFunc(x.tags, searchItem.word));
                break;
            case SearchType.TRANSLATION_TITLE:
                result = dict.words.filter(x => x.translations.some(y => matchFunc(y.title, searchItem.word)));
                break;
            case SearchType.VARIATION_TITLE:
                result = dict.words.filter(x => x.variations.some(y => matchFunc(y.title, searchItem.word)));
                break;
            case SearchType.ALL:
            default:
                result = dict.words.filter(x => matchFunc(x.entry.form, searchItem.word)
                    || x.translations.some(y => matchFunc(y.forms, searchItem.word))
                    || matchFunc(x.tags, searchItem.word)
                    || x.contents.some(y => matchFunc(y.text, searchItem.word))
                    || x.variations.some(y => matchFunc(y.title, searchItem.word)))
                break;
        }

        return result;
    }
}