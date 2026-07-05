"use client";
import { useState, useEffect, type SubmitEventHandler } from "react";
import Link from "next/link";
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
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <h1 className="text-2xl font-bold">プロジェクト一覧</h1>

      <section className="space-y-4 rounded border p-5">
        <h2 className="text-lg font-semibold">プロジェクトを作成</h2>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block font-medium">プロジェクトネーム</label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              className="w-full rounded border px-3 py-2"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">説明文</label>
            <input
              type="text"
              id="description"
              name="description"
              className="w-full rounded border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {createError && (
            <p className="rounded border border-red-300 bg-red-50 p-3 font-medium text-red-700">
              {createError}
            </p>
          )}
          {createMessage && (
            <p className="rounded border border-green-300 bg-green-50 p-3 font-medium text-green-700">
              {createMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={creating}
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            {creating ? "作成中..." : "作成する"}
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded border p-5">
        <h2 className="text-lg font-semibold">プロジェクト</h2>
        {loading ? (
          <p className="rounded border p-3">読み込み中</p>
        ) : (
          <>
            {error ? (
              <p className="rounded border border-red-300 bg-red-50 p-3 font-medium text-red-700">
                {error}
              </p>
            ) : (
              <>
                {projects.length === 0 ? (
                  <p className="rounded border p-3">
                    プロジェクトがありません。
                  </p>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project) => {
                      return (
                        <div key={project.id} className="rounded border p-3">
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-medium underline"
                          >
                            {project.projectName}
                          </Link>
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
    </main>
  );
}
