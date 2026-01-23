import { z } from "zod";
import { findUserById, updateUserPassword } from "../../utils/auth";

const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const body = await readValidatedBody(event, changePasswordSchema.parse);

  const user = await findUserById(session.user.id);
  if (!user || !user.passwordHash) {
    throw createError({
      statusCode: 401,
      message: "User not found",
    });
  }

  const isValid = await verifyPassword(user.passwordHash, body.currentPassword);
  if (!isValid) {
    throw createError({
      statusCode: 400,
      message: "Incorrect current password",
    });
  }

  const passwordHash = await hashPassword(body.newPassword);
  await updateUserPassword(user.id, passwordHash);

  return {
    message: "Password updated successfully",
  };
});
