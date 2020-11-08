<template lang="pug">
    .add-space
        Result(:words="displayWords", :updateWord="updateWord")
        hr(v-if="count > 0")
        Pager(:pageCount="pageCount", @input="getPageCount", :count="count", :listingCount="listingCount", v-if="count > 0")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Result from "./Result.vue";
import Pager from "./Pager.vue";
import { BaseWord } from '@/libs/dictionary/dictionary';
import DictionaryStore from '@/store/modules/dictionary.store';

@Component({
    model: {
        prop: "pageCount",
        event: "input",
    },
    components: {
         Result,
         Pager,
    },
})
export default class Viewer extends Vue {
    @Prop() updateWord!: (word?: BaseWord) => void;
    @Prop() result!: BaseWord[];
    @Prop() listingCount!: number;
    @Prop() pageCount!: number;
    private _decoratedInstance: DictionaryStore | null;

    constructor() {
        super();
        this._decoratedInstance = null;
    }

    public get count(): number {
        return this.result.length;
    }

    public get displayWords (): BaseWord[] {
        const pageCount = this.pageCount;
        const listingCount = this.listingCount;
        const start = (pageCount - 1) * listingCount;
        const end = start + listingCount;

        return this.result.filter((x: BaseWord, index: number) => index >= start && index < end);
    }

    public getPageCount(value: number) {
        this.$emit('input', value);
    }
}

</script>

<style lang="scss" scoped>

.add-space {
    > * {
        margin-top: 5px;
        margin-bottom: 5px;
    }

    button {
        margin-left: 5px;
        margin-right: 5px;
    }
}
</style>