import express from "express";
import cookieParser from 'cookie-parser';
import { PORT } from "./config";
import authRouter from "./routes/auth.routes";
import projectRouter from "./routes/project.routes";
import issueRouter from "./routes/issue.routes";
import commentRouter from "./routes/comment.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import bodyParser from "body-parser";
import cors from 'cors';
import { authMiddleware } from "./middlewares/auth.middleware";

const app = express();

// ---------- MIDDLEWARES ----------------
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true
    })
);

// ---------- MIDDLEWARES ROUTES ----------------
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", authMiddleware, projectRouter);
app.use("/api/v1/issues", authMiddleware, issueRouter);
app.use("/api/v1/comments", authMiddleware, commentRouter);

// ---------- MIDDLEWARES ERROR ----------------
app.use(errorMiddleware)

// ---------- START SERVER ----------------
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
