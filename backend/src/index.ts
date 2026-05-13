import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import prisma from "./lib/prisma.js";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";


declare module "express-session" {
    interface SessionData {
        userId?: string;
    }
}
//サインアップリクエスト
type SignupRequestBody = {
    email: string;
    password: string;
    username: string;
}
//ログインリクエスト
type LoginRequestBody = {
    email: string;
    password: string;
}
//プロジェクトリクエスト(ボディ)
type ProjectRequestBody = {
    projectName: string;
    description?: string;
}
//プロジェクトリクエスト(パラメータ)
type ProjectParams = {
    projectId: string;
}
//プロジェクトアップデート(ボディ)
type ProjectUpdateRequestBody = {
    projectName?: string;
    description?: string | null;
}
const PostgresStore = connectPgSimple(session);

const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET が設定されていません。")
}

const app = express();
const PORT = 4000;
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(session({
    store: new PostgresStore({
        pool: pgPool,
        createTableIfMissing: true,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, 
        sameSite: "lax",
    },
}));

app.post("/signup", async (req: Request<{}, {}, SignupRequestBody>, res: Response) => {
    const { email, password, username } = req.body;
    if (!email || email.trim().length === 0) {
        return res.status(400).json({ message: "メールアドレスが入っていません。" });
    }
    if (!password || password.trim().length === 0) {
        return res.status(400).json({ message: "パスワードが入っていません。" });
    }
    if (!username || username.trim().length === 0) {
        return res.status(400).json({ message: "ユーザー名が入っていません。" });
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedUsername = username.trim();

    try {
    const existingUser = await prisma.user.findUnique({
        where: { email: trimmedEmail }
    });
    if (existingUser) {
        return res.status(409).json({ message: "このメールアドレスは登録済みです。" });
    }
    const passwordHash = await bcrypt.hash(trimmedPassword, 10);
    const newUser = await prisma.user.create({
            data: {
                email: trimmedEmail,
                passwordHash,
                username: trimmedUsername,
            }
        });
    
    return res.status(201).json({ 
        message: "ユーザーの作成に成功しました。", 
        id: newUser.id,
        email: newUser.email, 
        username: newUser.username
     });
    } catch(e: unknown) {
        console.error(e);
        return res.status(500).json({ message: "通信に失敗しました。" });
    }
});

app.post("/login", async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    const { email, password } = req.body;
    if (!email ||  email.trim().length === 0) {
        return res.status(400).json({ message: "メールアドレスが入っていません。" })
    }
    if (!password || password.trim().length === 0) {
        return res.status(400).json({ message: "パスワードが入っていません。" })
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: trimmedEmail } 
        });
        if (!existingUser) {
            return res.status(401).json({ message: "メールアドレスまたはパスワードが正しくありません。" })
        }
        const isMatch = await bcrypt.compare(trimmedPassword, existingUser.passwordHash)
        if (!isMatch) {
            return res.status(401).json({ message: "メールアドレスまたはパスワードが正しくありません。" })
        }
        req.session.userId = existingUser.id;
        return res.status(200).json({
            message: "ログインに成功しました。",
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username
            });
    } catch(e: unknown) {
        console.error(e);
        return res.status(500).json({ message: "通信に失敗しました。" })
    }
});

app.get("/me", async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ message: "ログインしていません。" })
    }
    try {

    
        const currentUser = await prisma.user.findUnique({
            where: { id: userId }
        })
        if (!currentUser) {
            return res.status(401).json({ message: "ユーザーが見つかりません。" })
        }
        return res.json({
            message: "ログイン中のユーザー情報を取得しました。",
            id: currentUser.id,
            email: currentUser.email,
            username: currentUser.username
        })
    } catch(e: unknown) {
        console.error(e);
        return res.status(500).json({ message: "通信に失敗しました。" })
    }
})

app.post("/logout", (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ message: "ログインしていません。" });
    }
    req.session.destroy((error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "ログアウトに失敗しました。" });
        }
        return res.status(200).json({ message: "ログアウトに成功しました。" })
    })
})

app.post("/projects", async (req: Request<{}, {}, ProjectRequestBody>, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ message: "ログインしていません。" });
    }
    const { projectName, description } = req.body;
    if (!projectName || projectName.trim().length === 0) {
        return res.status(400).json({ message: "プロジェクト名が入っていません。" })
    }

    const trimmedProjectName = projectName.trim();
    const trimmedDescription = description?.trim();
    try {
        const newProject = await prisma.project.create({
        data: {
            projectName: trimmedProjectName, 
            ownerId: userId,
            ...(trimmedDescription ? { description: trimmedDescription } : {})
            }
        });
        return res.status(201).json({
            message: "プロジェクトの作成に成功しました。",
            id: newProject.id,
            projectName: newProject.projectName,
            description: newProject.description,
            ownerId: newProject.ownerId,
        });
    } catch(e: unknown) {
        console.error(e);
        return res.status(500).json({ message: "通信に失敗しました。" })
    }

})

