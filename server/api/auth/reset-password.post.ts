import { resetPasswordSchema } from '../../utils/validation'
import {
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
  updateUserPassword
} from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = resetPasswordSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message || 'Invalid input'
    })
  }

  const { token, password } = result.data

  // Find valid token
  const resetToken = await findValidPasswordResetToken(token)
  if (!resetToken) {
    throw createError({
      statusCode: 400,
      message: 'Invalid or expired reset token'
    })
  }

  // Hash new password
  const passwordHash = await hashPassword(password)

  // Update user password
  await updateUserPassword(resetToken.userId, passwordHash)

  // Mark token as used
  await markPasswordResetTokenUsed(resetToken.id)

  return {
    message: 'Password has been reset successfully'
  }
})
