## YYYY-MM-DD

### Output

- （今日“動いた/増えた”もの。URL/画面/エンドポイント/コマンド結果）

### Key learning

- （学びは1つだけ。具体的に）

### Next

- （次にやることを1つ）

## 2026-05-05

### Output

- frontend に　Next.js アプリを作成し、ローカルで画面表示を確認した。(http://localhost:3000)
- backend に Express + TypeScript の雛形を作成し、 `GET /health` の疎通確認に成功した。
- frontend から backend の API を呼び出し、 CORS 設定後に疎通確認が成功した。
- Docker で PostgreSQL コンテナを起動し、ローカルDB環境を作成した
- Prisma の初期化、schema 定義、 migration 実行を行い、 Express から DB 接続確認に成功した(`GET /db-health`)

### Key learning

- frontend　と　backend　を分離すると、起動・環境構築・API通信先・CORSを別々に意識する必要があると分かった。

### Next

- 認証機能の実装

## 2026-05-06

### Output

- signup の実装
- bcrypt の導入
- バリデーションの追加 / body 型の実装

### Key learning

- signup 実装では、入力チェック・パスワードのハッシュ化・DB保存を一気に書くのではなく、役割ごとに分けて組み立てることが重要。

### Next

- POST /login の実装

## 2026-05-09

### Output

- login 機能の実装
- logout 機能の実装
- express-session の導入
- PostgreSQL セッションストア導入
- session 型拡張

### Key learning

- session 認証は login の実装だけで終わりではなく、 session への保存・me での確認・logout での破棄まで一連で確認することが重要である。

### Next

- プロジェクト機能の実装

## 2026-05-10

### Output

- Project 作成機能
- Project 一覧取得機能 ※Project閲覧機能は現在owner限定の実装となっている←design.mdと設計違い
- Project 詳細取得機能

### Key learning

- Project API では、入力値を受け取るだけでなく、session の userId をownerId として使うことで、認証状態と作成データを正しく結びつける必要があることがわかった。

### Next

- Project 更新
- Project 削除

## 2026-05-11

### Output

- Project 更新機能

### Key learning

- PATCH の更新処理では、必須項目として決め打ちするのではなく、「送られてきた項目だけを更新する」という前提で、未送信・null・文字列を分けて扱う必要があるとわかった。

### Next

- Project 削除

## 2026-05-13

### Output

- Project削除機能

### Key learning

- DELETE API では親データを先に消すのではなく、外部キー制約を意識して子データから順に削除し、それらをトランザクションでまとめる必要があるとわかった。

### Next

- メンバー追加API

## 2026-05-16

### Output

- ProjectMember 追加API実装
- Project 作成時に owner を ProjectMember として同時作成するように修正
- Project 一覧・詳細取得を owner 基準から ProjectMember 基準に変更した

### Key learning

- Project の認可では、ProjectMember を所属・閲覧権限の基準として扱い、編集・削除など owner 権限とは分けて設計する必要があるとわかった。

### Next

- Task 作成機能
