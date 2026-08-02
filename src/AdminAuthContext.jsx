import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import { dbService } from './lib/dbService'
import { authService } from './lib/authService'

const AdminAuthContext = createContext()

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

export function AdminAuthProvider({ children }) {
  const [adminSession, setAdminSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  // null | 'enroll' (no verified TOTP factor yet) | 'challenge' (factor exists, needs step-up)
  const [mfaStatus, setMfaStatus] = useState(null)

  // Keep a ref so the auth listener can check current session without stale closure
  const adminSessionRef = useRef(null)
  useEffect(() => { adminSessionRef.current = adminSession }, [adminSession])

  useEffect(() => {
    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadAdminSession(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip any auth event where the user hasn't changed and we already have a
      // valid admin session. This covers TOKEN_REFRESHED, re-fired SIGNED_IN,
      // USER_UPDATED, and any other event Supabase fires on tab-focus/visibility
      // change — all of which were causing a full session reload and UI flash.
      // Sign-out is safe: session?.user is null, so the ID check fails and we fall through.
      if (
        adminSessionRef.current &&
        session?.user?.id === adminSessionRef.current.user?.id
      ) return

      setUser(session?.user ?? null)
      if (session?.user) {
        loadAdminSession(session.user)
      } else {
        setAdminSession(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadAdminSession = async (authUser) => {
    try {
      // Get admin record
      const adminResult = await dbService.getAdmin(authUser.id)
      if (!adminResult.success) {
        console.error('Failed to load admin:', adminResult.error)
        // If admin record doesn't exist, sign out the user
        await supabase.auth.signOut()
        setAdminSession(null)
        setUser(null)
        setLoading(false)
        return
      }

      const admin = adminResult.data
      
      // Super admin has no university
      if (admin.is_super_admin) {
        setAdminSession({
          user: {
            id: authUser.id,
            email: authUser.email,
            universityId: null,
            isSuperAdmin: true
          },
          university: null
        })
        setLoading(false)
        return
      }

      // Regular admin must have a university
      if (!admin.university_id || !admin.university) {
        console.error('Invalid admin data:', admin)
        await supabase.auth.signOut()
        setAdminSession(null)
        setUser(null)
        setLoading(false)
        return
      }

      // MFA gate: tenant admins must have a verified TOTP factor and be
      // stepped up to AAL2 before the session is granted. A password-only
      // sign-in only ever reaches AAL1.
      const aal = await authService.mfaGetAssuranceLevel()
      if (aal.success && aal.currentLevel !== 'aal2') {
        if (aal.nextLevel === 'aal2') {
          setMfaStatus('challenge')
        } else {
          setMfaStatus('enroll')
        }
        setLoading(false)
        return
      }
      setMfaStatus(null)

      setAdminSession({
        user: {
          id: authUser.id,
          email: authUser.email,
          universityId: admin.university_id,
          isSuperAdmin: false
        },
        university: admin.university
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading admin session:', error)
      // On error, sign out to prevent stuck state
      await supabase.auth.signOut()
      setAdminSession(null)
      setUser(null)
      setLoading(false)
    }
  }

  // Register new admin and university
  const registerAdmin = async (email, password, universityName, city) => {
    try {
      const result = await authService.registerAdmin(email, password, universityName, city)
      
      // Handle different outcomes
      if (result.success && result.requiresEmailConfirmation) {
        // Email confirmation required - don't auto-login
        return {
          success: true,
          requiresEmailConfirmation: true,
          message: result.message
        }
      }
      
      // Auto-login successful or registration completed
      return result
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    }
  }

  // Login existing university admin (single-tenant deployment)
  const adminLogin = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Check for email confirmation error
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Please confirm your email address before logging in.',
            requiresEmailConfirmation: true
          }
        }
        throw error
      }

      const adminResult = await dbService.getAdmin(data.user.id)
      if (!adminResult.success) {
        await supabase.auth.signOut()
        return { success: false, error: 'Your account is not configured for this portal.' }
      }

      if (adminResult.data?.is_super_admin) {
        await supabase.auth.signOut()
        return {
          success: false,
          error: 'Super admin access is disabled in this deployment.'
        }
      }

      // Session will be loaded by the auth state change listener
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  // MFA: start TOTP enrollment (mandatory, no verified factor yet)
  const startMfaEnroll = async () => {
    return await authService.mfaEnroll()
  }

  // MFA: list enrolled factors (used by the login-time challenge screen to
  // find the verified factor's id)
  const getMfaFactors = async () => {
    return await authService.mfaListFactors()
  }

  // MFA: verify a 6-digit code — used both to confirm a brand new enrollment
  // and to complete a step-up challenge during login. On success, re-loads
  // the admin session now that the AAL2 gate passes.
  const completeMfaVerification = async (factorId, code) => {
    const result = await authService.mfaChallengeAndVerify(factorId, code)
    if (result.success && user) {
      await loadAdminSession(user)
    }
    return result
  }

  // Logout
  const logout = async () => {
    try {
      // Check if it's a super admin keyless session
      if (adminSession?.user?.isSuperAdmin && !user) {
        // Just clear the session state (no Supabase auth to sign out from)
        setAdminSession(null)
        return
      }
      
      // Regular logout for Supabase auth users
      await supabase.auth.signOut()
      setAdminSession(null)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Send password reset email
  const sendPasswordResetEmail = async (email) => {
    try {
      const result = await authService.resetPassword(email)
      return result
    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, error: error.message }
    }
  }

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      const result = await authService.updatePassword(newPassword)
      return result
    } catch (error) {
      console.error('Update password error:', error)
      return { success: false, error: error.message }
    }
  }

  // Get university data (with fresh buildings)
  const getUniversity = async () => {
    if (!adminSession) return null
    
    try {
      const result = await dbService.getUniversity(adminSession.user.universityId)
      return result.success ? result.data : null
    } catch (error) {
      console.error('Error getting university:', error)
      return null
    }
  }

  // Add building
  const addBuilding = async (buildingData) => {
    try {
      if (!adminSession) throw new Error('Not authenticated')
      if (!adminSession.user.universityId) throw new Error('Super admin cannot add buildings')

      // If marking as admin building, unmark existing admin buildings
      if (buildingData.is_admin_building) {
        const buildings = await dbService.getBuildings(adminSession.user.universityId)
        if (buildings.success && buildings.data) {
          for (const building of buildings.data) {
            if (building.is_admin_building) {
              await dbService.updateBuilding(building.id, { is_admin_building: false })
            }
          }
        }
      }

      const newBuilding = {
        university_id: adminSession.user.universityId,
        name: buildingData.name,
        coordinates: buildingData.coordinates,
        category: buildingData.category || null,
        description: buildingData.description || null,
        facilities: buildingData.facilities || [],
        departments: buildingData.departments || [],
        hours: buildingData.hours || null,
        mappedin_url: buildingData.mappedin_url || null,
        is_admin_building: buildingData.is_admin_building || false
      }

      const result = await dbService.createBuilding(newBuilding)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      return { success: true, building: result.data }
    } catch (error) {
      console.error('Add building error:', error)
      return { success: false, error: error.message }
    }
  }

  // Update building
  const updateBuilding = async (buildingId, updates) => {
    try {
      if (!adminSession) throw new Error('Not authenticated')

      // Super admin or building owner can update
      const canUpdate = adminSession.user.isSuperAdmin || adminSession.user.universityId

      if (!canUpdate) throw new Error('Unauthorized')

      // If marking as admin building, unmark others (only for non-super admins)
      if (updates.is_admin_building && !adminSession.user.isSuperAdmin) {
        const buildings = await dbService.getBuildings(adminSession.user.universityId)
        if (buildings.success && buildings.data) {
          for (const building of buildings.data) {
            if (building.is_admin_building && building.id !== buildingId) {
              await dbService.updateBuilding(building.id, { is_admin_building: false })
            }
          }
        }
      }

      // Transform camelCase to snake_case if needed
      const dbUpdates = {
        name: updates.name,
        coordinates: updates.coordinates,
        category: updates.category,
        description: updates.description,
        facilities: updates.facilities,
        departments: updates.departments,
        hours: updates.hours,
        mappedin_url: updates.mappedin_url,
        is_admin_building: updates.is_admin_building !== undefined
          ? updates.is_admin_building
          : updates.isAdminBuilding
      }

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => 
        dbUpdates[key] === undefined && delete dbUpdates[key]
      )

      const result = await dbService.updateBuilding(buildingId, dbUpdates)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      return { success: true }
    } catch (error) {
      console.error('Update building error:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete building
  const deleteBuilding = async (buildingId) => {
    try {
      if (!adminSession) throw new Error('Not authenticated')

      const result = await dbService.deleteBuilding(buildingId)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      return { success: true }
    } catch (error) {
      console.error('Delete building error:', error)
      return { success: false, error: error.message }
    }
  }

  // Super Admin: Generate and send secret key via email
  // Generation, storage, and emailing all happen server-side in the
  // request-super-admin-key edge function (service role) — the client never
  // sees or controls the code, closing the self-service bypass that existed
  // when this was implemented client-side.
  const sendSuperAdminKeyEmail = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('request-super-admin-key', {
        body: {}
      })

      if (error) throw error
      if (!data?.success) throw new Error(data?.error || 'Failed to send secret key')

      return { success: true, message: 'Secret key sent to admin email' }
    } catch (error) {
      console.error('Send super admin key error:', error)
      return { success: false, error: error.message || 'Failed to send secret key' }
    }
  }

  // Super Admin: Login with secret key (FIXED)
  const loginSuperAdmin = async (inputKey) => {
    try {
      // Verification happens server-side in the verify-super-admin-key edge
      // function (service role) — the client no longer reads or writes
      // super_admin_keys directly, closing the self-service login bypass
      // that existed when this ran as a plain client-side table query.
      const { data, error: verifyError } = await supabase.functions.invoke('verify-super-admin-key', {
        body: { inputKey }
      })

      if (verifyError) throw verifyError
      if (!data?.success) {
        return { success: false, error: data?.error || 'Invalid secret key' }
      }

      const admins = data.admin

      // Set super admin session WITHOUT Supabase auth
      setAdminSession({
        user: {
          id: admins.id,
          email: admins.email,
          universityId: null,
          isSuperAdmin: true
        },
        university: null,
        loginTime: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
      })

      return { success: true, message: 'Super admin login successful' }
    } catch (error) {
      console.error('Super admin login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  // Super Admin: Extend session
  const extendSuperAdminSession = () => {
    try {
      if (!adminSession || !adminSession.user.isSuperAdmin) {
        return { success: false, error: 'Not logged in as super admin' }
      }

      // Extend expiry by 10 minutes
      setAdminSession({
        ...adminSession,
        expiresAt: Date.now() + 10 * 60 * 1000
      })

      return { success: true, message: 'Session extended by 10 minutes' }
    } catch (error) {
      console.error('Extend session error:', error)
      return { success: false, error: error.message }
    }
  }

  // Check super admin session expiry
  useEffect(() => {
    if (!adminSession?.user?.isSuperAdmin || !adminSession?.expiresAt) return

    const checkExpiry = setInterval(() => {
      if (Date.now() > adminSession.expiresAt) {
        console.log('Super admin session expired')
        setAdminSession(null)
      }
    }, 1000) // Check every second

    return () => clearInterval(checkExpiry)
  }, [adminSession])

  const value = {
    adminSession,
    loading,
    user,
    registerAdmin,
    adminLogin,
    logout,
    sendPasswordResetEmail,
    updatePassword,
    getUniversity,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    // MFA (TOTP) — tenant admins
    mfaStatus,
    startMfaEnroll,
    getMfaFactors,
    completeMfaVerification,
    // Super Admin functions
    sendSuperAdminKeyEmail,
    loginSuperAdmin,
    extendSuperAdminSession
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  )
}
