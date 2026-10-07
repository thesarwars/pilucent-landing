/**
 * Helpers for group chat RBAC (`role` from `getChatRoom` members list).
 * Tune to match backend rules.
 */

export function isGroupAdminRole(role: string | null): boolean {
  return role === 'GROUP_ADMIN';
}

export function canModerateGroup(role: string | null): boolean {
  return role === 'GROUP_ADMIN' || role === 'MODERATOR';
}

export function canInviteGroupMembers(role: string | null): boolean {
  return canModerateGroup(role) || role === 'APPROVER' || role === 'FINANCE';
}

export function canDeleteGroup(role: string | null): boolean {
  return role === 'GROUP_ADMIN';
}
