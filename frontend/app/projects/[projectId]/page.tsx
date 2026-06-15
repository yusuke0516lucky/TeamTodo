"use client";
import { useState, useEffect, Fragment } from "react";
import { useParams } from "next/navigation";
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
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskError, setTaskError] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

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
      return true;
    } catch {
      setError("通信に失敗しました。");
      return false;
    } finally {
      setLoading(false);
    }
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
                                    <p>{task.title}</p>
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
