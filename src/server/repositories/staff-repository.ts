import "server-only";

import type { Types } from "mongoose";
import type { MongoFilter } from "@/server/utils/mongo-filter";
import { connectToDatabase } from "@/server/database/mongodb";
import { Staff, type StaffDocument } from "@/server/models/staff";
import type { StaffRole } from "@/server/models/enums";
import { ApiError } from "@/server/errors/api-error";
import { withMongoErrorMapping } from "@/server/utils/mongo-error";
import {
  createPaginatedResult,
  normalizePagination,
  type PaginatedResult,
  type PaginationInput,
} from "@/server/utils/pagination";

export interface CreateStaffInput {
  name: string;
  role: StaffRole;
  initials: string;
  avatarColor?: string;
}

export type UpdateStaffInput = Partial<CreateStaffInput>;

export interface ListStaffFilter extends PaginationInput {
  search?: string;
  role?: StaffRole;
  includeInactive?: boolean;
}

export async function listStaff(
  filter: ListStaffFilter = {}
): Promise<PaginatedResult<StaffDocument>> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const { page, pageSize, skip } = normalizePagination(filter);
    const query: MongoFilter = {};

    if (!filter.includeInactive) {
      query.isActive = true;
    }

    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.search?.trim()) {
      query.name = new RegExp(filter.search.trim(), "i");
    }

    const [items, totalCount] = await Promise.all([
      Staff.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec(),
      Staff.countDocuments(query).exec(),
    ]);

    return createPaginatedResult(items, totalCount, page, pageSize);
  });
}

export async function findStaffById(
  staffId: string | Types.ObjectId,
  options: { includeInactive?: boolean } = {}
): Promise<StaffDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const query: MongoFilter = { _id: staffId };
    if (!options.includeInactive) {
      query.isActive = true;
    }

    return Staff.findOne(query).lean().exec();
  });
}

export async function createStaff(
  input: CreateStaffInput
): Promise<StaffDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const createdStaff = await Staff.create({
      name: input.name.trim(),
      role: input.role,
      initials: input.initials.trim().toUpperCase(),
      avatarColor: input.avatarColor?.trim() || "bg-slate-500",
      isActive: true,
    });

    return createdStaff.toObject();
  });
}

export async function updateStaff(
  staffId: string | Types.ObjectId,
  input: UpdateStaffInput
): Promise<StaffDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatePayload: Record<string, unknown> = {};

    if (input.name !== undefined) {
      updatePayload.name = input.name.trim();
    }
    if (input.role !== undefined) {
      updatePayload.role = input.role;
    }
    if (input.initials !== undefined) {
      updatePayload.initials = input.initials.trim().toUpperCase();
    }
    if (input.avatarColor !== undefined) {
      updatePayload.avatarColor = input.avatarColor.trim();
    }

    const updatedStaff = await Staff.findOneAndUpdate(
      { _id: staffId, isActive: true },
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    )
      .lean()
      .exec();

    if (!updatedStaff) {
      throw new ApiError("Staff member not found.", {
        statusCode: 404,
        code: "STAFF_NOT_FOUND",
      });
    }

    return updatedStaff;
  });
}

export async function softDeleteStaff(
  staffId: string | Types.ObjectId
): Promise<StaffDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatedStaff = await Staff.findOneAndUpdate(
      { _id: staffId, isActive: true },
      { $set: { isActive: false } },
      { returnDocument: 'after' }
    )
      .lean()
      .exec();

    if (!updatedStaff) {
      throw new ApiError("Staff member not found.", {
        statusCode: 404,
        code: "STAFF_NOT_FOUND",
      });
    }

    return updatedStaff;
  });
}
