import type {} from '#auth-utils'

declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    avatarUrl: string | null
  }

  interface UserSession {
    loggedInAt: number
  }
}

export {}
