/**
 * Maps raw Supabase / Postgres error messages to user-friendly strings.
 * Import this wherever errors are surfaced to users.
 */
export function sanitizeError(msg = '') {
  const m = String(msg).toLowerCase()

  if (m.includes('user already registered') || m.includes('already been registered') ||
      (m.includes('duplicate') && m.includes('email'))) {
    return 'An account with this email already exists.'
  }
  if (m.includes('invalid login credentials') || m.includes('invalid email or password')) {
    return 'Incorrect email or password.'
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email before signing in. Check your inbox.'
  }
  if (m.includes('admin record not found') || m.includes('not configured')) {
    return 'Account not configured for this portal. Please contact support.'
  }
  if (m.includes('jwt expired') || m.includes('token is expired') || m.includes('refresh_token_not_found')) {
    return 'Your session has expired. Please sign in again.'
  }
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'You do not have permission to perform this action.'
  }
  if (m.includes('violates unique constraint') || m.includes('duplicate key')) {
    return 'A record with this information already exists.'
  }
  if (m.includes('violates foreign key')) {
    return 'Operation failed due to a data conflict. Please try again.'
  }
  if (m.includes('network') || m.includes('failed to fetch') || m.includes('networkerror')) {
    return 'Network error. Please check your connection and try again.'
  }
  if (m.includes('invalid input syntax') || m.includes('syntax error') || m.includes('invalid uuid')) {
    return 'Invalid data format. Please try again.'
  }
  // Short, already user-friendly messages pass through
  if (msg.length < 120 && !m.includes('constraint') && !m.includes('violation') &&
      !m.includes('postgres') && !m.includes('supabase') && !m.includes('syntax')) {
    return msg
  }
  return 'An unexpected error occurred. Please try again.'
}
