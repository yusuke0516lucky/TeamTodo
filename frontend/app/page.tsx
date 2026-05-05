"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("未確認");
  const [error, setError] = useState("");

  const apiConfirm = async () => {
    setError("");
    try {
      const response = await fetch("http://localhost:4000/health");
      const data = await response.json();
      setMessage(data.message);
    } catch {
      setError("API接続確認に失敗しました。");
    }
  };
  return (
    <>
      <h1>疎通確認</h1>
      <button onClick={apiConfirm}>API確認</button>
      <p>結果: {message}</p>
      {error && <p>{error}</p>}
    </>
  );
}
