import { registerSchema } from '../../utils/validation'
import { findUserByEmail, createUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message || 'Invalid input'
    })
  }

  const { email, password, name } = result.data

  // Check if user already exists
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'An account with this email already exists'
    })
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password)
  const user = await createUser({ email, name, passwordHash })

  // Set session
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl
    },
    loggedInAt: Date.now()
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl
    }
  }
})
