import { BaseDictionary, BaseWord } from '@/libs/dictionary/dictionary';
import { OtmDictionary, OtmWord } from '@/libs/dictionary/otm';
import { PDicWord, PersonalDictionary } from '@/libs/dictionary/pdic';
import OtmSearch from '@/libs/otmsearch/otmsearch';
import { MatchType, SearchItem } from '@/libs/search.item';
import MatchFunction from '@/libs/searcher/matchfunction';
import OtmSearcher from '@/libs/searcher/otmsearcher';
import PDicSearcher from '@/libs/searcher/pdicsearcher';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { ActionResult } from '@/libs/interfaces';
import NtdicSearcher from '@/libs/searcher/ntdicsearcher';
import { NtdicDictionary, NtdicWord } from '@/libs/dictionary/ntdic';

@Module({ name: "dictionary", namespaced: true, })
export default class DictionaryStore extends VuexModule {
    private _dictionaries = new Map<string, BaseDictionary>();
    private _dictionaryIds = new Map<string, number>();
    private _dictionaryNames: string[] = [];
    private _targetNames: string[] = [];

    get dictionaryNames() {
        return this._dictionaryNames;
    }

    get targetNames() {
        return this._targetNames;
    }

    get dictionaryType() {
        return (selected: string): string | undefined => {
            const dictionary = this._dictionaries.get(selected);
            return dictionary?.dictionaryType;
        }
    }

    get dictionaries() {
        return (selected: string | string[]) => {
            if (!Array.isArray(selected)) {
                selected = [selected];
            }
            
            const dictionaries: BaseDictionary[] = [];
            for (const key of selected) {
                const dictionary = this._dictionaries.get(key);
                if (typeof(dictionary) !== "undefined") {
                    dictionaries.push(dictionary);
                }
            }

            return dictionaries;
        }
    }

