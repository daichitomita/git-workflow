---
name: commit-convention
description: >
  git コミット用の Conventional Commits メッセージフォーマット。
  変更をコミットする際に使用する。diff を分析してコミットの
  タイプ、スコープ、説明を自動的に決定する。
user-invocable: false
---

# Conventional Commits フォーマット

## メッセージフォーマット

```
<type>(<scope>): <description>
```

スコープなしの場合:

```
<type>: <description>
```

## diff からのタイプ決定

`git diff --staged` を分析してタイプを決定する:

| diff のパターン | type |
|----------------|------|
| 機能的なコードを含む新規ファイル | `feat` |
| 新しい関数、クラス、エンドポイント、コンポーネント | `feat` |
| 条件分岐、エラーハンドリング、エッジケースの修正 | `fix` |
| .md またはドキュメントファイルのみの変更 | `docs` |
| 空白文字、フォーマット、セミコロンのみの変更 | `style` |
| 動作を変えないコード構造の変更 | `refactor` |
| テストファイルの追加・修正（*test*, *spec*） | `test` |
| package.json、Makefile、設定ファイル、Dockerfile の変更 | `chore` |
| アルゴリズムの最適化、キャッシュ、クエリチューニング | `perf` |
| .github/workflows/、CI 設定ファイルの変更 | `ci` |
| 以前のコミットのリバート | `revert` |

複数のタイプが該当する場合は、変更の主目的に合ったタイプを使用する。

## スコープの決定

1. 変更が1つのディレクトリ/モジュールに集中している場合 → その名前を使用する
   - `src/auth/` → スコープ: `auth`
   - `components/Button/` → スコープ: `button`
   - `api/users/` → スコープ: `users`
2. 変更が複数の無関係な領域にまたがる場合 → スコープを省略する
3. スコープ名は短くする: `auth`, `api`, `ui`, `db`, `config`

## 説明のルール

- 英語の命令形: add, fix, update, remove, implement, refactor
- 小文字で始める
- 末尾にピリオドをつけない
- 絵文字を使用しない
- 最大50文字（理想は30〜40文字）
- 変更が何をするかを記述する（何をしたかではない）

良い例:
- `feat(auth): add JWT token validation`
- `fix: resolve null pointer in user lookup`
- `docs: update API endpoint documentation`

悪い例:
- `feat: updated the code`（過去形、曖昧）
- `fix: Fixed bug`（過去形、大文字始まり、曖昧）
- `feat: :sparkles: add feature`（絵文字）

## コミット分割の基準

以下の場合は複数のコミットに分割する:
- バグ修正と新機能の両方が含まれている
- 無関係な機能領域にまたがる変更がある
- 異なる理由で10以上のファイルが変更されている
- テストの変更と実装の変更が混在している

分割の手順:
1. `git restore --staged .` ですべてのステージングを解除（作業ツリーの変更は保持される）
2. `git add <related-files>` で最初の論理グループをステージング
3. `git commit -m "<type>(<scope>): <description>"`
4. 各論理グループに対して繰り返す

## 重要事項

- `Co-Authored-By` ヘッダーは絶対に追加しない -- Claude Code が自動的に付与する
- 1コミット = 1つの論理的な変更
- 大きな多目的コミットよりも、小さく焦点を絞ったコミットを優先する
