import { getUserGroups, sanitizeGroup } from '../../utils/groups'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const groups = await getUserGroups(session.user.id)

  return {
    groups: groups.map(g => ({
      ...sanitizeGroup(g),
      role: g.role,
      memberCount: g.memberCount
    }))
  }
})
