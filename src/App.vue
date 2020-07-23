<template lang="pug">
    #app
        Viewer(v-bind:dictionaries="dictionaries")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Viewer from './components/Viewer.vue';
import { DictionaryManager } from './libs/dictionary.manager';

@Component({
    components: {
        Viewer
    },
})
export default class App extends Vue {
    private dictionaries: DictionaryManager;

    constructor () {
        super();

        this.dictionaries = new DictionaryManager();
    }
}
</script>

<style lang="scss">
$main-color: black;
$sub-color: white;

body {
    margin: 0;
    padding: 0;
}
.flex {
    display: flex;
    box-sizing: border-box;
    .half {
        flex-basis: 50%;
    }
}
button {
    color: $sub-color;
    background-color: $main-color;
    border: 0;
    padding-top: 2px;
    padding-bottom: 2px;
}
#app {
    color: $main-color;
    background-color: $sub-color;
    font-family: "Yu Gothic", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 10px;
}
</style>
