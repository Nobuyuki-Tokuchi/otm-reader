# OTM Reader
## 概要
OTM-JSON形式の辞書内の単語や訳語を検索するためのWebアプリケーション

## 特徴
* 複数の辞書に対して一度に検索を行うことができる．
* 自作の簡易検索スクリプト言語([OTM Search](https://github.com/Nobuyuki-Tokuchi/otmsearch))による検索も可能．
* 辞書WebAPIサーバを使用することによる辞書の読み込みに対応．

## 使用ライブラリなど
* Vue.js
    * Vuexなども含む
* js-yaml
その他はpackage.jsonのdependenciesなどを確認下さい．

## 対応ブラウザ
* Firefox 
* Chrome (※Vivaldiにて確認)
* Edge

## コード記述
* マークアップ：Pug
* スクリプト：Typescript
* スタイルシート：SCSS

## その他
### OTM-JSON形式とは
[こちら](http://ja.conlinguistics.wikia.com/wiki/OTM-JSON)を参照．

### 単語の登録方法は
このアプリケーションは検索専用となっています．  
OTM-JSON形式への単語登録・修正などの辞書編集はZpDICやamuhikuなどをご使用下さい．

## 辞書WebAPIサーバについて
### 辞書WebAPIサーバのURL
辞書WebAPIサーバのURL設定は以下のように記述します．
```
http://localhost/api/{name}/{mode}
```
上記のように設定すると，http://localhost/api/dictionary/get と展開されます．
もしも，{mode}が設定されない場合には，パラメータ内にmodeプロパティを作成し，その部分に設定します．

### 辞書WebAPIサーバへのリクエスト形式
リクエストはPOSTで形式はJSONとなります．

### 置き換え項目
置き換え項目は以下のようになります．
* {name}: otm-readerでは'dictionary'と設定される
* {mode}: otm-readerでは'get'と設定される
