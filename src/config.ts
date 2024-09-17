import 'dotenv/config';
import { Secret } from 'jsonwebtoken';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV;
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as Secret;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as Secret;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || 15;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || 60 * 60 * 24;

export {
    PORT,
    NODE_ENV,
    SALT_ROUNDS,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN
}