import { prisma } from "../../shared/prisma"
import { UserStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';
import { jwtHelper } from "../../helpers/jwtHelper";
import ApiError from "../../errors/apiErrors";
import HttpStatusCode from "http-status";

const login = async (payload: { email: string, password: string }) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    })

    const isPasswordCorrected = await bcrypt.compare(payload.password, user.password)
    if (!isPasswordCorrected) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, " Password is incorrect")
    }

    const accessToken = jwtHelper.generateToken({ email: user.email, role: user.role }, "safin", "1h")
    const refreshToken = jwtHelper.generateToken({ email: user.email, role: user.role }, "safin", "90d"
    )
    return { accessToken, refreshToken, needPasswordChange: user.needPasswordChange }
}


export const AuthService = {
    login
}