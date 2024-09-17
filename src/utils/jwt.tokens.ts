import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN, REFRESH_TOKEN_SECRET } from "../config";

// -------------- ACCESS TOKEN ----------------
const createAccessToken = ({ userId }: { userId: string }) => {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    })
}

// -------------- REFRESH TOKEN ----------------
const createRefreshToken = ({ userId }: { userId: string }) => {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    })
}

export {
    createAccessToken,
    createRefreshToken,
};