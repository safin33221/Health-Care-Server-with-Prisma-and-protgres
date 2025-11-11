import { Router } from "express";
import { ScheduleController } from "./schedule.controller";

const router = Router()

router.get("/scheduleForDoctor", ScheduleController.scheduleForDoctor)

router.post(
    "/",
    ScheduleController.createSchedule
)

router.delete("/:id",
    ScheduleController.deleteScheduleFromDB
)
export const scheduleRoute = router