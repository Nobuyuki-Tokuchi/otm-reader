import { Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({ name: "display", namespaced: true, })
export default class DisplayStore extends VuexModule {
    private _hiddenEmptyContents = (localStorage.getItem("hiddenEmptyContents") ?? "0") === "1";
    private _openEditor = false;
    private _allwaysCloseEndEdit = (localStorage.getItem("allwaysCloseEndEdit") ?? "1") === "1";

    get hiddenEmptyContent(): boolean {
        return this._hiddenEmptyContents;
    }

    get openEditor(): boolean {
        return this._openEditor;
    }

    get allwaysCloseEndEdit(): boolean {
        return this._allwaysCloseEndEdit;
    }

    @Mutation
    public setHiddenEmptyContent(hiddenEmptyContents: boolean) {
        this._hiddenEmptyContents = hiddenEmptyContents;
        localStorage.setItem("hiddenEmptyContents", this._hiddenEmptyContents ? "1" : "0");
    }

    @Mutation
    public setOpenEditor(openEditor: boolean) {
        this._openEditor = openEditor;
    }

    @Mutation
    public setAllwaysCloseEndEdit(allwaysCloseEndEdit: boolean) {
        this._allwaysCloseEndEdit = allwaysCloseEndEdit;
        localStorage.setItem("allwaysCloseEndEdit", this._allwaysCloseEndEdit ? "1" : "0");
    }
}