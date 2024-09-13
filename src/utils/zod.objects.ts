import z from "zod";

// ---------- REGISTER OBJECT ----------------
const registerObject = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(6).max(24),
    password2: z.string().min(6).max(24),
})

// ---------- LOGIN OBJECT ----------------
const loginObject = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(24),
})

export {
    loginObject,
    registerObject,
}