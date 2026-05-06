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
