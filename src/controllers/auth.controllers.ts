import asyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import { loginObject, registerObject } from "../utils/zod.objects";
import bcrypt from "bcryptjs";
import { REFRESH_TOKEN_SECRET, SALT_ROUNDS } from "../config";
import prisma from "../prisma.client";
import { createAccessToken, createRefreshToken } from "../utils/jwt.tokens";
import { HTTP_BAD_REQUEST, HTTP_CREATED, HTTP_OK } from "../utils/http.status";
import jwt, { JwtPayload } from "jsonwebtoken";

// ---------- REGISTER USER ----------------
const registerUser: RequestHandler = asyncHandler(async (req, res) => {
    // INPUT VALIDATION
    const { success } = registerObject.safeParse(req.body);
    if (!success) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Invalid data");
    }

    // DESTRUCTURE DATA
    const { username, email, password, password2 } = req.body;

    // CHECK IF EMAIL ALREADY EXISTS
    const userExists = await prisma.user.findUnique({
        where: {
            email,
        }
    });
    if (userExists) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("User already exists");
    }

    // MATCH PASSWORD
    if (password !== password2) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Passwords do not match");
    }

    // HASH PASSWORD
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);


    // SAVE USER
    const user = await prisma.user.create({
        data: {
            username: username,
            email: email,
            password: hashPassword,
        },
    })

    // CREATE TOKEN
    const accessToken = createAccessToken({ userId: user.id });
    const refreshToken = createRefreshToken({ userId: user.id });

    // SEND RESPONSE
    res.status(HTTP_CREATED)
        .cookie('accessToken', accessToken, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        })
        .cookie('refreshToken', refreshToken, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        })
        .json({
            message: "User registered successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        })
})

// ---------- LOGIN USER ----------------
const loginUser: RequestHandler = asyncHandler(async (req, res) => {
    // INPUT VALIDATION
    const { success } = loginObject.safeParse(req.body);
    if (!success) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Invalid data");
    }

    // DESTRUCTURE DATA
    const { email, password } = req.body;

    // CHECK IF USER EXISTS
    const user = await prisma.user.findUnique({
        where: {
            email,
        }
    });
    if (!user) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("User does not exist");
    }

    // COMPARE PASSWORD
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Wrong password");
    }

    // CREATE TOKEN
    const accessToken = createAccessToken({ userId: user.id });
    const refreshToken = createRefreshToken({ userId: user.id });

    // SEND RESPONSE
    res.status(HTTP_OK)
        .cookie('accessToken', accessToken, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        })
        .cookie('refreshToken', refreshToken, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        })
        .json({
            message: "Login successfully",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        })
})

// ---------- LOGOUT USER ----------------
const logoutUser: RequestHandler = asyncHandler(async (req, res) => {
    // SEND RESPONSE
    res.status(HTTP_OK)
        .clearCookie('accessToken')
        .clearCookie('refreshToken')
        .json({
            message: "Logout successfully",
        })
})

// ---------- GET LOGGED IN USER ----------------
const getLoggedInUser: RequestHandler = asyncHandler(async (req, res) => {
    const user = req.user;

    // SEND RESPONSE
    res.status(HTTP_OK).json({
        isLoggedIn: true,
        user,
        accessToken: req.cookies.accessToken,
    })
})

// ---------- REFRESH TOKEN ----------------
const getRefreshToken: RequestHandler = asyncHandler(async (req, res) => {
    // CHECK IF REFRESH TOKEN EXISTS
    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Refresh token not found");
    }
    // VERIFY REFRESH TOKEN
    const { userId } = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload;

    // CREATE NEW ACCESS TOKEN
    const accessToken = createAccessToken({ userId });

    // SEND RESPONSE
    res.status(HTTP_OK)
        .cookie('accessToken', accessToken, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        })
        .json({
            message: "Refresh token successfully",
            accessToken,
        })
})

// ---------- EXPORTS ----------------
export {
    loginUser,
    registerUser,
    logoutUser,
    getLoggedInUser,
    getRefreshToken,
}