    get search() {
        return (searchItem: SearchItem) => {
            const words: BaseWord[] = [];
            const matchFunc = MatchFunction.getFunction(searchItem.matchType) ?? (() => false);
    
            for (const name of this.targetNames) {
                const dict = this._dictionaries.get(name);
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
                            case "ntdic":
                                result = NtdicSearcher.search(dict as NtdicDictionary, searchItem, matchFunc);
                                break;
                            default:
                                result = OtmSearcher.search(dict as OtmDictionary, searchItem, matchFunc);
                                break;
                        }
                    }
                    words.push(...(result.map(x => {
                        return {
                            ...x,
                            dictionaryName: dict.dictionaryName,
                            dictionaryType: dict.dictionaryType,
                        };
                    })));
                }
            }

            return words.sort((x, y) => {
                const xWord = DictionaryStore.getWord(x);
                const yWord = DictionaryStore.getWord(y);
                if (xWord < yWord) {
                    return -1;
                }
                else if (xWord > yWord) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
        };
    }

    get searchScript() {
        return (searchItem: SearchItem) => {
            const words: BaseWord[] = [];

            try {
                const searchScript = new OtmSearch(searchItem.script);
                const func = searchScript.compile() as (x: BaseWord) => boolean;
                for (const name of this._targetNames) {
                    const dict = this._dictionaries.get(name);
                    if (dict) {
                        const result = (dict.words as BaseWord[]).filter(func);
                        result.forEach(x => x.dictionaryName = name);
                        words.push(...(result.map(x => {
                            return {
                                ...x,
                                dictionaryName: dict.dictionaryName,
                                dictionaryType: dict.dictionaryType,
                            };
                        })));
                    }
                }
            } catch (error) {
                console.log(error);
            }

            return words.sort((x, y) => {
                const xWord = DictionaryStore.getWord(x);
                const yWord = DictionaryStore.getWord(y);
                if (xWord < yWord) {
                    return -1;
                }
                else if (xWord > yWord) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
        };
    }

    private static getWord(x: BaseWord): string {
        switch (x.dictionaryType) {
            case "pdic":
                return (x as PDicWord).word;
            case "ntdic":
                return (x as NtdicWord).entry.form;
            default:
                return (x as OtmWord).entry.form;
        }
    }

    get hasWord() {
        return  (word: BaseWord): boolean => {
            const dictionary = this._dictionaries.get(word.dictionaryName ?? "");
            if (!dictionary) {
                throw new RangeError("invalid dictionary name");
            }
            
            switch (word.dictionaryType) {
                case "pdic":
                    return (dictionary.words as PDicWord[]).some(x => x.word === (word as PDicWord).word);
                default:
                    {
                        const wordEntry = (word as NtdicWord | OtmWord).entry;
                        return (dictionary.words as (NtdicWord | OtmWord)[])
                            .some(x => x.entry.form === wordEntry.form && x.entry.id !== wordEntry.id);
                    }
            }
        }
    }

    @Mutation
    setDictionary(payload: { dictionaryName: string; dictionary: BaseDictionary }) {
        this._dictionaries.set(payload.dictionaryName, payload.dictionary);
        
        const index = this._dictionaryNames.indexOf(payload.dictionaryName);
        if (index === -1) {
            this._dictionaryNames.push(payload.dictionaryName);
            this._targetNames.push(payload.dictionaryName);
        }

        switch (payload.dictionary.dictionaryType) {
            case "tnn":
            case "otm":
            case "ntdic":
                this._dictionaryIds.set(payload.dictionaryName,
                    (payload.dictionary.words as (OtmWord | NtdicWord)[]).reduce((acc, x) => Math.max(acc, x.entry.id), 0));
                break;
        }
    }
    
    @Mutation
    removeDictionary(payload: { dictionaryName: string }) {
        this._dictionaries.delete(payload.dictionaryName);
        
        let index = this._dictionaryNames.indexOf(payload.dictionaryName);
        if (index !== -1) {
            this._dictionaryNames.splice(index, 1);
        }

        index = this._targetNames.indexOf(payload.dictionaryName);
        if (index !== -1) {
            this._targetNames.splice(index, 1);
        }
    }

    @Mutation
    removeAll() {
        this._dictionaries.clear();
        this._dictionaryIds.clear();
        this._dictionaryNames.length = 0;
        this._targetNames.length = 0;
    }

    @Mutation
    targetSwitch(payload: { dictionaryNames: string[] }) {
        this._targetNames.length = 0;
        this._targetNames.push(...payload.dictionaryNames);
    }

    @Mutation
    targetToggle(payload: { dictionaryName: string }) {
        const index = this._targetNames.indexOf(payload.dictionaryName);
        if (index !== -1) {
            this._targetNames.splice(index, 1);
        }
        else {
            this._targetNames.push(payload.dictionaryName);
        }
    }

    @Action
    async loadDictionaries(): Promise<ActionResult> {
        const url = this.context.rootGetters.apiUrl;

        if (url && typeof url === "string") {
            let replacedUrl = url.replace("{name}", "dictionary");
            let bodyContents: Record<string, unknown>;
            
            if (url.includes("{mode}")) {
                replacedUrl = replacedUrl.replace("{mode}", "get");
                bodyContents = {};
            }
            else {
                bodyContents = {
                    mode: "get",
                };
            }

            try {
                const response = await fetch(replacedUrl, {
                    method: "POST",
                    mode: "cors",
                    cache: "no-cache",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    redirect: "follow",
                    referrerPolicy: "no-referrer",
                    body: JSON.stringify(bodyContents),
                });

                const result = await response.json();

                if (result["status"] === "error") {
                    throw result["errorReason"];
                }

                const dictionaries = result["data"];

                this.removeAll();
                for (const key in dictionaries) {
                    const data = dictionaries[key] as { dictionary: BaseDictionary; type: string };
                    data.dictionary.dictionaryName = key;
                    data.dictionary.dictionaryType = data.type;

                    this.setDictionary({
                        dictionaryName: key,
                        dictionary: data.dictionary,
                    });
                }
                return { result: "done" };
            }
            catch (error) {
                if (typeof error === "string") {
                    return { result: "fail", reason: error };
                }
                else if (error instanceof Error) {
                    return { result: "fail", reason: error.message + "::" + error.stack };
                }
                else {
                    return { result: "fail", reason: error?.["errorReason"] };
                }
            }
        }
        else {
            return { result: "none" };
        }
    }

}
