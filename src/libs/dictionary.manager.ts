import { OtmDictionary, OtmWord } from './otm'
import { SearchType, MatchType } from './search.enum'
import { SearchItem } from './search.item';
import OtmSearch from './otmsearch';

export class DictionaryManager {
    private dictionaries: Map<string, OtmDictionary>;

    constructor() {
        this.dictionaries = new Map<string, OtmDictionary>()
    }

    public set(name: string, dictionary: OtmDictionary): void {
        this.dictionaries.set(name, dictionary)
    }

    public get(name: string): OtmDictionary | undefined {
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

    public search(searchItem: SearchItem): OtmWord[] {
        const words: OtmWord[] = [];
        const matchFunc = DictionaryManager.matchFunction.get(searchItem.matchType) ?? (() => false);

        for (const name of searchItem.targetNames) {
            const dict = this.dictionaries.get(name);
            if (dict) {
                let result: OtmWord[];
                if ((searchItem.word === "" || searchItem.word == null) && (searchItem.matchType !== MatchType.EXACT && searchItem.matchType !== MatchType.NOT)) {
                    result = dict.words;
                }
                else {
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
                }
                result.forEach(x => x.dictionaryName = name);
                words.push(...result);
            }
        }
        return words;
    }

    public searchScript(searchItem: SearchItem): OtmWord[] {
        const words: OtmWord[] = [];

        try {
            const searchScript = new OtmSearch(searchItem.script);
            const func = searchScript.compile() as (x: OtmWord) => boolean;
            for (const name of searchItem.targetNames) {
                const dict = this.dictionaries.get(name);
                if (dict) {
                    const result = dict.words.filter(func);
                    result.forEach(x => x.dictionaryName = name);
                    words.push(...result);
                }
            }
        } catch (error) {
            console.log(error);
        }

        return words;
    }

    private static matchFunction = new Map<MatchType, (target: string | string[], word: string) => boolean>([
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
