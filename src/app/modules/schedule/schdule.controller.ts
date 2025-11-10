import { NextFunction, Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { ScheduleService } from "./schedule.service"

const createSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body);
    const result = await ScheduleService.createSchedule(req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "schedule create successfully",
        data: result
    })
})

export const ScheduleController = {
    createSchedule
}