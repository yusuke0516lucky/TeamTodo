import express from "express";
import cors from "cors";
import prisma from "./lib/prisma.js";

const app = express();
const PORT = 4000;

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.get("/health", (_req, res) => {
    res.json({ message: "正しく接続できています。" })
})

app.get("/db-health", async (_req, res) => {
    try {
        const userCount = await prisma.user.count()
        res.json({ message: "DBに正しく接続できています。", userCount })
    } catch (e) {
        res.status(500).json({ message: "DBの接続に失敗しました。" })
        console.log(e)
    }
})

app.listen(PORT, () => {
    console.log(`正しく動いています。ポート番号：${PORT}`);
});