"use client";
import Link from "next/link";
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <section className="space-y-5 rounded border p-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">TeamTodo</h1>
          <p>チーム単位でプロジェクトとタスクを管理するためのアプリです。</p>
          <p>
            プロジェクト作成、メンバー追加、タスク作成、担当者設定、ステータス更新までを管理できます。
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/login" className="rounded border px-4 py-2">
            ログイン
          </Link>
          <Link href="/signup" className="rounded border px-4 py-2">
            サインアップ
          </Link>
          <Link href="/projects" className="rounded border px-4 py-2">
            プロジェクト一覧へ
          </Link>
        </div>
      </section>

      <section className="space-y-4 rounded border p-6">
        <h2 className="text-xl font-semibold">主な機能</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>ユーザー登録 / ログイン / ログアウト</li>
          <li>プロジェクト作成・一覧・詳細・更新・削除</li>
          <li>プロジェクトメンバー追加</li>
          <li>タスク作成・一覧・詳細・内容更新・削除</li>
          <li>タスク担当者設定・ステータス更新</li>
        </ul>
      </section>
    </main>
  );
}
