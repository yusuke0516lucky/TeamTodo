"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId: string;
  createdBy: string;
  assigneeProjectMemberId: string | null;
  createdAt: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function TaskDetailPage() {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useParams();
  const projectId = params.projectId;
  const taskId = params.taskId;

  useEffect(() => {
    setError("");
    setTask(null);
    const loadTaskDetail = async () => {
      if (typeof projectId !== "string") {
        setError("プロジェクト詳細URLが不正です。");
        setTask(null);
        setLoading(false);
        return;
      }
      if (typeof taskId !== "string") {
        setError("タスク詳細URLが不正です。");
        setTask(null);
        setLoading(false);
        return;
      }
      await getTask(projectId, taskId);
    };
    loadTaskDetail();
  }, [projectId, taskId]);

  const getTask = async (projectId: string, taskId: string) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/tasks/${taskId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setError(result.message);
        return;
      }
      setTask(result);
      return;
    } catch {
      setError("通信に失敗しました。");
      return;
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {loading ? (
        <p>読み込み中</p>
      ) : (
        <>
          {error ? (
            <p>{error}</p>
          ) : (
            <>
              {task === null ? (
                <p>タスクが見つかりません。</p>
              ) : (
                <>
                  <p>{task.title}</p>
                  {!task.description ? (
                    <p>説明なし</p>
                  ) : (
                    <p>{task.description}</p>
                  )}
                  <p>{task.status}</p>
                  <p>
                    作成日：
                    {new Date(task.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
