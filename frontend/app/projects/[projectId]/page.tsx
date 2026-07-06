"use client";
import { useState, useEffect, type SubmitEventHandler } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
type Project = {
  id: string;
  projectName: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
};
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
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProjectDetailPage() {
  //プロジェクト用state
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //タスク取得用state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskError, setTaskError] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  //タスク作成用state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [createTaskError, setCreateTaskError] = useState("");
  const [createTaskMessage, setCreateTaskMessage] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  //メンバー一覧用ステート
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");

  //メンバー追加用ステート
  const [memberEmail, setMemberEmail] = useState("");
  const [addMemberError, setAddMemberError] = useState("");
  const [addMemberMessage, setAddMemberMessage] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  //プロジェクト更新用state
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [updateProjectError, setUpdateProjectError] = useState("");
  const [updateProjectMessage, setUpdateProjectMessage] = useState("");
  const [updatingProject, setUpdatingProject] = useState(false);

  //プロジェクト削除用state
  const [deleteProjectError, setDeleteProjectError] = useState("");
  const [deletingProject, setDeletingProject] = useState(false);

  //未ログイン状態state
  const [authRequired, setAuthRequired] = useState(false);

  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId;

  useEffect(() => {
    setError("");

    const loadProjectDetail = async () => {
      if (typeof projectId !== "string") {
        setError("プロジェクト詳細URLが不正です。");
        setLoading(false);
        return;
      }
      setLoading(true);
      const isProjectLoaded = await getProject(projectId);
      if (isProjectLoaded === false) {
        return;
      }
      await getTasks(projectId);
      await getMembers(projectId);
    };
    loadProjectDetail();
  }, [projectId]);

  //プロジェクト詳細の取得
  const getProject = async (projectId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/projects/${projectId}`, {
        method: "GET",
        credentials: "include",
      });
      const result = await response.json();
      if (response.status === 401) {
        setAuthRequired(true);
        return false;
      }
      if (!response.ok) {
        setError(result.message);
        return false;
      }
      setProject(result);
      setEditProjectName(result.projectName);
      setEditProjectDescription(result.description ?? "");
      setAuthRequired(false);

      return true;
    } catch {
      setError("通信に失敗しました。");
      return false;
    } finally {
      setLoading(false);
    }
  };

  //プロジェクト更新フォーム
  const updateProject = async (projectId: string) => {
    setUpdateProjectError("");
    setUpdateProjectMessage("");
    const trimmedEditProjectName = editProjectName.trim();

    if (trimmedEditProjectName.length === 0) {
      setUpdateProjectError("プロジェクト名が空です。");
      return;
    }
    setUpdatingProject(true);
    try {
      const response = await fetch(`${apiBaseUrl}/projects/${projectId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: trimmedEditProjectName,
          description: editProjectDescription,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setUpdateProjectError(result.message);
        return;
      }
      setProject(result);
      setEditProjectName(result.projectName);
      setEditProjectDescription(result.description ?? "");
      setUpdateProjectMessage("プロジェクトの更新に成功しました。");
    } catch {
      setUpdateProjectError("通信に失敗しました。");
      return;
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleUpdateProject: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    if (typeof projectId !== "string") {
      setUpdateProjectError("プロジェクト詳細URLが不正です。");
      return;
    }
    await updateProject(projectId);
  };

  //タスク作成フォーム
  const createTask = async (title: string, description: string | null) => {
    setCreateTaskError("");
    setCreateTaskMessage("");
    const trimmedTaskTitle = title.trim();
    const trimmedTaskDescription = description?.trim();
    if (typeof projectId !== "string") {
      setCreateTaskError("プロジェクト詳細URLが不正です。");
      return;
    }

    setCreatingTask(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/tasks`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: trimmedTaskTitle,
            description: trimmedTaskDescription,
          }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setCreateTaskError(result.message);
        return;
      }
      setCreateTaskMessage("タスクの作成に成功しました。");
      setTaskTitle("");
      setTaskDescription("");
      setCreateTaskError("");
      await getTasks(projectId);
      return;
    } catch {
      setCreateTaskError("通信に失敗しました。");
      return;
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCreateTask: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    setCreateTaskMessage("");
    if (!taskTitle || taskTitle.trim().length === 0) {
      setCreateTaskError("タスク名が空です。");
      return;
    }
    await createTask(taskTitle, taskDescription);
  };

  //タスク一覧の取得
  const getTasks = async (projectId: string) => {
    setTaskError("");
    setTaskLoading(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/tasks`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setTaskError(result.message);
        return;
      }
      setTasks(result.tasks);
    } catch {
      setTaskError("通信に失敗しました。");
      return;
    } finally {
      setTaskLoading(false);
    }
  };

  //プロジェクト削除機能
  const deleteProject = async () => {
    setDeleteProjectError("");
    if (typeof projectId !== "string") {
      setDeleteProjectError("プロジェクト詳細URLが不正です。");
      return;
    }
    const confirmed = window.confirm("本当にこのプロジェクトを削除しますか？");
    if (!confirmed) {
      return;
    }
    setDeletingProject(true);
    try {
      const response = await fetch(`${apiBaseUrl}/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        setDeleteProjectError(result.message);
        return;
      }
      router.push(`/projects`);
    } catch {
      setDeleteProjectError("通信に失敗しました。");
      return;
    } finally {
      setDeletingProject(false);
    }
  };

  //メンバー取得機能
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
      return;
    } finally {
      setMemberLoading(false);
    }
  };

  const addMember = async (memberEmail: string) => {
    setAddMemberError("");
    setAddMemberMessage("");
    if (typeof projectId !== "string") {
      setAddMemberError("プロジェクト詳細URLが不正です。");
      return;
    }
    const trimmedMemberEmail = memberEmail.trim();
    if (trimmedMemberEmail.length === 0) {
      setAddMemberError("メールアドレスが空です。");
      return;
    }
    setAddingMember(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${projectId}/members`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmedMemberEmail,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setAddMemberError(result.message);
        return;
      }
      setMemberEmail("");
      setAddMemberMessage("メンバーの追加に成功しました。");
      await getMembers(projectId);
    } catch {
      setAddMemberError("通信に失敗しました。");
      return;
    } finally {
      setAddingMember(false);
    }
  };

  const handleAddMember: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    await addMember(memberEmail);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      {loading ? (
        <p className="rounded border p-4">読み込み中...</p>
      ) : (
        <>
          {authRequired ? (
            <section className="space-y-4 rounded border border-red-300 bg-red-50 p-5">
              <h1 className="text-2xl font-bold text-red-700">
                ログインが必要です
              </h1>
              <p className="font-medium text-red-700">
                プロジェクト詳細を表示するにはログインして下さい。
              </p>
              <Link
                href="/login"
                className="inline-block rounded border border-red-300 bg-white px-4 py-2 font-medium text-red-700"
              >
                ログイン画面へ
              </Link>
            </section>
          ) : (
            <>
              {error ? (
                <p className="rounded border border-red-300 bg-red-50 p-4 font-medium text-red-700">
                  {error}
                </p>
              ) : (
                <>
                  {project === null ? (
                    <p className="rounded border p-4">
                      プロジェクトが見つかりません。
                    </p>
                  ) : (
                    <>
                      <Link
                        href="/projects"
                        className="inline-block text-sm underline"
                      >
                        ← プロジェクト一覧へ戻る
                      </Link>

                      <h1 className="text-2xl font-bold">プロジェクト詳細</h1>

                      <section className="space-y-4 rounded border p-5">
                        <h2 className="text-lg font-semibold">基本情報</h2>
                        <p>{project.projectName}</p>
                        {!project.description ? (
                          <p>説明なし</p>
                        ) : (
                          <p>{project.description}</p>
                        )}
                        <p>
                          作成日：
                          {new Date(project.createdAt).toLocaleDateString(
                            "ja-JP",
                          )}
                        </p>
                      </section>

                      <section className="space-y-4 rounded border p-5">
                        <h2 className="text-lg font-semibold">
                          プロジェクトを編集
                        </h2>
                        <form
                          onSubmit={handleUpdateProject}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block font-medium">
                              プロジェクトタイトル
                            </label>
                            <input
                              type="text"
                              id="editProjectName"
                              name="editProjectName"
                              className="w-full rounded border px-3 py-2"
                              value={editProjectName}
                              onChange={(e) =>
                                setEditProjectName(e.target.value)
                              }
                              required
                            />
                          </div>

                          <div>
                            <label className="block font-medium">
                              プロジェクト説明文
                            </label>
                            <input
                              type="text"
                              id="editProjectDescription"
                              name="editProjectDescription"
                              className="w-full rounded border px-3 py-2"
                              value={editProjectDescription}
                              onChange={(e) =>
                                setEditProjectDescription(e.target.value)
                              }
                            />
                          </div>

                          {updateProjectError && (
                            <p className="rounded border border-red-300 bg-red-50 p-3 font-medium text-red-700">
                              {updateProjectError}
                            </p>
                          )}
                          {updateProjectMessage && (
                            <p className="rounded border border-green-300 bg-green-50 p-3 font-medium text-green-700">
                              {updateProjectMessage}
                            </p>
                          )}
                          <button
                            type="submit"
                            disabled={updatingProject}
                            className="rounded border px-4 py-2 disabled:opacity-50"
                          >
                            {updatingProject
                              ? "プロジェクト更新中..."
                              : "プロジェクトを更新する"}
                          </button>
                        </form>
                      </section>

                      <section className="space-y-4 rounded border border-red-300 bg-red-50 p-5">
                        <h2 className="text-lg font-semibold text-red-700">
                          危険な操作
                        </h2>
                        {deleteProjectError && (
                          <p className="rounded border border-red-300 bg-white p-3 font-medium text-red-700">
                            {deleteProjectError}
                          </p>
                        )}
                        <button
                          onClick={deleteProject}
                          disabled={deletingProject}
                          className="rounded border border-red-600 px-4 py-2 font-medium text-red-700 disabled:opacity-50"
                        >
                          {deletingProject
                            ? "プロジェクトを削除中..."
                            : "プロジェクトを削除する"}
                        </button>
                      </section>

                      <section className="space-y-4 rounded border p-5">
                        <h2 className="text-lg font-semibold">メンバー</h2>
                        {memberLoading ? (
                          <p className="rounded border p-3">
                            メンバー読み込み中...
                          </p>
                        ) : (
                          <>
                            {memberError ? (
                              <p className="rounded border border-red-300 bg-red-50 p-3 font-medium text-red-700">
                                {memberError}
                              </p>
                            ) : (
                              <>
                                {members.length === 0 ? (
                                  <p className="rounded border p-3">
                                    メンバーが見つかりません。
                                  </p>
                                ) : (
                                  <div className="space-y-3">
                                    {members.map((member) => {
                                      return (
                                        <div
                                          key={member.id}
                                          className="rounded border p-3"
                                        >
                                          <p>{member.username}</p>
                                          <p>{member.email}</p>
                                          <p>{member.id}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}

                        <form onSubmit={handleAddMember} className="space-y-4">
                          <div>
                            <label className="block font-medium">
                              メンバーメールアドレス
                            </label>
                            <input
                              type="email"
                              id="memberEmail"
                              name="memberEmail"
                              className="w-full rounded border px-3 py-2"
                              value={memberEmail}
                              onChange={(e) => setMemberEmail(e.target.value)}
                              required
                            />
                          </div>
                          {addMemberError && (
                            <p className="rounded border border-red-300 bg-red-50 p-3 font-medium text-red-700">
                              {addMemberError}
                            </p>
                          )}
                          {addMemberMessage && (
                            <p className="rounded border border-green-300 bg-green-50 p-3 font-medium text-green-700">
                              {addMemberMessage}
                            </p>
                          )}
                          <button
                            type="submit"
                            disabled={addingMember}
                            className="rounded border px-4 py-2 disabled:opacity-50"
                          >
                            {addingMember ? "追加中..." : "追加する"}
                          </button>
                        </form>
                      </section>

                      <section className="space-y-4 rounded border p-5">
                        <h2 className="text-lg font-semibold">タスクを作成</h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                          <div>
                            <label className="block font-medium">
                              タスクタイトル
                            </label>
                            <input
                              type="text"
                              id="taskTitle"
                              name="taskTitle"
                              className="w-full rounded border px-3 py-2"
                              value={taskTitle}
                              onChange={(e) => setTaskTitle(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block font-medium">説明文</label>
                            <input
                              type="text"
                              id="taskDescription"
                              name="taskDescription"
                              className="w-full rounded border px-3 py-2"
                              value={taskDescription}
                              onChange={(e) =>
                                setTaskDescription(e.target.value)
                              }
                            />
                          </div>
                          {createTaskError && (
                            <p className="rounded border border-red-300 bg-red-50 p-3 font-medium text-red-700">
                              {createTaskError}
                            </p>
                          )}
                          {createTaskMessage && (
                            <p className="rounded border border-green-300 bg-green-50 p-3 font-medium text-green-700">
                              {createTaskMessage}
                            </p>
                          )}
                          <button
                            type="submit"
                            disabled={creatingTask}
                            className="rounded border px-4 py-2 disabled:opacity-50"
                          >
                            {creatingTask ? "作成中..." : "作成する"}
                          </button>
                        </form>
                      </section>

                      <section className="space-y-4 rounded border p-5">
                        <h2 className="text-lg font-semibold">タスク一覧</h2>
                        {taskLoading ? (
                          <p className="rounded border p-3">
                            タスク読み込み中...
                          </p>
                        ) : (
                          <>
                            {taskError ? (
                              <p className="rounded border border-red-300 bg-red-50 p-3 font-medium text-red-700">
                                {taskError}
                              </p>
                            ) : (
                              <>
                                {tasks.length === 0 ? (
                                  <p className="rounded border p-3">
                                    タスクがありません。
                                  </p>
                                ) : (
                                  <div className="space-y-3">
                                    {tasks.map((task) => {
                                      return (
                                        <div
                                          key={task.id}
                                          className="rounded border p-3"
                                        >
                                          <Link
                                            href={`/projects/${task.projectId}/tasks/${task.id}`}
                                            className="font-medium underline"
                                          >
                                            {task.title}
                                          </Link>
                                          {task.description === null ? (
                                            <p>説明なし</p>
                                          ) : (
                                            <p>{task.description}</p>
                                          )}
                                          <p>{task.status}</p>
                                          <p>
                                            作成日：
                                            {new Date(
                                              task.createdAt,
                                            ).toLocaleDateString("ja-JP")}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </section>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
