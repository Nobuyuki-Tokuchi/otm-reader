<template lang="pug">
    .word-list
        OtmResult.word(v-for="word in words", :word="word")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import OtmResult from "./OtmResult.vue";
import { OtmWord } from '@/libs/otm';

@Component({
    components: {
        OtmResult
    }
})
export default class Result extends Vue {
    @Prop() private words!: OtmWord[];

    constructor() {
        super();
    }
}

</script>
 
 <style lang="scss" scoped>
$main-color: black;
$sub-color: white;

.word {
    box-sizing: border-box;
    border: solid 1px $main-color;
}
 </style>