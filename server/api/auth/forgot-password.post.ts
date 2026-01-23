import { forgotPasswordSchema } from '../../utils/validation'
import { findUserByEmail, createPasswordResetToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = forgotPasswordSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message || 'Invalid input'
    })
  }

  const { email } = result.data

  // Find user - always return success to prevent email enumeration
  const user = await findUserByEmail(email)

  if (user) {
    // Create reset token
    const token = await createPasswordResetToken(user.id)

    // TODO: Send email with reset link
    // In development, log the token for testing
    console.log(`[DEV] Password reset token for ${email}: ${token}`)
    console.log(`[DEV] Reset URL: /reset-password?token=${token}`)
  }

  // Always return success to prevent email enumeration
  return {
    message: 'If an account with that email exists, we sent a password reset link'
  }
})
