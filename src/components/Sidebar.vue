<template lang="pug">
    .side-bar(:class="{ open: openSidebar }")
        h1.app-title OTM Reader
        h3 設定
        div
            h4 辞書一覧
            .dictionary-area
                input(type="file", multiple, @change="appendFiles")
                ul(@click="removeDictionary", @drop="appendFiles", @dragover="dragoverFiles")
                    li.no-mark(v-for="name in dictionaryNames", :key="name")
                        input(type="checkbox", name="dict-name", :value="name", v-model="targetNames")
                        span {{ name }}
                        span.close(:data-key="name") &times;
        hr
        div
            h4 表示設定
            .display-area
                div 内容が存在しない項目は表示しない：
                    input(type="checkbox", v-model="hiddenEmptyContents")
        button.toggle-side-bar(@click="toggle")
            .toggle-item
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { getModule } from 'vuex-module-decorators';
import { BaseDictionary } from '@/libs/dictionary/dictionary';
import { PDicReader } from '@/libs/dictionary/pdic';
import { TnnDictionary } from '@/libs/dictionary/tnn';
import TnnSearcher from '@/libs/searcher/tnnsearcher';
import DictionaryStore from '@/store/modules/dictionary.store';
import DisplayStore from '@/store/modules/display.store';
import { NtdicDictionary } from '@/libs/dictionary/ntdic';

@Component
export default class Sidebar extends Vue {
    private openSidebar: boolean;
    private dictionariesApiUrl: string;
    
    constructor() {
        super();

        this.openSidebar = false;
        this.dictionariesApiUrl = localStorage.getItem("dictionariesApiUrl") ?? "";
    }

    get dictionaryNames(): string[] {
        const instance = getModule(DictionaryStore, this.$store);
        return instance.dictionaryNames;
    }

    get targetNames(): string[] {
        const instance = getModule(DictionaryStore, this.$store);
        return instance.targetNames;
    }

    set targetNames(value: string[]) {
        const instance = getModule(DictionaryStore, this.$store);
        instance.targetSwitch({ dictionaryNames: value });
    }

    get hiddenEmptyContents(): boolean {
        const instance = getModule(DisplayStore, this.$store);
        return instance.hiddenEmptyContent;
    }

    set hiddenEmptyContents(value: boolean) {
        const instance = getModule(DisplayStore, this.$store);
        instance.setHiddenEmptyContent(value);
    }

    toggle() {
        this.openSidebar = !this.openSidebar;
    }

    removeDictionary(event: Event): void {
        const el = event.target;
        if (el instanceof HTMLElement) {
            const value = el.getAttribute("data-key");

            if (value != null) {
                const instance = getModule(DictionaryStore, this.$store);
                instance.removeDictionary({ dictionaryName: value });
            }
        }
    }

    appendFiles(event: Event): void {
        let files: FileList | null;
        if (event instanceof DragEvent) {
            event.stopPropagation();
            event.preventDefault();
            if (event.dataTransfer) {
                files = event.dataTransfer.files;
            }
            else {
                files = null;
            }
        }
        else {
            files = (event.target as HTMLInputElement).files;
        }

        if (files) {
            this.appendDictionaries(files);
            (event.target as HTMLInputElement).files = null;
        }
    }

    dragoverFiles(event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        if(event.dataTransfer?.dropEffect) {
            event.dataTransfer.dropEffect = "copy";
        }
    }

    private appendDictionaries(files: FileList) {
        const instance = getModule(DictionaryStore, this.$store);

        for (const file of files) {
            const filename = file.name;
            let promise: Promise<BaseDictionary>;

            if (filename.endsWith(".json")) {
                promise = this.readJson(instance, file);
            }
            else if (filename.endsWith(".csv")) {
                promise = this.readCsv(instance, file);
            }
            else {
                throw new Error("Not support type");
            }
            promise.then(dictionary => {
                instance.setDictionary({
                    dictionaryName: file.name,
                    dictionary: dictionary,
                });
            }).catch(reason => {
                console.log(reason);
            });
        }
    }

    private readJson(instance: DictionaryStore, file: File): Promise<BaseDictionary> {
        return file.text().then(result => {
            let dictionary = JSON.parse(result as string) as BaseDictionary;
            dictionary.dictionaryName = file.name;

            if ((dictionary as TnnDictionary).dictionary?.type?.toLowerCase() === "tnn") {
                dictionary.dictionaryType = "tnn";
                dictionary = TnnSearcher.recreate(dictionary as TnnDictionary);
            }
            else if ((dictionary as NtdicDictionary)?.settings?.type === "ntdic") {
                dictionary.dictionaryType = "ntdic";
            }
            else {
                dictionary.dictionaryType = "otm";
            }

            return dictionary;
        });
    }

    private readCsv(instance: DictionaryStore, file: File): Promise<BaseDictionary> {
        return file.arrayBuffer().then(result => {
            const typeArray = new Uint8Array(result);
            const reader = new FileReader();

            const promise = new Promise<string>((resolve) => {
                reader.onload = () => {
                    resolve(reader.result as string);
                };
            })

            if(typeArray[0] === 0xFF && typeArray[1] === 0xFE) {
                reader.readAsText(file, "UTF-16LE");
            }
            else if (typeArray[0] === 0xFE && typeArray[1] === 0xFF) {
                reader.readAsText(file, "UTF-16BE");
            }
            else if (typeArray[0] === 0xEF && typeArray[1] === 0xBB && typeArray[2] === 0xBF) {
                reader.readAsText(file.slice(3), "UTF-8");
            }
            else {
                reader.readAsText(file, "UTF-8");
            }

            return promise;
        }).then(value => {
            const dictionary = PDicReader.parseCsv(value);
            dictionary.dictionaryName = file.name;
            dictionary.dictionaryType = "pdic";

            return dictionary;
        });
    }
}
</script>

<style lang="scss" scoped>
.side-bar {
    $sidebar-width: 250px;
    $sidebar-padding: 5px;
    $sidebar-padding-left: $sidebar-padding + 10px;

    z-index: 10;
    position: fixed;
    width: $sidebar-width;
    height: 100vh;
    right: -($sidebar-width + ($sidebar-padding-left - $sidebar-padding));
    top: 0px;
    border-left: 1px solid black;
    padding: $sidebar-padding;
    padding-left: $sidebar-padding-left;
    color: black;
    background-color: white;

    &.open {
        right: 0px;
    }

    > .app-title {
        $left-size: 10px;
        margin-top: 5px;
        margin-bottom: 5px;
        margin-left: -$left-size;
        padding-left: $left-size;
        border-bottom: 4px black double;
    }

    h1, h2, h3, h4, h5 {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    h3 {
        border-bottom: 1px solid black;
    }
    
    .dictionary-area,
    .display-area {
        display: flex;
        flex-direction: column;
    }

    .dictionary-area {
        height: 30%;
        ul {
            margin-top: 5px;
            margin-bottom: 5px;
            padding: 0px;
            border: 1px solid black;
            min-height: 100px;
            max-height: 200px;
            overflow: auto;

            li.no-mark {
                list-style: none;
                margin-left: 5px;
            }
        }
    }

    .toggle-side-bar {
        $width: 12px;
        $height: 80%;

        cursor: pointer;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        position: absolute;
        width: $width;
        height: $height;
        top: (50% - $height / 2);
        left: -$width / 2;
        background-color: #808080;

        > .toggle-item {
            cursor: pointer;
            box-sizing: border-box;
            padding: 0px;
            margin: $width / 2 - 1;
            background-color: #d0d0d0;
            height: 90%;
            width: 2px;
        }
    }
}
</style>