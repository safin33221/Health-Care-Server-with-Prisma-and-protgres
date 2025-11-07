import { prisma } from "../../shared/prisma"
import { UserStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';

const login = async (payload: { email: string, password: string }) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    })

    const isPasswordCorrected = await bcrypt.compare(payload.password, user.password)
    if (!isPasswordCorrected) {
        throw new Error("Incorrect Password")
    }

    const accessToken = jwt.sign({ email: user.email, role: user.role }, "safin", {
        algorithm: "HS256",
        expiresIn: "1h"
    })
    const refreshToken = jwt.sign({ email: user.email, role: user.role }, "safin", {
        algorithm: "HS256",
        expiresIn: "90d"
    })
    return { accessToken, refreshToken }
}


export const AuthService = {
    login
}