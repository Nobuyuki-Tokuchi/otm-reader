import { Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({ name: "display", namespaced: true, })
export default class DisplayStore extends VuexModule {
    private _hiddenEmptyContents = (localStorage.getItem("hiddenEmptyContents") ?? "0") === "1";
    private _alwaysCloseEndEdit = (localStorage.getItem("allwaysCloseEndEdit") ?? "1") === "1";
    private _updateAfter = (localStorage.getItem("updateAfter") ?? "1") === "1";
    private _openEditor = false;
    private _openCommand = false;

    get hiddenEmptyContent(): boolean {
        return this._hiddenEmptyContents;
    }

    get alwaysCloseEndEdit(): boolean {
        return this._alwaysCloseEndEdit;
    }

    get updateAfter(): boolean {
        return this._updateAfter;
    }

    get openEditor(): boolean {
        return this._openEditor;
    }

    get openCommand(): boolean {
        return this._openCommand;
    }

    @Mutation
    public setHiddenEmptyContent(hiddenEmptyContents: boolean) {
        this._hiddenEmptyContents = hiddenEmptyContents;
        localStorage.setItem("hiddenEmptyContents", this._hiddenEmptyContents ? "1" : "0");
    }

    @Mutation
    public setAlwaysCloseEndEdit(allwaysCloseEndEdit: boolean) {
        this._alwaysCloseEndEdit = allwaysCloseEndEdit;
        localStorage.setItem("allwaysCloseEndEdit", this._alwaysCloseEndEdit ? "1" : "0");
    }
    
    @Mutation
    public setUpdateAfter(updateAfter: boolean) {
        this._updateAfter = updateAfter;
        localStorage.setItem("updateAfter", this._updateAfter ? "1" : "0");
    }
    
    @Mutation
    public setOpenEditor(openEditor: boolean) {
        this._openEditor = openEditor;
    }

    @Mutation
    public setOpenCommand(openCommand: boolean) {
        this._openCommand = openCommand;
    }

}