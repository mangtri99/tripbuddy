import { eq, and, gt, isNull } from 'drizzle-orm'
import { db, users, passwordResetTokens } from '../database'
import type { User, NewUser } from '../database/schema/users'
import { createId } from '../database/utils'

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
  return result[0]
}

export async function findUserById(id: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return result[0]
}

export async function createUser(data: Pick<NewUser, 'email' | 'name' | 'passwordHash'>): Promise<User> {
  const result = await db.insert(users).values({
    email: data.email.toLowerCase(),
    name: data.name,
    passwordHash: data.passwordHash,
    authProvider: 'email'
  }).returning()
  return result[0]!
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await db.update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId))
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = createId() + createId() // 42 chars for extra security
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt
  })

  return token
}

export async function findValidPasswordResetToken(token: string) {
  const result = await db.select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt)
      )
    )
    .limit(1)
  return result[0]
}

export async function markPasswordResetTokenUsed(tokenId: string): Promise<void> {
  await db.update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, tokenId))
}

export function sanitizeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt
  }
}
