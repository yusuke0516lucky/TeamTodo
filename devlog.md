## 2026-MM-DD

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

## 2026-05-17

### Output

- Task 作成機能

### Key learning

- Task 作成者は User ではなく ProjectMember を参照するため、担当者設定では User.id ではなく ProjectMember.id を使い、対象 Project に所属しているかを確認する必要があるとわかった。

### Next

- Task 一覧取得機能

## 2026-05-23

### Output

- Task 一覧取得機能
- Task 詳細取得機能

### Key learning

- Task 閲覧形APIでは、owner かどうかではなく ProjectMember として対象 Project に所属しているかを確認し、詳細取得では taskId だけでなく projectId も含めることで、別 Project の Task を謝って取得しないようにする必要があるとわかった

### Next

- Task 更新機能

## 2026-05-24

### Output

- Task 更新機能
- Task 削除機能
- Task 担当者設定機能

### Key learning

- Task 操作では、内容更新・削除・担当者設定ごとに認可条件と検証対象が異なり、owner 権限、taskId + projectId による対象確認、ProjectMember.id による担当者検証をそれぞれ分けて設計する必要があるとわかった。

### Next

- Task ステータス更新機能

## 2026-05-26

### Output

- Task ステータス更新機能

### Key learning

- owner 権限ではなく Task 担当者本人かどうかで認可し、未担当 Task は誰も更新できないように制御することが重要であるとわかった。

### Next

- Task API 整理

## 2026-05-27

### Output

- Task API の実装状況を整理し、MVP に必要な API が一通り揃っていることを確認した
- design.md にフロントエンド実装順、画面と API の対応、 Cookie セッション利用時の注意点を追記した
- メンバー追加は userId 直接入力でなく、既存ユーザーの email を入力して追加する方針に変更した

### Key learning

- バックエンド API が一通り揃ったあとはすぐに画面実装へ進むのではなく、画面と API の対応・入力方式の方針を整理してから進めることが重要であるとわかった。

### Next

- POST /projects/:projectId/members を userId 受け取りから email 受け取りに変更する

## 2026-05-30

### Output

- POST /projects/:projectId/members を email 受け取りに変更
- プロジェクトメンバーリスト一覧機能

### Key learning

- Task 担当者設定で必要になる ProjectMember.id は、User.id とは別物であるため、フロントから利用できるようにメンバー一覧 API で明示的に返す必要がるとわかった。

### Next

- フロントエンド実装前最終確認
- API 通信基盤の作成

## 2026-06-06

### Output

- frontend/.env.local に　NEXT_PUBLIC_API_BASE_URL を設定した
- ログイン画面を作成し、POST /login をフロントから呼び出せるように実装した
- ログイン成功時に　GET /me を呼び、Cookie セッションが維持されていることを確認した
- POST /logout を呼び出し、ログアウト後に email, password をクリアする処理を実装した

### Key learning

- フロントエンドから Cookie セッション認証を扱う場合、/login の成功だけで判断せず、credentials: "include" を付けた /me の確認まで行うことで、ログイン状態が正しく保持されているかを検証できると分かった。また、/logout 成功後は user state を null に戻すことで、フロント側のログイン状態も同期できると分かった。

### Next

- POST /signup のフロント実装

## 2026-06-07

### Output

- サインアップページ frontend/app/signup/page.tsx　の作成

### Key learning

- フロントエンドのサインアップ処理では、フォーム入力を state で管理しPOST /signup の成功・失敗・通信失敗を分けて扱うことで、バックエンド API と画面状態を安全に接続できるとわかった

### Next

- 認証画面整理

## 2026-06-11

### Output

- Project一覧画面

### Key learning

- Project 一覧画面では、GET /projects のレスポンスに合わせて description を string | null、createdAt を string として扱い、loading・error・空配列・一覧表示を分岐することで、API 取得画面の基本構造を作れるとわかった。

### Next

- Project 作成フォーム

## 2026-06-14

### Output

- Project 作成フォームの実装
- Project 詳細画面の実装

### Key learning

- Next.js App Router の動的ルートでは、URL の projectId を useParams で取得し、string かどうかを確認してから API に渡す必要があるとわかった。

### Next

- Task 一覧を表示する機能

## 2026-06-15

### Output

- Task 一覧を表示する機能

### Key learning

- Project 詳細ページで Task 一覧を表示する際は、Project 詳細の取得に成功してから Task 一覧を取得し、Project 用と Task 用の loading / error を分けて管理することで、不要な API の呼び出しを避けつつ、取得処理ごとの状態を切り分けが可能になることがわかった。

### Next

- Task 作成フォーム

## 2026-06-20

### Output

- Task 作成フォーム

### Key learning

- Task 作成フォームでは、POST /projects/:projectId/tasks の成功時だけ入力欄クリア・成功メッセージ表示・成功メッセージ表示・Task 一覧再取得を行い、creatingTask / createTaskError / createTaskMessage を分けて管理することで、作成処理と一覧取得処理を混同せずに扱えることがわかった

### Next

- Task 詳細取得機能

## 2026-06-22

### Output

- Task 詳細取得機能
- Task 更新機能

### Key learning

- Task 更新フォームでは、GET で取得した Task 情報を画面表示用の task state に入れるだけでなく、編集フォーム用の state にも初期値として反映する必要があるとわかった

### Next

- Task 削除機能

## 2026-06-27

### Output

- ProjectMember 一覧
- ProjectMember 作成フォーム

### Key learning

- ProjectMember 一覧表示とメンバー追加では、User.id ではなく ProjectMember.id を扱う必要があり、追加フォームでは email を送信し、成功後に getMembers(projectId) を再実行することで一覧を最新化できることがわかった

### Next

- Task 担当者設定

## 2026-07-02

### Output

- Task 担当者設定機能

### Key learning

- Task 担当者設定では、担当者として User.id ではなく、ProjectMember.id を送信し、未担当はから文字ではなく null として扱う必要があるとわかった

### Next

- Task ステータス更新機能
