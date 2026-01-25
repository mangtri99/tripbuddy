import type { GroupMember, Invitation } from './useGroups'

export interface InviteMemberData {
  email?: string
  userId?: string
  role?: 'admin' | 'editor' | 'viewer'
}

export interface UpdateMemberRoleData {
  role: 'admin' | 'editor' | 'viewer'
}

export function useGroupMembers(groupId: Ref<string>) {
  const toast = useToast()
  const isLoading = ref(false)
  const members = ref<GroupMember[]>([])
  const invitations = ref<Invitation[]>([])

  async function fetchMembers() {
    isLoading.value = true
    try {
      const response = await $fetch<{ members: GroupMember[] }>(`/api/groups/${groupId.value}/members`)
      members.value = response.members
      return response.members
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to load members',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function fetchInvitations() {
    isLoading.value = true
    try {
      const response = await $fetch<{ invitations: Invitation[] }>(`/api/groups/${groupId.value}/invitations`)
      invitations.value = response.invitations
      return response.invitations
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to load invitations',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function inviteMember(data: InviteMemberData) {
    isLoading.value = true
    try {
      const response = await $fetch<{ invitation: Invitation }>(`/api/groups/${groupId.value}/invitations`, {
        method: 'POST',
        body: data
      })
      invitations.value.push(response.invitation)
      toast.add({
        title: 'Invitation sent',
        description: 'The invitation has been created.',
        color: 'success'
      })
      return response.invitation
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to send invitation',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateMemberRole(memberId: string, data: UpdateMemberRoleData) {
    isLoading.value = true
    try {
      const response = await $fetch<{ member: GroupMember }>(`/api/groups/${groupId.value}/members/${memberId}`, {
        method: 'PATCH',
        body: data
      })
      const index = members.value.findIndex(m => m.id === memberId)
      if (index !== -1) {
        members.value[index] = response.member
      }
      toast.add({
        title: 'Role updated',
        description: 'Member role has been updated.',
        color: 'success'
      })
      return response.member
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to update role',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function removeMember(memberId: string) {
    isLoading.value = true
    try {
      await $fetch(`/api/groups/${groupId.value}/members/${memberId}`, { method: 'DELETE' })
      members.value = members.value.filter(m => m.id !== memberId)
      toast.add({
        title: 'Member removed',
        description: 'The member has been removed from the group.',
        color: 'success'
      })
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to remove member',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function cancelInvitation(invitationId: string) {
    isLoading.value = true
    try {
      await $fetch(`/api/groups/${groupId.value}/invitations/${invitationId}`, { method: 'DELETE' })
      invitations.value = invitations.value.filter(i => i.id !== invitationId)
      toast.add({
        title: 'Invitation cancelled',
        description: 'The invitation has been cancelled.',
        color: 'success'
      })
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } }
      toast.add({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to cancel invitation',
        color: 'error'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Computed helpers
  const admins = computed(() => members.value.filter(m => m.role === 'admin'))
  const editors = computed(() => members.value.filter(m => m.role === 'editor'))
  const viewers = computed(() => members.value.filter(m => m.role === 'viewer'))

  return {
    members,
    invitations,
    admins,
    editors,
    viewers,
    isLoading: readonly(isLoading),
    fetchMembers,
    fetchInvitations,
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvitation
  }
}
