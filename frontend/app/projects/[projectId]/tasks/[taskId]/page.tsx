"use client";
import { useParams, useRouter } from "next/navigation";
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

type ProjectMember = {
  id: string;
  userId: string;
  username: string;
  email: string;
};

type Status = "TODO" | "IN_PROGRESS" | "DONE";

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

  //削除用state
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const params = useParams();
  const projectId = params.projectId;
  const taskId = params.taskId;
  const router = useRouter();

  //プロジェクトメンバー用state
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");

  //担当者設定用state
  const [selectedAssigneeProjectMemberId, setSelectedAssigneeProjectMemberId] =
    useState("");
  const [assigneeError, setAssigneeError] = useState("");
  const [assigneeMessage, setAssigneeMessage] = useState("");
  const [assigning, setAssigning] = useState(false);

  //タスクステータス更新用state
  const [selectedStatus, setSelectedStatus] = useState<Status>("TODO");
  const [statusError, setStatusError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
      await getMembers(projectId);
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
      setSelectedAssigneeProjectMemberId(
        result.assigneeProjectMemberId ? result.assigneeProjectMemberId : "",
      );
      setSelectedStatus(result.status);

      return;
    } catch {
      setError("通信に失敗しました。");
      return;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    setDeleteError("");
    if (typeof projectId !== "string") {
      setDeleteError("プロジェクト詳細URLが不正です。");
      return;
    }
    if (typeof taskId !== "string") {
      setDeleteError("タスク詳細URLが不正です。");
      return;
    }
    const confirmed = window.confirm("本当にこのタスクを削除しますか？");
    if (!confirmed) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/tasks/${taskId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setDeleteError(result.message);
        return;
      }
      router.push(`/projects/${projectId}`);
    } catch {
      setDeleteError("通信に失敗しました。");
      return;
    } finally {
      setDeleting(false);
    }
  };

  const getMembers = async (projectId: string) => {
    setMemberError("");
    setMemberLoading(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/members`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setMemberError(result.message);
        return;
      }
      setMembers(result.members);
      return;
    } catch {
      setMemberError("通信に失敗しました。");
    } finally {
      setMemberLoading(false);
    }
  };

  const updateAssignee = async (projectId: string, taskId: string) => {
    setAssigneeError("");
    setAssigneeMessage("");

    const assigneeProjectMemberId =
      selectedAssigneeProjectMemberId === ""
        ? null
        : selectedAssigneeProjectMemberId;
    setAssigning(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/tasks/${taskId}/assignee`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assigneeProjectMemberId,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setAssigneeError(result.message);
        return;
      }
      setTask(result);
      setSelectedAssigneeProjectMemberId(result.assigneeProjectMemberId ?? "");
      setAssigneeMessage(result.message);
    } catch {
      setAssigneeError("通信に失敗しました。");
      return;
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateAssignee: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    if (typeof projectId !== "string") {
      setAssigneeError("プロジェクト詳細URLが不正です。");
      return;
    }
    if (typeof taskId !== "string") {
      setAssigneeError("タスク詳細URLが不正です。");
      return;
    }
    await updateAssignee(projectId, taskId);
  };

  const handleUpdateTask: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    setUpdateMessage("");
    await updateTask(editTitle, editDescription);
  };

  const updateStatus = async (projectId: string, taskId: string) => {
    setStatusError("");
    setStatusMessage("");

    setUpdatingStatus(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/tasks/${taskId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: selectedStatus,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setStatusError(result.message);
        return;
      }
      setTask(result);
      setSelectedStatus(result.status);
      setStatusMessage("ステータスの更新に成功しました。");
    } catch {
      setStatusError("通信に失敗しました。");
      return;
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateStatus: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    if (typeof projectId !== "string") {
      setStatusError("プロジェクト詳細URLが不正です。");
      return;
    }
    if (typeof taskId !== "string") {
      setStatusError("タスク詳細URLが不正です。");
      return;
    }
    await updateStatus(projectId, taskId);
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
                  {memberLoading ? (
                    <p>メンバー読み込み中...</p>
                  ) : (
                    <>
                      {memberError ? (
                        <p>{memberError}</p>
                      ) : (
                        <>
                          {members.length === 0 ? (
                            <p>メンバーが見つかりません。</p>
                          ) : (
                            <>
                              <form onSubmit={handleUpdateAssignee}>
                                <div>
                                  <label>担当者</label>
                                  <select
                                    name="assigneeMember"
                                    value={selectedAssigneeProjectMemberId}
                                    onChange={(e) =>
                                      setSelectedAssigneeProjectMemberId(
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="">未担当</option>
                                    {members.map((member) => {
                                      return (
                                        <option
                                          key={member.id}
                                          value={member.id}
                                        >
                                          {member.username} / {member.email}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>

                                {assigneeError && <p>{assigneeError}</p>}
                                {assigneeMessage && <p>{assigneeMessage}</p>}

                                <button type="submit" disabled={assigning}>
                                  {assigning ? "設定中" : "担当者を設定する"}
                                </button>
                              </form>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                  <form onSubmit={handleUpdateStatus}>
                    <div>
                      <label>ステータス</label>
                      <select
                        name="status"
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(e.target.value as Status)
                        }
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                    </div>

                    {statusError && <p>{statusError}</p>}
                    {statusMessage && <p>{statusMessage}</p>}

                    <button type="submit" disabled={updatingStatus}>
                      {updatingStatus ? "更新中" : "ステータスを更新する"}
                    </button>
                  </form>
                  {deleteError && <p>{deleteError}</p>}
                  <button onClick={deleteTask} disabled={deleting}>
                    {deleting ? "削除中" : "削除する"}
                  </button>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
