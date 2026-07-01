# kintone-theme-switcher

English version: [README.md](./README.md)

インストールしたアプリのレコード画面に、dark・dim・light・OS連動のテーマを適用するkintoneプラグイン。CSSのテーマを注入し、ユーザーの選択をブラウザに保存する。ネットワークリクエストは発生せず、REST APIも呼ばない。

テーマが効くのは、プラグインを入れたアプリのレコード一覧・詳細・作成・編集の4画面だけ。ポータル、スペース、他のアプリ、kintone共通ヘッダーの先にあるページは通常の配色のまま残る。kintoneプラグインが動作できる範囲による制約であり、回避手段は無い。

## スクリーンショット

TODO: デモアプリで4枚（一覧darkの適用前後、詳細dim、設定画面、切替ボタンの拡大）を撮影して追加する。撮影手順は `docs/release-checklist.md` と要件定義の12章を参照。

## テーマ

- light: kintoneの標準配色。何も適用しない。
- dark: 暗色の配色。
- dim: darkと同じ構成で、明るめのグレー基調。
- auto: OSの設定（`prefers-color-scheme`）に従う。OSがダーク設定ならdark、それ以外はlightになる。autoがdimに解決されることは無い。

## インストール

1. プラグインのzipをビルドする。
   ```
   npm install
   npm run build
   npm run pack
   ```
   `npm run pack` は `dist/plugin.zip` を出力する。`private.ppk` が無い場合は、出力先の隣に新しい秘密鍵が作られる。同じプラグインIDで更新版を公開するために、この `.ppk` ファイルは保管しておく。git管理外であり、コミットしてはいけない。
2. kintoneのシステム設定でプラグインを開き、`dist/plugin.zip` をアップロードする。
3. 対象アプリの設定でプラグインを追加し、「アプリを更新」を実行する。

## 設定

アプリのプラグイン一覧から設定画面を開く。

- 既定テーマ（light / auto / dark / dim）: テーマを切り替えていないユーザーに適用するテーマ。初期値はauto。
- ユーザーによる切り替えの許可（チェックボックス、初期値はオン）: オンにすると、各ユーザーがヘッダーのボタンでテーマを順に切り替えられ、選択はブラウザごとに保存される。オフにすると全ユーザーが既定テーマになり、ボタンも表示されない。保存済みの値は残るため、再度オンにすれば各ユーザーの選択が戻る。
- リッチテキストフィールドの表示（白のまま / 暗色化を試す）: 初期値ではリッチテキストを白いカードのまま表示し、文中の色指定が読める状態を保つ。「暗色化を試す」を選ぶとフィールドを暗くするが、文字色や背景を自分で指定している箇所はそのまま残す。

保存後、アプリ設定画面で「アプリを更新」を実行すると反映される。

## 仕組み

テーマは2層のCSSで構成している。

- `styles/tokens.css` がテーマごとの色を `--kt-*` カスタムプロパティとして定義する。
- `styles/selectors.css` がそのトークンをkintoneのDOMに割り当てる。色のリテラルは持たない。

kintone側のDOMが変わったときに直すのは `styles/selectors.css` と `src/kintone/dom-map.ts` だけで済む。`npm run lint` は、selectors.cssに色リテラルが無いこと、tokens.cssにkintoneのセレクタが無いことを検査する。

一覧画面では、kintoneの一覧テーブルが存在することを確認してから適用する。kintoneの更新で想定した構造が無くなっていた場合、そのページ表示ではテーマを無効にし、コンソールに警告を出して、画面をlightのまま残す。

ユーザーの選択は、autoを含む生の値のまま `localStorage` のキー `kp-kts-<hostname>-<appId>-<userCode>` に `{"version":1,"theme":"dark"}` の形で保存する。解決後のテーマは保存しない。値は表示設定のみ。消すには、ブラウザ設定でkintoneドメインのサイトデータを削除するか、既定テーマに切り替え直す。localStorageが使えない環境（プライベートブラウジング、容量超過、ポリシー制限）でも、切り替えはそのタブ内では動き、再読み込みで既定テーマに戻る。

印刷中と、OSのハイコントラスト（forced colors）モードではテーマを無効にする。レコードは白地で印刷され、システムの配色が尊重される。

## 制限事項

- テーマの範囲は、インストールしたアプリの4つのレコード画面のみ。ポータル、スペース、他のアプリはlightのまま。
- 初回描画時はkintoneが先に白い画面を描くため、白から暗色への切り替わりが最大で数百ミリ秒見えることがある。プラグインはできる限り早くCSSを注入するが、これを隠すために描画をブロックすることはしない。
- 画面単位の適用範囲設定（一覧のみ等）はv1には無い。
- モバイルは非対応。モバイル用スクリプトは同梱していない。
- iframe内のコンテンツ、他のプラグインが描画するDOM、詳細度の高いカスタムCSSで着色された領域は暗くならない。
- kintone本体のヘッダー色設定とは独立して動く。すべての組み合わせでの表示は保証しない。
- 選択はブラウザ・端末ごとに保存される。端末間の同期は無い。

## 開発

```
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest (core logic)
npm run build       # vite, emits dist/desktop.js and dist/config.js
npm run lint        # eslint + CSS layer check
npm run pack        # build then @kintone/plugin-packer -> dist/plugin.zip
```

`test/e2e` のPlaywrightスペックには開発用のkintone環境が必要。`KINTONE_BASE_URL`、`KINTONE_USERNAME`、`KINTONE_PASSWORD`、`KINTONE_APP_ID` を設定して `npx playwright test` を実行する。未設定の場合、E2Eスイートはスキップされる。

## TODO

- `styles/selectors.css` と `src/kintone/dom-map.ts` のkintoneクラス名を、対象のkintoneバージョンで検証する。現行のDOMを追いかけているだけで、安定した契約ではない（要件FR-7）。
- 上記の4枚のスクリーンショットを追加する。
- 開発環境と基準画像がそろい次第、月次のスクリーンショット比較E2Eジョブ（TC-19〜TC-24）を組み込む。

## ライセンス

MIT。`LICENSE` を参照。
