import { z } from "zod";
import { eq } from "drizzle-orm";
import { sanitizeUser } from "../../utils/auth";
import { users } from "../../database/schema/users";
import { db } from "../../database";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const body = await readValidatedBody(event, updateProfileSchema.parse);

  const [updatedUser] = await db
    .update(users)
    .set({
      name: body.name,
      bio: body.bio || null,
      avatarUrl: body.avatarUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id))
    .returning();

  return {
    user: sanitizeUser(updatedUser),
  };
});
