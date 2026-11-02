import "server-only";

import type { Types } from "mongoose";
import { connectToDatabase } from "@/server/database/mongodb";
import { Session, type SessionDocument } from "@/server/models/session";
import { ApiError } from "@/server/errors/api-error";
import { withMongoErrorMapping } from "@/server/utils/mongo-error";

export interface CreateSessionInput {
  userId: string | Types.ObjectId;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export async function createSession(
  input: CreateSessionInput
): Promise<SessionDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const createdSession = await Session.create({
      userId: input.userId,
      expiresAt: input.expiresAt,
      isActive: true,
      userAgent: input.userAgent?.trim() ?? "",
      ipAddress: input.ipAddress?.trim() ?? "",
    });

    return createdSession.toObject();
  });
}

export async function findActiveSessionById(
  sessionId: string | Types.ObjectId
): Promise<SessionDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    return Session.findOne({
      _id: sessionId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .lean()
      .exec();
  });
}

export async function deactivateSession(
  sessionId: string | Types.ObjectId
): Promise<SessionDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatedSession = await Session.findOneAndUpdate(
      { _id: sessionId, isActive: true },
      { $set: { isActive: false } },
      { returnDocument: "after" }
    )
      .lean()
      .exec();

    if (!updatedSession) {
      throw new ApiError("Session not found.", {
        statusCode: 401,
        code: "SESSION_NOT_FOUND",
      });
    }

    return updatedSession;
  });
}

export async function deactivateSessionQuietly(
  sessionId: string | Types.ObjectId
): Promise<void> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();
    await Session.updateOne(
      { _id: sessionId, isActive: true },
      { $set: { isActive: false } }
    ).exec();
  });
}
