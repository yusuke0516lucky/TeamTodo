"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
type Project = {
  id: string;
  projectName: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
};
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const projectId = params.projectId;

  useEffect(() => {
    setError("");

    const getProject = async (projectId: string) => {
      try {
        const response = await fetch(`${apiBaseUrl}/projects/${projectId}`, {
          method: "GET",
          credentials: "include",
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.message);
          return;
        }
        setProject(result);
        return;
      } catch {
        setError("通信に失敗しました。");
        return;
      } finally {
        setLoading(false);
      }
    };
    if (typeof projectId !== "string") {
      setError("プロジェクト詳細URLが不正です。");
      setLoading(false);
      return;
    }
    setLoading(true);
    getProject(projectId);
  }, [projectId]);
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
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