app.get("/projects", async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ message: "ログインしていません。" });
    }
    try {
        const myProjects = await prisma.project.findMany({
            where: {
                ownerId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
        return res.json({
            message: "プロジェクトの取得に成功しました。",
            projects: myProjects
        })
    } catch(e: unknown) {
        console.error(e);
        return res.status(500).json({ message: "通信に失敗しました。" })
    }
    

    
})

app.get("/projects/:projectId", async (req: Request<ProjectParams>, res: Response) => {
    const userId = req.session.userId;
    const projectId = req.params.projectId;
    if (!userId) {
        return res.status(401).json({ message: "ログインしていません。" })
    }
    try {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })
        if (!project) {
            return res.status(404).json({ message: "プロジェクトが存在しません。" })
        }
        if (userId !== project.ownerId) {
            return res.status(403).json({ message: "プロジェクトを閲覧する権限がありません。" })
        }
        return res.json({
            message: "プロジェクト詳細の取得に成功しました。",
            id: project.id,
            projectName: project.projectName,
            description: project.description,
            ownerId: project.ownerId,
            createdAt: project.createdAt,
        })
    } catch (e: unknown) {
        console.error(e);
        return res.status(500).json({ message: "通信に失敗しました。" })
    }
    
})

app.patch("/projects/:projectId", async (req:Request<ProjectParams, {}, ProjectUpdateRequestBody>, res: Response) => {
    const userId = req.session.userId;
    const projectId = req.params.projectId;
    const { projectName, description } = req.body;
    if (!userId) {
        return res.status(401).json({ message: "ログインしていません。" });
    }
    
    const hasProjectName = projectName !== undefined;
    const hasDescription = description !== undefined;
    
    if (!hasProjectName && !hasDescription) {
        return res.status(400).json({ message: "更新項目が未入力です。" })
    }

    const updateData: ProjectUpdateRequestBody = {};

    if (hasProjectName) {
        const trimmedProjectName = projectName.trim();
        if (trimmedProjectName.length === 0) {
            return res.status(400).json({ message: "プロジェクト名が空です。" });
        }
        updateData.projectName = trimmedProjectName;
    }
    if (hasDescription) {
        if (description === null) {
            updateData.description = null;
        } else {
            const trimmedDescription = description.trim();
            updateData.description = trimmedDescription.length === 0 ? null : trimmedDescription;
        }
    }
    try {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
            }
        })
        if (!project) {
            return res.status(404).json({ message: "プロジェクトが存在しません。" })
        }
        if (userId !== project.ownerId) {
            return res.status(403).json({ message: "プロジェクトを編集する権限がありません。" })
        }
        
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: updateData,
        })
        return res.json({
            message: "プロジェクトの更新に成功しました。",
            id: updatedProject.id,
            projectName: updatedProject.projectName,
            description: updatedProject.description,
            ownerId: updatedProject.ownerId,
            createdAt: updatedProject.createdAt,

        });
    } catch(e: unknown) {
        console.error(e);
        return res.status(500).json({ message: "通信に失敗しました。" });
    }
})

app.delete("/projects/:projectId", async(req: Request<ProjectParams>, res: Response) => {
    const userId = req.session.userId;
    const projectId = req.params.projectId;

    if (!userId) {
        return res.status(401).json({ message: "ログインしていません。" })
    }

    try {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })
        if (!project) {
            return res.status(404).json({ message: "プロジェクトが存在しません。" });
        }
        if (userId !== project.ownerId) {
            return res.status(403).json({ message: "プロジェクトを削除する権限がありません。" })
        }
        //トランザクション
        const [deleteTaskResult, deleteProjectMemberResult, deleteProjectResult] = await prisma.$transaction([
            prisma.task.deleteMany({ where: { projectId } }),
            prisma.projectMember.deleteMany({ where: { projectId } }),
            prisma.project.delete({ where: { id: projectId } }),
        ])
        return res.json({ message: "削除に成功しました。", id: deleteProjectResult.id });

    } catch(e: unknown) {
        console.error(e);
        return res.status(500).json({ message: "通信に失敗しました。" })
    }
})

app.get("/health", (_req, res) => {
    return res.json({ message: "正しく接続できています。" });
})

app.get("/db-health", async (_req, res) => {
    try {
        const userCount = await prisma.user.count();
        return res.json({ message: "DBに正しく接続できています。", userCount });
    } catch (e: unknown) {
        console.error(e);
        return res.status(500).json({ message: "DBの接続に失敗しました。" });
    }
})

app.listen(PORT, () => {
    console.log(`正しく動いています。ポート番号：${PORT}`);
});