"use client";
import { useState, useEffect, Fragment, type SubmitEventHandler } from "react";
import { useParams } from "next/navigation";
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

  const params = useParams();
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
      if (!response.ok) {
        setError(result.message);
        return false;
      }
      setProject(result);
      setEditProjectName(result.projectName);
      setEditProjectDescription(result.description ?? "");
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
    <>
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          {error ? (
            <p>{error}</p>
          ) : (
            <>
              {project === null ? (
                <p>プロジェクトが見つかりません。</p>
              ) : (
                <>
                  <p>{project.projectName}</p>
                  {!project.description ? (
                    <p>説明なし</p>
                  ) : (
                    <p>{project.description}</p>
                  )}
                  <p>
                    作成日：
                    {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                  <form onSubmit={handleUpdateProject}>
                    <div>
                      <label>プロジェクトタイトル</label>
                      <input
                        type="text"
                        id="editProjectName"
                        name="editProjectName"
                        value={editProjectName}
                        onChange={(e) => setEditProjectName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label>プロジェクト説明文</label>
                      <input
                        type="text"
                        id="editProjectDescription"
                        name="editProjectDescription"
                        value={editProjectDescription}
                        onChange={(e) =>
                          setEditProjectDescription(e.target.value)
                        }
                      />
                    </div>

                    {updateProjectError && <p>{updateProjectError}</p>}
                    {updateProjectMessage && <p>{updateProjectMessage}</p>}
                    <button type="submit" disabled={updatingProject}>
                      {updatingProject
                        ? "プロジェクト更新中..."
                        : "プロジェクトを更新する"}
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
                              {members.map((member) => {
                                return (
                                  <Fragment key={member.id}>
                                    <p>{member.username}</p>
                                    <p>{member.email}</p>
                                    <p>{member.id}</p>
                                  </Fragment>
                                );
                              })}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                  <form onSubmit={handleAddMember}>
                    <div>
                      <label>メンバーメールアドレス</label>
                      <input
                        type="email"
                        id="memberEmail"
                        name="memberEmail"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        required
                      />
                    </div>
                    {addMemberError && <p>{addMemberError}</p>}
                    {addMemberMessage && <p>{addMemberMessage}</p>}
                    <button type="submit" disabled={addingMember}>
                      {addingMember ? "追加中..." : "追加する"}
                    </button>
                  </form>
                  <form onSubmit={handleCreateTask}>
                    <div>
                      <label>タスクタイトル</label>
                      <input
                        type="text"
                        id="taskTitle"
                        name="taskTitle"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label>説明文</label>
                      <input
                        type="text"
                        id="taskDescription"
                        name="taskDescription"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                      />
                    </div>
                    {createTaskError && <p>{createTaskError}</p>}
                    {createTaskMessage && <p>{createTaskMessage}</p>}
                    <button type="submit" disabled={creatingTask}>
                      {creatingTask ? "作成中..." : "作成する"}
                    </button>
                  </form>
                  {taskLoading ? (
                    <p>タスク読み込み中...</p>
                  ) : (
                    <>
                      {taskError ? (
                        <p>{taskError}</p>
                      ) : (
                        <>
                          {tasks.length === 0 ? (
                            <p>タスクがありません。</p>
                          ) : (
                            <>
                              {tasks.map((task) => {
                                return (
                                  <Fragment key={task.id}>
                                    <Link
                                      href={`/projects/${task.projectId}/tasks/${task.id}`}
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
                                  </Fragment>
                                );
                              })}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
