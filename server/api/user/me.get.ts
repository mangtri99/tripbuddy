import { findUserById, sanitizeUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  // Fetch fresh user data from database
  const user = await findUserById(session.user.id)

  if (!user) {
    // User no longer exists, clear session
    await clearUserSession(event)
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  return {
    user: sanitizeUser(user)
  }
})
