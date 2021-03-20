<template lang="pug">
    v-container(fluid).d-flex
        v-card.flex-grow-1(dense).flex-wrap
            v-card-text
                .d-flex
                    v-sheet.flex-grow-1.mx-2(color="white", @drop="appendFiles", @dragover="dragoverFiles")
                        input.d-none(type="file", multiple, @change="appendFiles", ref="fileInput")
                        v-sheet
                            v-btn(small, @click="callFile") ローカルから選択
                            v-btn(small, @click="reloadData") サーバから取得
                        v-sheet.mt-2.dictionary-list(elevation=4)
                            v-chip.ma-1(label, dense, close, v-for="item in dictionaryInfoes",
                                    :dark="item.target", :key="item.name"
                                    @click="targetToggle(item.name)" @click:close="removeDictionary(item.name)") {{ item.name }}
                    v-divider(vertical)
                    v-sheet.flex-shrink-0.mx-2(color="white")
                        v-text-field(dense, hide-details="auto", label="連携サーバURL", v-model="apiUrl")
                        v-sheet.mx-1.my-2
                            v-btn(small, @click="updateUrl") 設定
                            v-btn(small, @click="revertUrl") キャンセル
        v-card.flex-shrink-0(dense)
            v-card-text
                v-switch(dense, inset, hide-details="auto", v-model="hiddenEmptyContents", label="内容が存在しない項目は表示しない")
                v-switch(dense, inset, hide-details="auto", v-model="alwaysCloseEndEdit", label="保存後に編集ダイアログを閉じる")
                v-switch(dense, inset, hide-details="auto", v-model="updateAfter", label="再検索時に1ページ目に戻る")
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import { BaseDictionary } from '@/libs/dictionary/dictionary';
import { PDicReader } from '@/libs/dictionary/pdic';
import DictionaryStore from '@/store/modules/dictionary.store';
import DisplayStore from '@/store/modules/display.store';
import { NtdicDictionary } from '@/libs/dictionary/ntdic';

@Component({
    mounted: function () {
        this.$data.apiUrl = this.$store.getters.apiUrl;
    }
})
export default class Options extends Vue {
    @Ref() fileInput!: HTMLInputElement;
    private apiUrl: string;
    
    constructor() {
        super();

        this.apiUrl = "";
    }

    get dictionaryInfoes(): { name: string; target: boolean }[] {
        const instance = getModule(DictionaryStore, this.$store);
        const dictionaryNames = instance.dictionaryNames;
        const targetNames = instance.targetNames;
        return dictionaryNames.map(x => {
            return {
                name: x,
                target: targetNames.includes(x),
            }
        });
    }

    get hiddenEmptyContents(): boolean {
        const instance = getModule(DisplayStore, this.$store);
        return instance.hiddenEmptyContent;
    }

    set hiddenEmptyContents(value: boolean) {
        const instance = getModule(DisplayStore, this.$store);
        instance.setHiddenEmptyContent(value);
    }

    get alwaysCloseEndEdit(): boolean {
        const instance = getModule(DisplayStore, this.$store);
        return instance.alwaysCloseEndEdit;
    }

    set alwaysCloseEndEdit(value: boolean) {
        const instance = getModule(DisplayStore, this.$store);
        instance.setAlwaysCloseEndEdit(value);
    }

    get updateAfter(): boolean {
        const instance = getModule(DisplayStore, this.$store);
        return instance.updateAfter;
    }

    set updateAfter(value: boolean) {
        const instance = getModule(DisplayStore, this.$store);
        instance.setUpdateAfter(value);
    }

    targetToggle(value: string | null | undefined): void {
        if (value != null) {
            const instance = getModule(DictionaryStore, this.$store);
            instance.targetToggle({ dictionaryName: value });
        }
    }

    removeDictionary(value: string | null | undefined): void {
        if (value != null) {
            const instance = getModule(DictionaryStore, this.$store);
            instance.removeDictionary({ dictionaryName: value });
        }
    }

    callFile(): void {
        this.fileInput.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
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

    private async appendDictionaries(files: FileList) {
        const instance = getModule(DictionaryStore, this.$store);

        for (const file of files) {
            const filename = file.name;
            let dictionary: BaseDictionary;

            try {
                if (filename.endsWith(".json")) {
                    dictionary = await this.readJson(instance, file);
                }
                else if (filename.endsWith(".csv")) {
                    dictionary = await this.readCsv(instance, file);
                }
                else {
                    throw new Error("Not support type");
                }

                instance.setDictionary({
                    dictionaryName: file.name,
                    dictionary: dictionary,
                });
            }
            catch(reason) {
                console.log(reason);
            }
        }
    }

    private async readJson(instance: DictionaryStore, file: File): Promise<BaseDictionary> {
        const result = await file.text();
        const dictionary = JSON.parse(result) as BaseDictionary;
        dictionary.dictionaryName = file.name;

        if((dictionary as NtdicDictionary)?.settings?.type==="ntdic") {
            dictionary.dictionaryType="ntdic";
        }
        else {
            dictionary.dictionaryType="otm";
        }
        return dictionary;
    }

    private async readCsv(instance: DictionaryStore, file: File): Promise<BaseDictionary> {
        const result = await file.arrayBuffer()
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

        const value = await promise;
        const dictionary = PDicReader.parseCsv(value);
        dictionary.dictionaryName = file.name;
        dictionary.dictionaryType = "pdic";

        return dictionary;
    }

    updateUrl() {
        this.$store.commit("setApiUrl", this.apiUrl);
    }

    revertUrl() {
        this.apiUrl = this.$store.getters.apiUrl;
    }

    reloadData() {
        const dictionary = getModule(DictionaryStore, this.$store);
        
        dictionary.loadDictionaries().then(x => {
            if (x.result !== "done") {
                console.log(x);
            }
        });
    }
}
</script>

<style lang="scss" scoped>
.dictionary-list {
    height: 110px;
    overflow-y: auto;
}
</style>