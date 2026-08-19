# micro-tools

追加原価をかけず、小さな検索需要に答えるWebツールを継続的に作り、承認済みの成果報酬案件へ接続するためのプロジェクト。

## 方針

- 1つの無料ホスティング基盤に、ツールごとの独立URLを追加する。
- 候補は検索意図、報酬可能性、既存コンテンツとの相性、競争、維持費、実装容易性で採点する。
- 報酬額は公開情報だけで確定扱いにせず、ASP管理画面で現行条件と提携承認を確認する。
- `offers.json` には承認済み案件だけを入れる。未承認案件のURLがあると検査を失敗させる。
- 成果はクリックではなく、ASP側の承認成果で数える。
- 14日と30日で表示、流入、ツール完了、広告クリック、承認成果を確認し、改善・維持・撤退を決める。

## 毎回の流れ

1. `ideas/backlog.json` に候補と根拠を追加する。
2. `npm run score` で優先順位を出す。
3. `npm run next` で今日作る最上位候補を1件選ぶ。
4. `npm run new -- <slug> "タイトル"` で新しい独立ディレクトリを作る。
5. 実際に役立つ計算・診断を実装する。
6. `npm run check` で広告承認状態、HTML、テスト、配布物を検査する。
7. 公開後に計測し、`ideas/backlog.json` の状態と実績を更新する。
8. `npm run status` で承認件数と承認売上を確認する。

これは定期実行を前提にしない。Codexのgoal継続時に、未処理候補の調査と実装を1件ずつ進める。

## コマンド

```bash
npm run score
npm run next
npm run new -- example-tool "例の計算ツール"
npm run check
npm run status
python3 -m http.server 4173 -d dist
```

公開ツール:

- `sites/freelance-rate-calculator/`: 会社員の額面年収から、同じ手取りを維持するために必要なフリーランス売上、月単価、日単価を概算する。
- `sites/settlement-range-calculator/`: 準委任契約の月額単価、精算幅、実稼働時間から、上下割・中央割の超過控除と当月請求額を概算する。
