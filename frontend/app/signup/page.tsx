"use client";
import { type SubmitEventHandler, useState } from "react";
import Link from "next/link";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const signup = async (username: string, email: string, password: string) => {
    setMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message);
        return;
      }
    } catch {
      setError("通信に失敗しました。");
      return;
    }
    setMessage("サインアップに成功しました。");
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
    return;
  };
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    await signup(username, email, password);
  };
  return (
    <main className="mx-auto max-w-md space-y-6 px-6 py-8">
      <section className="space-y-4 rounded border p-5">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">サインアップ</h1>
          <p>アカウントを作成して TeamTodo を利用します。</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">ユーザーネーム</label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full rounded border px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full rounded border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full rounded border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="rounded border border-red-300 bg-red-50 p-3 font-medium text-red-700">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded border border-green-300 bg-green-50 p-3 font-medium text-green-700">
              {message}
            </p>
          )}
          <button
            type="submit"
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            サインアップ
          </button>
        </form>
      </section>

      <p className="text-sm">
        すでにアカウントをお持ちの方は
        <Link href="/login" className="ml-1 underline">
          ログイン
        </Link>
      </p>
    </main>
  );
}
