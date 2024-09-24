import { RequestHandler } from "express"
import asyncHandler from "express-async-handler";
import { HTTP_FORBIDDEN } from "../utils/http.status";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config";
import prisma from "../prisma.client";

export const authMiddleware: RequestHandler = asyncHandler(async (req, res, next) => {
    // CHECK IF TOKEN EXISTS IN COOKIES
    let token = req.cookies.accessToken;

    // CHECK IF TOKEN EXISTS IN HEADERS
    if (!token) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            res.status(HTTP_FORBIDDEN);
            throw new Error("Not authorized");
        }
        token = authHeader.split(" ")[1];
    }

    try {
        const { userId } = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        });

        if (!user) {
            res.status(HTTP_FORBIDDEN);
            throw new Error("Not authorized");
        }

        req.user = user;
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(HTTP_FORBIDDEN);
            throw new Error("Token expired");
        }
    }

    next();
})