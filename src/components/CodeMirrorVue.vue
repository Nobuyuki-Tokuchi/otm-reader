<template lang="pug">
    textarea(ref="editor")
</template>

<script lang="ts">
import CodeMirror from 'codemirror';
import Vue from 'vue';

export default Vue.extend({
    data: function () {
        return {
            _codemirror: null!
        } as {
            _codemirror: CodeMirror.Editor;
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
            indentWithTabs: false,
            lineNumbers: true,
            theme: "rubyblue",
            mode: this.mode ?? "text",
            lineWrapping: true,
        } as CodeMirror.EditorConfiguration);

        const codemirror = this._codemirror as CodeMirror.Editor;
        codemirror.setSize(this.width ?? "100%", this.height ?? "100%");
        codemirror.refresh();
        codemirror.on("change", (instance) => {
            this.$emit("input", instance.getValue());
        });
        codemirror.on("keydown", (instance, event) => {
            this.$emit("keydown", event);
        });
    }
})
</script>

<style lang="scss" scoped>

</style>