import z from "zod";

const createDoctorScheduleValidation = z.object({
    body: z.object({
        "schedulesIds": z.array(z.string())
    })
})


export const doctorValidationSchedule = {
    createDoctorScheduleValidation
}