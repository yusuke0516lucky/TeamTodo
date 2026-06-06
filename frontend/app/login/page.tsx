"use client";
import { type SubmitEventHandler, useState } from "react";
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
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    await login(email, password);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>メールアドレス</label>
          <input
            type="email"
            id="email"
            value={email}
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>パスワード</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>}
        <button type="submit">ログイン</button>
      </form>
      {user !== null && (
        <>
          <p>{user.username}</p>
          <p>{user.email}</p>
        </>
      )}
    </>
  );
}
