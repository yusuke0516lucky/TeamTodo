import express, { type Request, type Response } from "express";
import cors from "cors";
import prisma from "./lib/prisma.js";
import bcrypt from "bcrypt";

type SignupRequestBody = {
    email: string;
    password: string;
    username: string;
}

const app = express();
const PORT = 4000;
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
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
        username: newUser.username });
    } catch(e: unknown) {
        console.error(e);
        return res.status(500).json({ message: "通信に失敗しました。" });
    }
});

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