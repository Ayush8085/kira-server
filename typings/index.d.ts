
interface IUser {
    id: string,
    username: string,
    email: string
}

namespace Express {
    interface Request {
        user?: IUser
    }
}