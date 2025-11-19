import express from "express";
import { DoctorController } from "./doctor.controller";
const router = express.Router();

router.get(
    "/",
    DoctorController.getAllFromDB
)

router.get("/:id", DoctorController.getDoctorById)
router.post("/suggestion", DoctorController.getAiSuggestion)
router.patch(
    "/:id",
    DoctorController.updateIntoDB
)
export const DoctorRoutes = router;