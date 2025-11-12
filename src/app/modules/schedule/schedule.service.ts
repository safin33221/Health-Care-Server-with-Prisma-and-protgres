import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";
import { Prisma } from "@prisma/client";
import { IJwtPayload } from "../../types/common";

const createSchedule = async (payload: any) => {
    const { startTime, endTime, startDate, endDate } = payload;

    const intervalTime = 30;
    const schedules = [];

    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
        const startDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(startTime.split(":")[0]) // 11:00
                ),
                Number(startTime.split(":")[1])
            )
        )

        const endDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(endTime.split(":")[0]) // 11:00
                ),
                Number(endTime.split(":")[1])
            )
        )

        while (startDateTime < endDateTime) {
            const slotStartDateTime = startDateTime; // 10:30
            const slotEndDateTime = addMinutes(startDateTime, intervalTime); // 11:00

            const scheduleData = {
                startDateTime: slotStartDateTime,
                endDateTime: slotEndDateTime
            }

            const existingSchedule = await prisma.schedule.findFirst({
                where: scheduleData
            })

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData
                });
                schedules.push(result)
            }

            slotStartDateTime.setMinutes(slotStartDateTime.getMinutes() + intervalTime);
        }

        currentDate.setDate(currentDate.getDate() + 1)
    }

    return schedules;
}



const scheduleForDoctor = async (user: IJwtPayload, filters: any, option: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(option)
    const { startDateTime: filterStartDateTime, endDateTime: filterEndDateTime } = filters

    const andCondition: Prisma.ScheduleWhereInput[] = []

    const doctorSchedule = await prisma.doctorSchedule.findMany({
        where: {
            doctor: {
                email: user.email
            }
        },
        select: { scheduleId: true }
    })

    if (filterStartDateTime && filterEndDateTime) {
        andCondition.push({
            startDateTime: { gte: new Date(filterStartDateTime) },
            endDateTime: { lte: new Date(filterEndDateTime) }
        })
    }

    const doctorScheduleIds = doctorSchedule.map((schedule) => schedule.scheduleId)
    const whereCondition: Prisma.ScheduleWhereInput =
        andCondition.length > 0 ? { AND: andCondition } : {}

    const result = await prisma.schedule.findMany({
        where: {
            ...whereCondition,
            id: {
                notIn: doctorScheduleIds
            }

        },
        skip,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" }
    })

    const total = await prisma.schedule.count({
        where: {
            ...whereCondition,
            id: {
                notIn: doctorScheduleIds
            }

        }
    })

    return {
        meta: { page, limit, total },
        data: result
    }
}

const deleteScheduleFromDB = async (id: string) => {
    const result = await prisma.schedule.delete({
        where: { id }
    })
    return result
}



export const ScheduleService = {
    createSchedule,
    scheduleForDoctor,
    deleteScheduleFromDB
}