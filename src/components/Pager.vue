<template lang="pug">
    .pager.flex.between
        .flex.grow
            button(@click="firstPage") 最初へ
            button(@click="prevPage") 前へ
            input(type="number", :value="pageCount", @input="$emit('input', parseInt($event.target.value))", min="1", :max="maxPageCount")
            button(@click="nextPage") 次へ
            button(@click="lastPage") 最後へ
        .flex.text-right
            .px-10px
                span {{ pageCount }} / {{ maxPageCount }}
            .px-10px
                span 件数：
                span {{ count }}
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
    model: {
        prop: "pageCount",
        event: "input",
    }
})
export default class Pager extends Vue {
    @Prop() pageCount!: number;
    @Prop() count!: number;
    @Prop() listingCount!: number; 
    
    public get maxPageCount(): number {
        const count =  Math.ceil(this.count / this.listingCount);
        if (count === 0) {
            return 1;
        }
        else {
            return count;
        }
    }

    firstPage(): void {
        this.$emit("input", 1);
    }

    nextPage(): void {
        const toPage = this.pageCount + 1;
        if (toPage < this.maxPageCount) {
            this.$emit("input", toPage);
        }
        else {
            this.lastPage();
        }
    }
    
    prevPage(): void {
        const toPage = this.pageCount - 1;
        if (toPage > 0) {
            this.$emit("input", toPage);
        }
    }

    lastPage(): void {
        this.$emit("input", this.maxPageCount);
    }

    @Watch("pageCount")
    scrollPageTop(val: number, oldVal: number): void {
        if (val !== oldVal) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.pager {
    margin-top: 5px;
    margin-bottom: 5px;
}

.flex.grow > * {
    margin-left: 2px; 
    margin-right: 2px; 
}

.px-10px {
    padding-left: 10px;
    padding-right: 10px;
}

.text-right {
    text-align: right;
}

</style>