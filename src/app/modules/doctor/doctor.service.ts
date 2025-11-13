import { Doctor, Prisma } from "@prisma/client";
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



}

export const DoctorService = {
    getAllFromDB,
    updateIntoDB
}