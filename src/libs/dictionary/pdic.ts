import { BaseDictionary, BaseWord } from './dictionary';

export class PersonalDictionary implements BaseDictionary<PDicWord> {
    words: PDicWord[];
    dictionaryName?: string;
    dictionaryType?: string;

    constructor () {
        this.words = [];
        this.dictionaryName = undefined;
        this.dictionaryType = "pdic";
    }
}

export class PDicWord implements BaseWord {
    dictionaryName?: string;
    dictionaryType?: string;

    word: string;
    trans: string;
    exp: string;
    level: number;
    meomry: number;
    modify: number;
    pron: string;

    constructor () {
        this.dictionaryName = undefined;
        this.dictionaryType = undefined;

        this.word = "";
        this.trans = "";
        this.exp = "";
        this.level = 0;
        this.meomry = 0;
        this.modify = 0;
        this.pron = "";
    }
}

export class PDicReader {
    public static parseCsv(csv: string): PersonalDictionary {
        const dictionary = new PersonalDictionary();

        let index = 1;
        const QUOTE = "\"";

        index = csv.indexOf("\n", index) + 2;
        while (index !== -1 && index < csv.length) {
            let next = csv.indexOf(QUOTE, index);
            const word = new PDicWord();

            while (next < csv.length && csv[next + 1] === QUOTE) {
                next = csv.indexOf(QUOTE, next + 2);
            }
            word.word = csv.substring(index, next);
            
            index = next + 3;
            next = csv.indexOf(QUOTE, index);
            while (next < csv.length && csv[next + 1] === QUOTE) {
                next = csv.indexOf(QUOTE, next + 2);
            }
            word.trans = csv.substring(index, next);

            index = next + 3;
            next = csv.indexOf(QUOTE, index);
            while (next < csv.length && csv[next + 1] === QUOTE) {
                next = csv.indexOf(QUOTE, next + 2);
            }
            word.exp = csv.substring(index, next);

            index = next + 2;
            next = csv.indexOf(",", index);
            word.level = Number.parseInt(csv.substring(index, next));
            
            index = next + 1;
            next = csv.indexOf(",", index);
            word.meomry = Number.parseInt(csv.substring(index, next));
            
            index = next + 1;
            next = csv.indexOf(",", index);
            word.modify = Number.parseInt(csv.substring(index, next));
            
            index = next + 2;
            next = csv.indexOf(QUOTE, index);
            while (next < csv.length && csv[next + 1] === QUOTE) {
                next = csv.indexOf(QUOTE, next + 1);
            }
            if (next === -1) { next = csv.length; }
            word.pron = csv.substring(index, next);

            index = csv.indexOf("\n", next) + 2;

            dictionary.words.push(word)
        }

        return dictionary;
    }
}