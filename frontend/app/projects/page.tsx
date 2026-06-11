"use client";
import { useState, useEffect, Fragment } from "react";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError("");
    setLoading(true);
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
    getProjects();
  }, []);

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
