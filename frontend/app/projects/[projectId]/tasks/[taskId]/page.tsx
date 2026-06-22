"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, type SubmitEventHandler } from "react";

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
  // 詳細取得state
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //更新用state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updating, setUpdating] = useState(false);

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

  const updateTask = async (editTitle: string, editDescription: string) => {
    if (typeof projectId !== "string") {
      setUpdateError("プロジェクト詳細URLが不正です。");
      setTask(null);
      setLoading(false);
      return;
    }
    if (typeof taskId !== "string") {
      setUpdateError("タスク詳細URLが不正です。");
      setTask(null);
      setLoading(false);
      return;
    }
    setUpdateError("");
    setUpdateMessage("");
    setUpdating(true);
    try {
      const trimmedEditTitle = editTitle.trim();
      const trimmedEditDescription = editDescription.trim();
      if (trimmedEditTitle.length === 0) {
        setUpdateError("タイトルが空です。");
        return;
      }
      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/tasks/${taskId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: trimmedEditTitle,
            description: trimmedEditDescription,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setUpdateError(result.message);
        return;
      }
      setTask(result);
      setEditTitle(result.title);
      setEditDescription(result.description ?? "");
      setUpdateMessage("更新に成功しました。");
      return;
    } catch {
      setUpdateError("通信に失敗しました。");
      return;
    } finally {
      setUpdating(false);
    }
  };

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
      setEditTitle(result.title);
      setEditDescription(result.description ?? "");
      return;
    } catch {
      setError("通信に失敗しました。");
      return;
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateTask: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    setUpdateMessage("");
    await updateTask(editTitle, editDescription);
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
                  <form onSubmit={handleUpdateTask}>
                    <div>
                      <label>タスクタイトル</label>
                      <input
                        type="text"
                        id="editTitle"
                        name="editTitle"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>説明文</label>
                      <input
                        type="text"
                        id="editDescription"
                        name="editDescription"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    {updateError && <p>{updateError}</p>}
                    {updateMessage && <p>{updateMessage}</p>}
                    <button type="submit" disabled={updating}>
                      {updating ? "更新中" : "更新する"}
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
