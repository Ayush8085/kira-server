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

// ---------- PORJECT OBJECT ----------------
const projectObject = z.object({
    title: z.string(),
    key: z.string(),
})

// ---------- ISSUE OBJECT ----------------
const issueObject = z.object({
    title: z.string(),
    key: z.string(),
    description: z.string().optional(),
    status: z.string().optional(),
})

// ---------- EXPORT ----------------
export {
    loginObject,
    registerObject,
    projectObject,
    issueObject,
}