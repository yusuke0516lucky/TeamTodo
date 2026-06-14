"use client";
import { useState, useEffect, Fragment, type SubmitEventHandler } from "react";
type Project = {
  id: string;
  projectName: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState(""); //GET /projects 用
  const [loading, setLoading] = useState(false); //GET /projects 用
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [createError, setCreateError] = useState(""); //POST /projects 用
  const [createMessage, setCreateMessage] = useState(""); //作成メッセージ
  const [creating, setCreating] = useState(false); //作成中フラグ

  //一覧取得メソッド
  const getProjects = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/projects`, {
        method: "GET",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message);
        return;
      }
      setProjects(result.projects);
      return;
    } catch {
      setError("通信に失敗しました。");
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError("");
    setLoading(true);
    getProjects();
  }, []);

  //プロジェクト作成メソッド
  const createProject = async (projectName: string, description: string) => {
    try {
      const trimmedProjectName = projectName.trim();
      setCreateError("");
      setCreateMessage("");
      const response = await fetch(`${apiBaseUrl}/projects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: trimmedProjectName, description }),
      });
      const result = await response.json();

      if (!response.ok) {
        setCreateError(result.message);
        return;
      }
    } catch {
      setCreateError("通信に失敗しました。");
      return;
    } finally {
      setCreating(false);
    }
    setCreateMessage("プロジェクトの作成に成功しました。");
    setProjectName("");
    setDescription("");
    setLoading(true);
    await getProjects();

    return;
  };

  const handleCreateProject: SubmitEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    setCreateMessage("");
    if (!projectName || projectName.trim().length === 0) {
      setCreateError("プロジェクト名が空です。");
      return;
    }
    setCreating(true);
    await createProject(projectName, description);
  };

  return (
    <>
      <form onSubmit={handleCreateProject}>
        <div>
          <label>プロジェクトネーム</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>説明文</label>
          <input
            type="text"
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {createError && <p>{createError}</p>}
        {createMessage && <p>{createMessage}</p>}
        <button type="submit" disabled={creating}>
          {creating ? "作成中..." : "作成する"}
        </button>
      </form>
      {loading ? (
        <p>読み込み中</p>
      ) : (
        <>
          {error ? (
            <p>{error}</p>
          ) : (
            <>
              {projects.length === 0 ? (
                <p>プロジェクトがありません。</p>
              ) : (
                <>
                  {projects.map((project) => {
                    return (
                      <Fragment key={project.id}>
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
  );
}
