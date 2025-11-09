import { NextFunction, Request, Response } from "express"
import { jwtHelper } from "../helpers/jwtHelper"

const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.accessToken
            if (!token) {
                throw new Error("Your are not Authorized")
            }
            const verifyUser = jwtHelper.verifyToken(token, "safin")
            req.user = verifyUser

            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new Error("Your are not Verified")
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}


export default auth