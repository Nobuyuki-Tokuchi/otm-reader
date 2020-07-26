# OTM Reader
## 概要
OTM-JSON形式の辞書内の単語や訳語を検索するためのWebアプリケーション

## 特徴
* 複数の辞書に対して一度に検索を行うことができる．
* 自作の簡易検索スクリプト言語([OTM Search](https://github.com/Nobuyuki-Tokuchi/otmsearch))による検索も可能．

## 使用ライブラリなど
* Vue.js

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
ZpDICやamuhikuなどでOTM-JSON形式の辞書が作成できますのでそちらをご使用下さい．
