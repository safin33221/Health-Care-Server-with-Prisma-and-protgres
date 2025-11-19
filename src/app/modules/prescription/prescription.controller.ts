import { NextFunction, Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import { prescriptionService } from "./prescription.service"
import sendResponse from "../../shared/sendResponse"
import { IJwtPayload } from "../../types/common"

const createPrescription = catchAsync(async (req: Request & { user?: IJwtPayload }, res: Response, next: NextFunction) => {
    const user = req.user

    const result = await prescriptionService.createPrescription(req.body, user as IJwtPayload)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "prescription create successfully",
        data: result
    })
})



export const PrescriptionController = {
    createPrescription

}