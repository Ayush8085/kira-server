import express from "express";
import cookieParser from 'cookie-parser';
import { PORT } from "./config";
import authRouter  from "./routes/auth.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

// ---------- MIDDLEWARES ----------------
app.use(express.json());
app.use(cookieParser());

// ---------- MIDDLEWARES ROUTES ----------------
app.use("/api/v1/auth", authRouter);

// ---------- MIDDLEWARES ERROR ----------------
app.use(errorMiddleware)

// ---------- START SERVER ----------------
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
