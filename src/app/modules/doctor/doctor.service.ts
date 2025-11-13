import { Prisma } from "@prisma/client";
;

import { prisma } from "../../shared/prisma";
import { doctorSearchableFields } from "./doctor.constant";
import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";
import { IDoctorUpdateInput } from "./doctor.interface";


const getAllFromDB = async (filters: any, options: IOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filters;

    const andCondition: Prisma.DoctorWhereInput[] = []

    if (searchTerm) {
        andCondition.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterCondition = Object.keys(filterData).map(key => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))
        andCondition.push(...filterCondition)
    }
    const whereCondition: Prisma.DoctorWhereInput = andCondition.length > 0 ? { AND: andCondition } : {}
    const result = await prisma.doctor.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
    })

    const total = await prisma.doctor.count({
        where: whereCondition
    })

    return {
        meta: { page, limit, total },
        data: result
    }

}


const updateIntoDB = async (id: string, payload: Partial<IDoctorUpdateInput>) => {

    const { specialties, ...doctorData } = payload;

    return await prisma.$transaction(async (tnx) => {
        if (specialties && specialties.length > 0) {
            const deleteSpecialties = specialties.filter((specialty) => specialty.isDeleted)
            for (const specialty of deleteSpecialties) {
                await tnx.doctorSpecialties.deleteMany({
                    where: {
                        doctorId: id,
                        specialitiesId: specialty.specialtyId
                    }
                })
            }

            const createSpecialties = specialties.filter((specialty) => !specialty.isDeleted)

            for (const specialty of createSpecialties) {
                await tnx.doctorSpecialties.createMany({
                    data: {
                        doctorId: id,
                        specialitiesId: specialty.specialtyId
                    }
                })
            }
        }
        const doctorInfo = await tnx.doctor.findUniqueOrThrow({
            where: {
                id: id
            }
        })

        const updatedData = await tnx.doctor.update({
            where: { id: doctorInfo.id },
            data: doctorData,
            include: {
                doctorSpecialties: {
                    include: {
                        specialities: true
                    }
                }
            }
        })

        return updatedData

    })




}

export const DoctorService = {
    getAllFromDB,
    updateIntoDB
}