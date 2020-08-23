import { OtmDictionary } from './dictionary/otm'
import { SearchItem, SearchFunction, MatchType } from './search.item';
import OtmSearch from './otmsearch/otmsearch';
import { PersonalDictionary } from './dictionary/pdic';
import OtmSearcher from './searcher/otmsearcher';
import PDicSearcher from './searcher/pdicsearcher';
import { BaseDictionary, BaseWord } from './dictionary/dictionary';
import TnnSearcher from './searcher/tnnsearcher';
import { TnnDictionary } from './dictionary/tnn';

export class DictionaryManager {
    private dictionaries: Map<string, BaseDictionary>;

    constructor() {
        this.dictionaries = new Map<string, BaseDictionary>()
    }

    public set(name: string, dictionary: BaseDictionary): void {
        for (const word of dictionary.words) {
            word.dictionaryName = dictionary.dictionaryName;
            word.dictionaryType = dictionary.dictionaryType;
        }
        this.dictionaries.set(name, dictionary)
    }

    public get(name: string): BaseDictionary | undefined {
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

    public search(searchItem: SearchItem): BaseWord[] {
        const words: BaseWord[] = [];
        const matchFunc = DictionaryManager.matchFunction.get(searchItem.matchType) ?? (() => false);

        for (const name of searchItem.targetNames) {
            const dict = this.dictionaries.get(name);
            if (dict) {
                let result: BaseWord[];
                if ((searchItem.word === "" || searchItem.word == null) && (searchItem.matchType !== MatchType.EXACT && searchItem.matchType !== MatchType.NOT)) {
                    result = dict.words;
                }
                else {
                    switch (dict.dictionaryType) {
                        case "pdic":
                            result = PDicSearcher.search(dict as PersonalDictionary, searchItem, matchFunc);
                            break;
                        case "otm":
                            result = OtmSearcher.search(dict as OtmDictionary, searchItem, matchFunc);
                            break;
                        case "tnn":
                            result = TnnSearcher.search(dict as TnnDictionary, searchItem, matchFunc);
                            break;
                        default:
                            result = OtmSearcher.search(dict as OtmDictionary, searchItem, matchFunc);
                            break;
                    }
                }
                words.push(...result);
            }
        }
        return words;
    }

    public searchScript(searchItem: SearchItem): BaseWord[] {
        const words: BaseWord[] = [];

        try {
            const searchScript = new OtmSearch(searchItem.script);
            const func = searchScript.compile() as (x: BaseWord) => boolean;
            for (const name of searchItem.targetNames) {
                const dict = this.dictionaries.get(name);
                if (dict) {
                    const result = (dict.words as BaseWord[]).filter(func);
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
