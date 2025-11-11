import { Router } from "express";
import { ScheduleController } from "./schdule.controller";

const router = Router()

router.get("/scheduleForDoctor", ScheduleController.scheduleForDoctor)

router.post(
    "/",
    ScheduleController.createSchedule
)

export const scheduleRoute = router