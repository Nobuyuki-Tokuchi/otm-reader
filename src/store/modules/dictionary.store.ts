import { BaseDictionary, BaseWord } from '@/libs/dictionary/dictionary';
import { OtmDictionary, OtmWord } from '@/libs/dictionary/otm';
import { PDicWord, PersonalDictionary } from '@/libs/dictionary/pdic';
import { TnnDictionary, TnnWord } from '@/libs/dictionary/tnn';
import OtmSearch from '@/libs/otmsearch/otmsearch';
import { MatchType, SearchItem } from '@/libs/search.item';
import MatchFunction from '@/libs/searcher/matchfunction';
import OtmSearcher from '@/libs/searcher/otmsearcher';
import PDicSearcher from '@/libs/searcher/pdicsearcher';
import TnnSearcher from '@/libs/searcher/tnnsearcher';
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
                            case "tnn":
                                result = TnnSearcher.search(dict as TnnDictionary, searchItem, matchFunc);
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
            case "tnn":
                return (x as TnnWord).entry.form[0];
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
                        const wordEntry = (word as TnnWord | NtdicWord | OtmWord).entry;
                        return (dictionary.words as (TnnWord | NtdicWord | OtmWord)[])
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
                    (payload.dictionary.words as (TnnWord | OtmWord | NtdicWord)[]).reduce((acc, x) => Math.max(acc, x.entry.id), 0));
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
    setWord(payload: { dictionaryName: string; word: BaseWord }) {
        const dictionary = this._dictionaries.get(payload.dictionaryName);

        if (dictionary) {
            if (dictionary.dictionaryType === "pdic" && payload.word.dictionaryType === "pdic") {
                const pdicWord =  (payload.word as PDicWord);
                if (!pdicWord.word) { return }

                const wordIndex = (dictionary.words as PDicWord[]).findIndex(x => x.word === pdicWord.word);
                if (wordIndex === -1) {
                    dictionary.words.push(payload.word);
                }
                else {
                    dictionary.words[wordIndex] = pdicWord;
                }
            }
            else if (dictionary.dictionaryType === "tnn" && payload.word.dictionaryType === "tnn") {
                const tnnWord =  (payload.word as TnnWord);
                if (!tnnWord.entry.form) { return }

                const tnnWords = (dictionary.words as TnnWord[]);
                const wordIndex = tnnWords.findIndex(x => x.entry.id === tnnWord.entry.id);
                if (wordIndex === -1) {
                    tnnWord.entry.id = (this._dictionaryIds.get(payload.dictionaryName) ?? 0) + 1
                    this._dictionaryIds.set(payload.dictionaryName, tnnWord.entry.id);
                    dictionary.words.push(tnnWord);
                }
                else {
                    dictionary.words[wordIndex] = tnnWord;
                }
            }
            else if (dictionary.dictionaryType === "otm" && payload.word.dictionaryType === "otm") {
                const otmWord =  (payload.word as OtmWord);
                if (!otmWord.entry.form) { return }

                const otmWords = (dictionary.words as OtmWord[]);
                let wordIndex: number;
                if (otmWord.entry.id !== -1) {
                    wordIndex = otmWords.findIndex(x => x.entry.id === otmWord.entry.id);
                }
                else {
                    wordIndex = -1;
                }

                if (wordIndex === -1) {
                    wordIndex = otmWords.findIndex(x => x.entry.form === otmWord.entry.form);
                }

                if (wordIndex === -1) {
                    otmWord.entry.id = (this._dictionaryIds.get(payload.dictionaryName) ?? 0) + 1
                    this._dictionaryIds.set(payload.dictionaryName, otmWord.entry.id);
                    dictionary.words.push(otmWord);
                }
                else {
                    dictionary.words[wordIndex] = otmWord;
                }

                const relationWordForms = otmWord.relations.map(x => x.entry.form);
                const relatedWords = otmWords.filter(x => relationWordForms.includes(x.entry.form));

                for (const relation of otmWord.relations) {
                    const relatedWord = relatedWords.find(x => x.entry.form == relation.entry.form);
                    if (relatedWord) {
                        relation.entry = relatedWord.entry;
                        const word = relatedWord.relations.find(x => x.entry.form === relation.entry.form);
                        if (word) {
                            word.entry = relation.entry;
                        }
                        else {
                            relatedWord.relations.push({
                                title: relation.title,
                                entry: otmWord.entry
                            });
                        }
                    }
                }
            }
            else if (dictionary.dictionaryType === "ntdic" && payload.word.dictionaryType === "ntdic") {
                const ntdicWord =  (payload.word as NtdicWord);
                if (!ntdicWord.entry.form) { return }

                // set datetime
                const datetime = new Date();
                for (const history of ntdicWord.histories.filter(x => x.datetime === "$now")) {
                    history.datetime = datetime.toISOString();
                }

                // insert or update
                const ntdicWords = (dictionary.words as NtdicWord[]);
                let wordIndex: number;

                if (ntdicWord.entry.id !== -1) {
                    wordIndex = ntdicWords.findIndex(x => x.entry.id === ntdicWord.entry.id);
                }
                else {
                    wordIndex = -1;
                }

                if (wordIndex === -1) {
                    wordIndex = ntdicWords.findIndex(x => x.entry.form === ntdicWord.entry.form);
                }

                if (wordIndex === -1) {
                    ntdicWord.entry.id = (this._dictionaryIds.get(payload.dictionaryName) ?? 0) + 1
                    this._dictionaryIds.set(payload.dictionaryName, ntdicWord.entry.id);
                    dictionary.words.push(ntdicWord);
                }
                else {
                    dictionary.words[wordIndex] = ntdicWord;
                }

                // set relation
                const relationWordForms = ntdicWord.relations.filter(x => x.entry.id < 0).map(x => x.entry.form);
                const relatedWords = ntdicWords.filter(x => relationWordForms.includes(x.entry.form));

                for (const relation of ntdicWord.relations) {
                    const relatedWord = relatedWords.find(x => x.entry.form == relation.entry.form);
                    if (relatedWord) {
                        relation.entry = relatedWord.entry;
                        const word = relatedWord.relations.find(x => x.entry.form === relation.entry.form);
                        if (word) {
                            word.entry = {
                                id: relation.entry.id,
                                form: relation.entry.form
                            };
                        }
                        else {
                            relatedWord.relations.push({
                                title: relation.title,
                                entry: {
                                    id: relation.entry.id,
                                    form: relation.entry.form
                                }
                            });
                        }
                    }
                }
            }
            else {
                throw new TypeError(`Mismatch type: dictionary = "${dictionary.dictionaryType}", word = "${payload.word}"`);
            }

            this._dictionaries.set(payload.dictionaryName, dictionary);
        }
        else {
            throw new Error(`Not found dictionary: ${payload.dictionaryName}`);
        }
    }

    @Action
    async loadDictionaries(): Promise<ActionResult> {
        const url = localStorage.getItem("dictionariesApiUrl");
        if (url) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    mode: "cors",
                    cache: "no-cache",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    redirect: "follow",
                    referrerPolicy: "no-referrer",
                    body: JSON.stringify({
                        mode: "get_dictionaries",
                    }),
                });

                const dictionaries = await response.json();

                this.removeAll();
                for (const key in dictionaries) {
                    const data = dictionaries[key] as { dictionary: BaseDictionary; type: string };
                    data.dictionary.dictionaryName = key;
                    data.dictionary.dictionaryType = data.type;

                    if (data.type === "tnn") {
                        data.dictionary = TnnSearcher.recreate(dictionaries as TnnDictionary);
                    }

                    this.setDictionary({
                        dictionaryName: key,
                        dictionary: data.dictionary,
                    });
                }
                return { result: "done" };
            }
            catch (error) {
                return { result: "fail", reason: error };
            }
        }
        else {
            return { result: "none" };
        }
    }

    @Action
    async saveDictionaries(): Promise<ActionResult> {
        const url = localStorage.getItem("dictionariesApiUrl");
        if (url) {
            const dictionaries: { [key: string]: BaseDictionary<BaseWord> } = {};

            for (let index = 0; index < this._dictionaryNames.length; index++) {
                const key = this._dictionaryNames[index];
                dictionaries[key] = this._dictionaries.get(key)!;
            }
    
            try {
                const response = await fetch(url, {
                    method: "POST",
                    mode: "cors",
                    cache: "no-cache",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    redirect: "follow",
                    referrerPolicy: "no-referrer",
                    body: JSON.stringify({
                        mode: "update",
                        dictionaries: dictionaries,
                    }, (key, value) => {
                        if (key === "dictionaryName" || key === "dictionaryType") {
                            return undefined;
                        }
                        else {
                            return value;
                        }
                    }),
                });
                if(response.ok) {
                    return { result: "done" };
                }
                else {
                    return { result: "fail" };
                }
            } catch (error) {
                return { result: "fail", reason: error };
            }
        }
        else {
            return { result: "none" };
        }
    }

}
