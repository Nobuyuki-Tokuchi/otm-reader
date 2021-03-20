<template lang="pug">
    textarea(ref="editor")
</template>

<script lang="ts">
import CodeMirror from 'codemirror';
import Vue from 'vue';

export default Vue.extend({
    data: function () {
        return {
            _codemirror: null
        } as {
            _codemirror: CodeMirror.Editor | null;
        };
    },
    props: {
        value: String,
        mode: String,
        width: [Number, String],
        height: [Number, String],
    },
    watch: {
        value: function (val: string) {
            if (this._codemirror) {
                if (this._codemirror.getValue() !== val) {
                    this._codemirror.setValue(val);
                }
            }
        }
    },
    mounted: function () {
        this._codemirror = CodeMirror.fromTextArea(this.$refs.editor as HTMLTextAreaElement, {
            value: this.value,
            tabSize: 2,
            lineNumbers: true,
            theme: "rubyblue",
            mode: this.mode ?? "text",
            lineWrapping: true,
        } as CodeMirror.EditorConfiguration);

        this._codemirror.setOption("extraKeys", {
            Tab: function(cm) {
                const spaces = " ".repeat(cm.getOption("indentUnit") ?? 0);
                cm.replaceSelection(spaces);
            }
        });

        this._codemirror.setSize(this.width ?? "100%", this.height ?? "100%");
        this._codemirror.refresh();
        this._codemirror.on("change", (instance) => {
            this.$emit("input", instance.getValue());
        });
        this._codemirror.on("keydown", (instance, event) => {
            this.$emit("keydown", event);
        });
    }
})
</script>
