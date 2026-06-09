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
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ユーザーネーム</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label>メールアドレス</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>パスワード</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>}
        {message && <p>{message}</p>}
        <button type="submit">サインアップ</button>
      </form>
      <Link href="/login">ログイン</Link>
    </>
  );
}
