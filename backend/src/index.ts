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

type SignupRequestBody = {
    email: string;
    password: string;
    username: string;
}

type LoginRequestBody = {
    email: string;
    password: string;
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
    try {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        return res.status(409).json({ message: "このメールアドレスは登録済みです。" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                username,
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
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email } 
        });
        if (!existingUser) {
            return res.status(401).json({ message: "メールアドレスまたはパスワードが正しくありません。" })
        }
        const isMatch = await bcrypt.compare(password, existingUser.passwordHash)
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
    console.log("sessionID:", req.sessionID);
    console.log("userId:", req.session.userId);
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