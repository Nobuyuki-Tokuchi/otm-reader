import { OtmDictionary, OtmWord } from './dictionary/otm'
import { SearchType, MatchType } from './search.enum'
import { SearchItem } from './search.item';
import OtmSearch from './otmsearch/otmsearch';
import { PersonalDictionary, PDicWord } from './dictionary/pdic';

export type Dictionary = OtmDictionary | PersonalDictionary;
export type Word = OtmWord | PDicWord;
type SearchFunction = (target: string | string[], word: string) => boolean;

export class DictionaryManager {
    private dictionaries: Map<string, Dictionary>;

    constructor() {
        this.dictionaries = new Map<string, Dictionary>()
    }

    public set(name: string, dictionary: Dictionary): void {
        for (const word of dictionary.words) {
            word.dictionaryName = dictionary.dictionaryName;
            word.dictionaryType = dictionary.dictionaryType;
        }
        this.dictionaries.set(name, dictionary)
    }

    public get(name: string): Dictionary | undefined {
        return this.dictionaries.get(name)
    }

    public has(name: string): boolean {
        return this.dictionaries.has(name);
    }

    public remove(name: string): boolean {
        return this.dictionaries.delete(name);
    }

    public get dictionaryNames(): string[] {
        return Array.from(this.dictionaries.keys());
    }

    public search(searchItem: SearchItem): Word[] {
        const words: Word[] = [];
        const matchFunc = DictionaryManager.matchFunction.get(searchItem.matchType) ?? (() => false);

        for (const name of searchItem.targetNames) {
            const dict = this.dictionaries.get(name);
            if (dict) {
                let result: Word[];
                if ((searchItem.word === "" || searchItem.word == null) && (searchItem.matchType !== MatchType.EXACT && searchItem.matchType !== MatchType.NOT)) {
                    result = dict.words;
                }
                else if (dict.dictionaryType === "pdic") {
                    result = this.searchPdic(dict as PersonalDictionary, searchItem, matchFunc);
                }
                else {
                    result = this.searchOtm(dict as OtmDictionary, searchItem, matchFunc);
                }
                words.push(...result);
            }
        }
        return words;
    }

    private searchOtm(dict: OtmDictionary, searchItem: SearchItem, matchFunc: SearchFunction): Word[] {
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
                    || x.translations.some(y => matchFunc(y.forms, searchItem.word) || matchFunc(y.title, searchItem.word))
                    || matchFunc(x.tags, searchItem.word)
                    || x.variations.some(y => matchFunc(y.title, searchItem.word)))
                break;
        }

        return result;
    }

    private searchPdic(dict: PersonalDictionary, searchItem: SearchItem, matchFunc: SearchFunction): Word[] {
        let result: PDicWord[]; 
        switch (searchItem.searchType) {
            case SearchType.WORD:
                result = dict.words.filter(x => matchFunc(x.word, searchItem.word));
                break;
            case SearchType.TRANSLATION:
                result = dict.words.filter(x => matchFunc(x.trans, searchItem.word));
                break;
            case SearchType.TAG:
                result = [];
                break;
            case SearchType.TRANSLATION_TITLE:
                result = [];
                break;
            case SearchType.VARIATION_TITLE:
                result = [];
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

    public searchScript(searchItem: SearchItem): Word[] {
        const words: Word[] = [];

        try {
            const searchScript = new OtmSearch(searchItem.script);
            const func = searchScript.compile() as (x: Word) => boolean;
            for (const name of searchItem.targetNames) {
                const dict = this.dictionaries.get(name);
                if (dict) {
                    const result = (dict.words as Word[]).filter(func);
                    result.forEach(x => x.dictionaryName = name);
                    words.push(...result);
                }
            }
        } catch (error) {
            console.log(error);
        }

        return words;
    }

    private static matchFunction = new Map<MatchType, SearchFunction>([
        [
            MatchType.FORWARD,
            (target, word) => Array.isArray(target)
                ? target.some(x => x.startsWith(word))
                : target.startsWith(word)
        ],
        [
            MatchType.BACKWARD,
            (target, word) => Array.isArray(target)
                ? target.some(x => x.endsWith(word))
                : target.endsWith(word)
        ],
        [
            MatchType.PARTIAL,
            (target, word) => Array.isArray(target)
                ? target.some(x => x.indexOf(word) !== -1)
                : target.indexOf(word) !== -1
        ],
        [
            MatchType.EXACT,
            (target, word) => Array.isArray(target)
                ? target.some(x => x === word)
                : target === word
        ],
        [
            MatchType.NOT,
            (target, word) => Array.isArray(target)
                ? target.some(x => x.indexOf(word) === -1)
                : target.indexOf(word) === -1
        ]
    ]);
}
