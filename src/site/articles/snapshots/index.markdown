---
layout: article
title: "Snapshots in Dart"
rel:
  author: siva-annamalai
description: "Learn how snapshots can help your apps start up faster."
has-permalinks: true
article:
  written_on: 2013-02-13
  collection: language-details
---

{% include toc.html %}
{% include breadcrumbs.html %}

# {{ page.title }}

<em>著：Siva Annamalai <br />
<time pubdate date="2013-02-13">2013年2月</time>
</em>

この記事はDartのスナップショットについて
ーーそれが何モノかという事と、どのようにDartアプリの起動を高速化しているのかについて話します。
コマンドラインのアプリを書いている場合、
この記事の例を参考にスナップショットを生成する事で、
起動時間を改善する事ができるはずです。

## スナップショットとは何ですか？

スナップショットとは、1つかそれ以上のDartオブジェクトの
シリアライズされた形式で表される一連のバイトの事です。
つまり、Dartオブジェクトがisolateの
ヒープメモリでの表現方法に厳密に一致しています。

Dart VMは主に2つの理由でスナップショットを使っています：

* アプリの **初回の起動の高速化** のために使っています。
  コアライブラリとアプリケーションスクリプトのスナップショットは、
  通常はコアライブラリとアプリケーションスクリプトのパースしたデータを含んでいます。
  つまり、起動時にライブラリやスクリプトを
  パースしたりトークン化する必要が無いという事を意味します。
* あるisolateから他のisolateへ **オブジェクトを渡す** ために使います。

DartVMは次の種類のスナップショットを使っています：

* **フルスナップショット**は、
  初期化後のisolateのヒープを完全に表現します。
  これはDartVMがDartのコアライブラリや、
  他のdart:convert、dart:io、dart:isolate等といった
  ライブラリの高速な起動や初期化のために使います。
* **スクリプトスナップショット**は、
  アプリケーションスクリプトがisolateにロードされた後、
  実行される前の、isolateのヒープを完全に表現します。
  これはDartVMがアプリケーションの高速な起動と初期化のために使います。
  例えば、dart2js を起動するスクリプトは、
  事前に作成された dart2js アプリのスクリプトスナップショットを使います。
* **オブジェクトスナップショット**。
  あるisolateから他のisolateへのメッセージングは、
  他のisolateへ送るために、DartVMでは
  Dartオブジェクトのスナップショットを作成する実装になっています。

## スクリプトスナップショットを生成し、利用する方法

DartVM (dart)を使う事で、スクリプトスナップショットを生成し、利用する事ができます。

<aside class="alert alert-info" markdown="1">
**注意:**
たかだか数回しか使わないプログラムのために、
スクリプトスナップショットを作成する必要はありません。
スクリプトスナップショットは、たくさん起動する事で
スナップショット作成のコストを償却できるような
デプロイをされるアプリケーションの場合において価値があるのです。
</aside>

スクリプトスナップショットを生成するには、
`--snapshot` オプションを付けてdartコマンドを使ってください。
importで使っているパッケージ(`import 'package:...'`)の場所を指定するには
`--package_root`オプションを使ってください。

{% prettify sh %}
dart [--package_root=<path>] --snapshot=<output_file> <dart_file>
{% endprettify %}

`--snapshot` オプションは _dart-script-file_ のスクリプトスナップショットを
_out-file_に書き出します。
例えば次のコマンドでは、`dart2js.dart` という
Dartスクリプトのスナップショットを作成し、
`dart2js.snapshot` と呼ばれるファイルの中に設置します。

{% prettify sh %}
dart --snapshot=dart2js.snapshot \
    dart-sdk/lib/dart2js/lib/_internal/compiler/implementation/dart2js.dart
{% endprettify %}

そのスナップショットからスクリプトを実行するには、
スナップショットファイルをコマンドラインで指定します：

{% prettify sh %}
dart <snapshot_file> <args>
{% endprettify %}

指定した _引数_ はスクリプトに渡されます。
例えば、 `myscript.dart -oout.js` を
dart2jsのコマンドライン引数に渡す時は、
dart2jsをこのように実行する事ができます：

{% prettify sh %}
dart dart2js.snapshot myscript.dart -oout.js
{% endprettify %}

## フルスナップショットを生成する方法

（例えばDartiumのような）DartVMを埋め込む
稀なプロジェクトのひとつで働いている場合、
この項目を読んでみてください。
gen_snapshotツールは
(コアライブラリ、dart:uri、dart:io、dart:utf、dart:json、dart:isolateなどの)
フルスナップショットを _out-file_ に書き出します：

{% prettify sh %}
gen_snapshot [<options>] --snapshot=<out_file>
{% endprettify %}

次の _オプション_ が利用できます

<table class="table">
  <tr style="text-align:left">
    <th>利用可能なオプション</th> <th>概要</th>
  </tr>
  <tr>
    <td class="nowrap">
      --package_root=<em>path</em>
    </td>
    <td>
      import(<code>import 'package:...'</code>)で
      使ってるパッケージの場所を指定します
    </td>
  </tr>
  <tr>
    <td class="nowrap">
      --url_mapping=<em>mapping</em>
    </td>
    <td>
      ライブラリのimportの際のURI解決のために、
      コマンドライン上でのURLのマッピングを提供します
    </td>
  </tr>
</table>


## まとめ

スナップショットについてもっと詳しく知りたい場合や、
どのように実装されてるか知りたい場合は、
[runtime/vm directory](https://github.com/dart-lang/sdk/tree/master/runtime/vm) のファイルを見てみてください。
まずは [snapshot.h](https://github.com/dart-lang/sdk/blob/master/runtime/vm/snapshot.h)の
"Snapshot"を探すところから初めてみてください。
コードは実装上の都合で移動されるかもしれませんので注意してください。

