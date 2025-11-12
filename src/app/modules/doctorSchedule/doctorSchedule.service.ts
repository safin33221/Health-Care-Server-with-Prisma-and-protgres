import { prisma } from "../../shared/prisma"

const createDoctorSchedule = async (user: any, payload: { schedulesIds: string[] }) => {

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })
    // console.log({doctorData});


    const DoctorScheduleData = payload?.schedulesIds?.map(scheduleId => ({
        doctorId: doctorData.id,
        scheduleId
    }))

    return await prisma.doctorSchedule.createMany({
        data: DoctorScheduleData
    })



}


export const DoctorScheduleService = {
    createDoctorSchedule
}