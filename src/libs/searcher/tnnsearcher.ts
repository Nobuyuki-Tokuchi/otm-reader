
import { SearchFunction, SearchItem, SearchType, MatchType } from '../search.item';
import { TnnDictionary, TnnWord } from '../dictionary/tnn';

export default class TnnSearcher {
    public static recreate(dict: TnnDictionary): TnnDictionary {
        const searchTags = new Map<number, string>(dict.dictionary.tags.map(x => [x.id, x.name]));
        const searchClasses = new Map<number, string>(dict.dictionary.classes.map(x => [x.id, x.name]));
        const searchTitles= new Map<number, string>(dict.dictionary.titles.map(x => [x.id, x.name]));

        for (const word of dict.words) {
            word.entry.tagNames = word.entry.tags.map(x => searchTags.get(x) ?? "");
            for (const content of word.contents) {
                content.className = searchClasses.get(content.class) ?? "";
                for (const detail of content.detail) {
                    detail.titleName = searchTitles.get(parseInt("" + detail.title)) ?? "";
                }
            }
        }

        return dict;
    }

    public static search(dict: TnnDictionary, searchItem: SearchItem, matchFunc: SearchFunction): TnnWord[] {
        let result: TnnWord[];

        switch (searchItem.searchType) {
            case SearchType.WORD:
                result = dict.words.filter(x => matchFunc(x.entry.form, searchItem.word));
                break;
            case SearchType.TRANSLATION:
                result = dict.words.filter(x => x.contents.some(y => matchFunc(y.trans, searchItem.word)));
                break;
            case SearchType.TAG:
                result = dict.words.filter(x => x.entry.tagNames ? matchFunc(x.entry.tagNames, searchItem.word) : false);
                break;
            case SearchType.TRANSLATION_TITLE:
                result = dict.words.filter(x => x.contents.some(y => y.className ? matchFunc(y.className, searchItem.word) : false));
                break;
            case SearchType.VARIATION_TITLE:
                result = this.getAllOrEmpty(dict, searchItem);
                break;
            case SearchType.ALL:
            default:
                result = dict.words.filter(x => matchFunc(x.entry.form, searchItem.word)
                    || x.contents.some(y => matchFunc(y.trans, searchItem.word)
                        || (y.detail.some(z => matchFunc(z.text, searchItem.word))))
                    );
                break;
        }

        return result;
    }

    private static getAllOrEmpty(dict: TnnDictionary, searchItem: SearchItem): TnnWord[] {
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