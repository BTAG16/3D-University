import { supabase } from './supabase'
import { sanitizeError } from './errorUtils'

export const authService = {
  /**
   * Register a new university admin (FIXED VERSION)
   */
  async registerAdmin(email, password, universityName, city) {
    try {
      // Delegate to edge function which uses service_role for atomic creation
      // (avoids orphaned auth users when DB inserts fail due to RLS)
      const { data, error } = await supabase.functions.invoke('register-admin', {
        body: { email, password, universityName, city }
      })

      if (error) throw new Error(error.message)
      if (!data?.success) throw new Error(data?.error || 'Registration failed')

      // Sign in with the newly created credentials
      const { data: session, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) throw new Error(`Account created but sign-in failed: ${loginError.message}`)

      // Fetch university for callers that need it
      const { data: university } = await supabase
        .from('universities')
        .select('*')
        .eq('id', data.universityId)
        .single()

      return {
        success: true,
        requiresEmailConfirmation: false,
        user: session.user,
        university,
        message: 'Registration successful! You are now logged in.'
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: sanitizeError(error.message || 'Registration failed. Please try again.')
      }
    }
  },

  /**
   * Login admin user (FIXED)
   */
  async loginAdmin(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        // Check if it's an email confirmation error
        if (error.message.includes('Email not confirmed')) {
          return { 
            success: false, 
            error: 'Please confirm your email address before logging in. Check your inbox for the confirmation link.',
            requiresEmailConfirmation: true
          }
        }
        throw error
      }

      if (!data.user?.id) {
        throw new Error('Login failed - no user data returned')
      }

      // Fetch admin record with university
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*, university:universities(*)')
        .eq('id', data.user.id)
        .single()

      if (adminError) {
        console.error('Failed to fetch admin data:', adminError)
        throw new Error('Admin record not found')
      }

      return { 
        success: true, 
        user: data.user, 
        admin: adminData, 
        university: adminData.university 
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: sanitizeError(error.message || 'Invalid email or password')
      }
    }
  },

  /**
   * Logout
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message || 'Logout failed' }
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session || null
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user || null
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  },

  /**
   * Check if current user is super admin
   */
  async isSuperAdmin() {
    try {
      const user = await this.getCurrentUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('admins')
        .select('is_super_admin')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return !!data?.is_super_admin
    } catch (error) {
      console.error('Check super admin error:', error)
      return false
    }
  },

  /**
   * Reset password - send password reset email
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      return { success: true, message: 'Password reset email sent. Check your inbox.' }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, error: error.message || 'Failed to send reset email' }
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      return { success: true, message: 'Password updated successfully' }
    } catch (error) {
      console.error('Update password error:', error)
      return { success: false, error: error.message || 'Failed to update password' }
    }
  },

  /**
   * Resend confirmation email
   */
  async resendConfirmationEmail(email) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })
      if (error) throw error
      return { success: true, message: 'Confirmation email resent. Check your inbox.' }
    } catch (error) {
      console.error('Resend confirmation error:', error)
      return { success: false, error: error.message || 'Failed to resend confirmation email' }
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => callback(event, session))
  },

  // ============================================
  // MFA (TOTP) — tenant admin two-factor auth
  // ============================================

  /**
   * Start TOTP enrollment. Returns the factor id, QR code (SVG string),
   * and manual-entry secret for the authenticator app.
   */
  async mfaEnroll() {
    try {
      // Clean up any unverified factor left over from a reload/abandoned
      // attempt — its secret can't be re-displayed, and Supabase rejects a
      // new enrollment while one with the same (default, empty) name exists.
      // listFactors() only sorts *verified* factors into the totp/phone
      // arrays — unverified ones only show up in `all`.
      const { data: existing } = await supabase.auth.mfa.listFactors()
      const stale = (existing?.all || []).filter(f => f.factor_type === 'totp' && f.status !== 'verified')
      for (const f of stale) {
        await supabase.auth.mfa.unenroll({ factorId: f.id })
      }

      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) throw error
      return {
        success: true,
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri
      }
    } catch (error) {
      console.error('MFA enroll error:', error)
      return { success: false, error: error.message || 'Failed to start MFA enrollment' }
    }
  },

  /**
   * Verify a 6-digit code for a factor — used both to confirm a brand new
   * enrollment and to complete a step-up challenge during login. Success
   * elevates the current session to AAL2.
   */
  async mfaChallengeAndVerify(factorId, code) {
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code
      })
      if (verifyError) throw verifyError

      return { success: true }
    } catch (error) {
      console.error('MFA verify error:', error)
      return { success: false, error: error.message || 'Invalid or expired code' }
    }
  },

  /**
   * Current vs. next authenticator assurance level for the active session.
   * nextLevel === 'aal2' && currentLevel !== 'aal2' means a verified factor
   * exists and a step-up challenge is required. nextLevel === 'aal1' means
   * no verified factor is enrolled yet.
   */
  async mfaGetAssuranceLevel() {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (error) throw error
      return { success: true, currentLevel: data.currentLevel, nextLevel: data.nextLevel }
    } catch (error) {
      console.error('MFA assurance level error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * List enrolled factors for the current user (used to find the verified
   * TOTP factor's id for a login-time challenge).
   */
  async mfaListFactors() {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error
      return { success: true, totp: data.totp || [] }
    } catch (error) {
      console.error('MFA list factors error:', error)
      return { success: false, error: error.message, totp: [] }
    }
  },

  /**
   * Remove a factor (e.g. resetting MFA enrollment).
   */
  async mfaUnenroll(factorId) {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('MFA unenroll error:', error)
      return { success: false, error: error.message || 'Failed to remove MFA factor' }
    }
  }
}