import { supabase } from './supabase'

export const authService = {
  /**
   * Register a new university admin (FIXED VERSION)
   */
  async registerAdmin(email, password, universityName, city) {
    try {
      // Step 1: Create university FIRST
      const { data: university, error: uniError } = await supabase
        .from('universities')
        .insert([{ name: universityName, city, admin_email: email }])
        .select()
        .single()

      if (uniError) {
        console.error('University creation error:', uniError)
        throw new Error(`Failed to create university: ${uniError.message}`)
      }

      // Step 2: Sign up user with email confirmation DISABLED
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`,
          data: {
            university_name: universityName,
            city: city,
            university_id: university.id
          }
        }
      })

      if (authError) {
        // Rollback: delete university
        await supabase.from('universities').delete().eq('id', university.id)
        throw new Error(`Auth signup failed: ${authError.message}`)
      }

      if (!authData.user?.id) {
        await supabase.from('universities').delete().eq('id', university.id)
        throw new Error('User creation failed - no user ID returned')
      }

      const userId = authData.user.id

      // Step 3: Create admin record
      const { error: adminError } = await supabase
        .from('admins')
        .insert([{ 
          id: userId, 
          university_id: university.id, 
          email, 
          is_super_admin: false 
        }])

      if (adminError) {
        console.error('Admin creation error:', adminError)
        // Rollback: delete university and auth user
        await supabase.from('universities').delete().eq('id', university.id)
        // Note: Can't easily delete auth user from client, but RLS will prevent access
        throw new Error(`Failed to create admin record: ${adminError.message}`)
      }

      // Step 4: Try to auto-login
      // This will ONLY work if email confirmation is disabled in Supabase
      const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        // If login fails (likely due to email confirmation required)
        return {
          success: true,
          requiresEmailConfirmation: true,
          message: 'Registration successful! Please check your email to confirm your account before logging in.',
          user: authData.user,
          university
        }
      }

      // Auto-login successful
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
        error: error.message || 'Registration failed. Please try again.' 
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
        error: error.message || 'Invalid email or password' 
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
  }
}