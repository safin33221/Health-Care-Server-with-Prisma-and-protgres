import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router()

router.get("/scheduleForDoctor",
    auth(UserRole.DOCTOR, UserRole.DOCTOR),
    ScheduleController.scheduleForDoctor)

router.post(
    "/",
    ScheduleController.createSchedule
)

router.delete("/:id",
    ScheduleController.deleteScheduleFromDB
)
export const scheduleRoute = router