import { NtdicWord, NtdicDictionary } from '../dictionary/ntdic';
import { SearchFunction, SearchItem, SearchType } from '../search.item';

export default class NtdicSearcher {
    public static search(dict: NtdicDictionary, searchItem: SearchItem, matchFunc: SearchFunction): NtdicWord[] {
        let result: NtdicWord[]; 
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
                    || x.variations.some(y => matchFunc(y.title, searchItem.word)));
                break;
        }

        return result;
    }

    public static get template(): NtdicWord {
        return {
            dictionaryName: "",
            dictionaryType: "ntdic",
            entry: {
                id: 0,
                form: "",
                pronunciations: [ "" ],
            },
            translations: [
                {
                    title: "",
                    forms: [ "" ]
                }
            ],
            tags: [],
            histories: [
                {
                    datetime: "",
                    text: "",
                }
            ],
            contents: [],
            variations: [],
            relations: [],
        };
    }
    
}