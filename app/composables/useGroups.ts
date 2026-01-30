import type { Trip } from './useTrips'

export interface GroupMember {
  id: string
  userId: string
  role: 'admin' | 'editor' | 'viewer'
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
}

export interface Group {
  id: string
  name: string
  description: string | null
  coverImageUrl: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface GroupWithDetails extends Group {
  members: GroupMember[]
  trips: Trip[]
  currentUserRole: 'admin' | 'editor' | 'viewer'
}

export interface GroupListItem extends Group {
  role: 'admin' | 'editor' | 'viewer'
  memberCount: number
}

export interface CreateGroupData {
  name: string
  description?: string
  coverImageUrl?: string
}

export interface UpdateGroupData extends Partial<CreateGroupData> {}

export interface Invitation {
  id: string
  email: string | null
  role: 'admin' | 'editor' | 'viewer'
  expiresAt: string
  link?: string
  createdAt?: string
  invitedBy?: {
    id: string
    name: string
    email: string
  }
}

export function useGroups() {
  const toast = useToast()
  const isLoading = ref(false)
  const groups = ref<GroupListItem[]>([])
  const currentGroup = ref<GroupWithDetails | null>(null)

  async function fetchGroups() {
    isLoading.value = true
    try {
      const response = await $fetch<{ groups: GroupListItem[] }>('/api/groups')
      groups.value = response.groups
      return response.groups
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to load groups',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGroup(id: string) {
    isLoading.value = true
    try {
      const response = await $fetch<{ group: GroupWithDetails }>(`/api/groups/${id}`)
      currentGroup.value = response.group
      return response.group
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to load group',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createGroup(data: CreateGroupData) {
    isLoading.value = true
    try {
      const response = await $fetch<{ group: GroupListItem }>('/api/groups', {
        method: 'POST',
        body: data
      })
      groups.value.unshift(response.group)
      toast.add({
        title: 'Group created',
        description: 'Your travel group has been created.',
        color: 'success'
      })
      return response.group
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to create group',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateGroup(id: string, data: UpdateGroupData) {
    isLoading.value = true
    try {
      const response = await $fetch<{ group: Group }>(`/api/groups/${id}`, {
        method: 'PATCH',
        body: data
      })
      const index = groups.value.findIndex(g => g.id === id)
      if (index !== -1) {
        const existing = groups.value[index]!
        groups.value[index] = {
          ...existing,
          ...response.group,
          role: existing.role,
          memberCount: existing.memberCount
        }
      }
      if (currentGroup.value?.id === id) {
        currentGroup.value = { ...currentGroup.value, ...response.group }
      }
      toast.add({
        title: 'Group updated',
        description: 'Your group has been updated.',
        color: 'success'
      })
      return response.group
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to update group',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function deleteGroup(id: string) {
    isLoading.value = true
    try {
      await $fetch(`/api/groups/${id}`, { method: 'DELETE' })
      groups.value = groups.value.filter(g => g.id !== id)
      if (currentGroup.value?.id === id) {
        currentGroup.value = null
      }
      toast.add({
        title: 'Group deleted',
        description: 'The group has been deleted.',
        color: 'success'
      })
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to delete group',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    groups,
    currentGroup,
    isLoading: readonly(isLoading),
    fetchGroups,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup
  }
}
