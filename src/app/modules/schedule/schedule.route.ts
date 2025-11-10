import { Router } from "express";
import { ScheduleController } from "./schdule.controller";

const router = Router()



router.post(
    "/",
    ScheduleController.createSchedule
)

export const scheduleRoute = router