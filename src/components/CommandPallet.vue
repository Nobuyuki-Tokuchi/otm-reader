<template lang="pug">
    .dialog(:class="{ open: openCommand }", ref="dialog")
        v-card(dense)
            v-card-title(@mousedown="moveDialog", @dragstart="dragStart")
                span コマンドパレット
                span.flex-grow-1.flex-shrink-1
                span.close(@click="close") &times;
            v-card-text
                .d-flex.flex-column
                    v-text-field(dense, outlined, hide-details="auto", label="コマンド", v-model="command", @keydown="keydown")
                    v-textarea(outlined, hide-details="auto", no-resize, readonly, :value="result", rows="5")
</template>

<script lang="ts">
import DictionaryStore from '@/store/modules/dictionary.store';
import DisplayStore from '@/store/modules/display.store';
import { Component, Ref, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';

@Component
export default class CommandPallet extends Vue {
    @Ref() dialog!: HTMLElement;

    private command: string;
    private result: string;
    private histories: string[];
    private historyIndex: number;

    constructor () {
        super();
        this.command = "";
        this.result = "";
        this.histories = [];
        this.historyIndex = this.histories.length;
    }

    get openCommand(): boolean {
        const instance = getModule(DisplayStore, this.$store);
        return instance.openCommand;
    }

    keydown(event: KeyboardEvent) {
        switch(event.key) {
            case "Enter":
                this.execute();
                break;
            case "ArrowUp":
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                }

                this.command = this.histories[this.historyIndex];
                event.preventDefault();
                break;
            case "ArrowDown":
                if (this.historyIndex < this.histories.length) {
                    this.historyIndex++;
                }

                if (this.historyIndex < this.histories.length) {
                    this.command = this.histories[this.historyIndex];
                }
                else {
                    this.command = "";
                }
                event.preventDefault();
                break;
        }
    }

    private execute() {
        if (this.histories[this.histories.length - 1] !== this.command) {
            this.histories.push(this.command);
        }

        switch (this.command) {
            case "clear":
                this.histories.length = 0;
                this.historyIndex = this.histories.length;
                break;
            default:
                this.request(this.command);
                break;
        }

        this.historyIndex = this.histories.length;
        this.command = "";
    }

    private request(data: string) {
        const url = this.$store.getters.apiUrl;
        const command = data.split(" ");

        if (url && typeof url === "string") {
            this.callUtil(url, command);
        }
    }

    private async callUtil(url: string, command: string[]) {
        let replacedUrl = url.replace("{name}", "util");
        const bodyContents: Record<string, unknown> = {};

        const mode = command.shift() ?? "";
        const args = command.map(x => x.split("=", 2));

        if (url.includes("{mode}")) {
            replacedUrl = replacedUrl.replace("{mode}", mode);
        }
        else {
            bodyContents["mode"] = command[0];
        }

        for (const iterator of args) {
            bodyContents[iterator[0]] = iterator[1];
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
            else {
                if (typeof result["data"] === "object") {
                    let value = "";
                    for (const key in result["data"]) {
                        if (Object.prototype.hasOwnProperty.call(result["data"], key)) {
                            value += `${key}: ${JSON.stringify(result["data"][key])}\n`;
                        }
                    }
                    this.result = value + "\n----\n" + this.result;
                }
                else if (Array.isArray(result["data"])) {
                    let value = "";
                    for (let i = 0; i < result["data"].length; i++) {
                        const dataValue = result["data"][i];
                        value += `${i}: ${JSON.stringify(dataValue)}\n`;
                    }
                    this.result = value + "\n----\n" + this.result;
                }
                else {
                    this.result = "" + result["data"] + "\n----\n" + this.result;
                }
            }
        } catch (error) {
            if (typeof error === "string") {
                this.result = "result: fail\nreason: "+ error + "\n----\n" + this.result;
            }
            else if (error instanceof Error) {
                this.result = "result: fail\nreason:\n"+ error.message + "::" + error.stack + "\n----\n" + this.result;
            }
            else {
                this.result = "result: fail\nreason:\n"+ error?.["errorReason"] + "\n----\n" + this.result;
            }
        }
    }

    close() {
        const instance = getModule(DisplayStore, this.$store);
        instance.setOpenCommand(false);

        this.dialog.style.left = "";
        this.dialog.style.top = "";
    }

    moveDialog(e1: MouseEvent) {
        const bound = this.dialog.getBoundingClientRect();
        const offsetX = e1.screenX - bound.left;
        const offsetY = e1.screenY - bound.top;

        const mouseMove = (e2: MouseEvent) => {
            this.dialog.style.left = (e2.screenX - offsetX) + "px";
            this.dialog.style.top = (e2.screenY - offsetY) + "px";
        };

        const mouseUp = () => {
            this.dialog.removeEventListener("mousemove", mouseMove);
            this.dialog.removeEventListener("mouseup", mouseUp);
        }

        e1.preventDefault();
        e1.stopPropagation();

        this.dialog.addEventListener("mousemove", mouseMove);
        this.dialog.addEventListener("mouseup", mouseUp);
    }

    dragStart() {
        return false;
    }
}
</script>
