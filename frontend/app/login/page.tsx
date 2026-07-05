"use client";
import { type SubmitEventHandler, useState } from "react";
import Link from "next/link";
type LoginUser = {
  id: string;
  email: string;
  username: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<LoginUser | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message);
        return;
      }
      setError("");
      const getMe = await fetch(`${apiBaseUrl}/me`, {
        method: "GET",
        credentials: "include",
      });
      const getMeJson = await getMe.json();
      if (!getMe.ok) {
        setError(getMeJson.message);
        setUser(null);
        return;
      }
      setUser(getMeJson);
      return;
    } catch {
      setError("通信に失敗しました。");
      return;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/logout`, {
        method: "POST",
        credentials: "include",
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
    setUser(null);
    setEmail("");
    setPassword("");
    setError("");
    return;
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    await login(email, password);
  };

  return (
    <main className="mx-auto max-w-md space-y-6 px-6 py-8">
      <section className="space-y-4 rounded border p-5">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p>メールアドレスとパスワードで TeamTodo にログインします。</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              name="email"
              className="w-full rounded border px-3 py-2"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              className="w-full rounded border px-3 py-2"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="rounded border border-red-300 bg-red-50 p-3 font-medium text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            ログイン
          </button>
        </form>
      </section>
      <p className="text-sm">
        アカウントをお持ちでない方は
        <Link href="/signup" className="ml-1 underline">
          サインアップ
        </Link>
      </p>
      {user !== null && (
        <section className="space-y-4 rounded border p-5">
          <h2 className="text-lg font-semibold">ログイン中のユーザー</h2>
          <div>
            <p>{user.username}</p>
            <p>{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            ログアウト
          </button>
          <Link href="/projects" className="inline-block text-sm underline">
            プロジェクト一覧へ進む
          </Link>
        </section>
      )}
    </main>
  );
}
