import "server-only";

import type { Types } from "mongoose";
import { connectToDatabase } from "@/server/database/mongodb";
import { User, type UserDocument } from "@/server/models/user";
import type { UserRole } from "@/server/models/enums";
import { ApiError } from "@/server/errors/api-error";
import { withMongoErrorMapping } from "@/server/utils/mongo-error";

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export async function findUserByEmail(
  email: string,
  options: { includePasswordHash?: boolean } = {}
): Promise<UserDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const query = User.findOne({
      email: email.trim().toLowerCase(),
      isActive: true,
    });

    if (options.includePasswordHash) {
      query.select("+passwordHash");
    }

    return query.lean().exec();
  });
}

export async function findUserById(
  userId: string | Types.ObjectId
): Promise<UserDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();
    return User.findOne({ _id: userId, isActive: true }).lean().exec();
  });
}

export async function createUser(
  input: CreateUserInput
): Promise<UserDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const createdUser = await User.create({
      email: input.email.trim().toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role ?? "Admin",
      isActive: true,
    });

    const userObject = createdUser.toObject();
    delete (userObject as { passwordHash?: string }).passwordHash;
    return userObject;
  });
}

export async function softDeleteUser(
  userId: string | Types.ObjectId
): Promise<UserDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, isActive: true },
      { $set: { isActive: false } },
      { returnDocument: 'after' }
    )
      .lean()
      .exec();

    if (!updatedUser) {
      throw new ApiError("User not found.", {
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    }

    return updatedUser;
  });
}
