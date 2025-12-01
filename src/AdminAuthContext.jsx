import { createContext, useContext, useState, useEffect } from 'react'
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
  const [superAdminKey, setSuperAdminKey] = useState(null)
  const [superAdminKeyExpiry, setSuperAdminKeyExpiry] = useState(null)

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  // Login existing admin (works for both regular admins and super admin)
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

      // Session will be loaded by the auth state change listener
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
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
        is_admin_building: buildingData.is_admin_building || false
      }

      const result = await dbService.createBuilding(newBuilding)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Create key offices if provided
      if (buildingData.keyOffices && buildingData.keyOffices.length > 0) {
        const offices = buildingData.keyOffices.map(office => ({
          building_id: result.data.id,
          name: office.name,
          purpose: office.purpose || null,
          hours: office.hours || null,
          room_number: office.roomNumber || office.room_number || null
        }))

        await dbService.createKeyOffices(result.data.id, offices)
      }

      // Also handle snake_case version
      if (buildingData.key_offices && buildingData.key_offices.length > 0) {
        const offices = buildingData.key_offices.map(office => ({
          building_id: result.data.id,
          name: office.name,
          purpose: office.purpose || null,
          hours: office.hours || null,
          room_number: office.roomNumber || office.room_number || null
        }))

        await dbService.createKeyOffices(result.data.id, offices)
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

      // Handle key offices update
      if (updates.keyOffices !== undefined) {
        // Delete existing key offices
        const { data: existingOffices } = await supabase
          .from('key_offices')
          .select('id')
          .eq('building_id', buildingId)

        if (existingOffices && existingOffices.length > 0) {
          for (const office of existingOffices) {
            await dbService.deleteKeyOffice(office.id)
          }
        }

        // Create new key offices if provided
        if (updates.keyOffices && updates.keyOffices.length > 0) {
          const offices = updates.keyOffices.map(office => ({
            building_id: buildingId,
            name: office.name,
            purpose: office.purpose || null,
            hours: office.hours || null,
            room_number: office.roomNumber || office.room_number || null
          }))

          await dbService.createKeyOffices(buildingId, offices)
        }
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
  const sendSuperAdminKeyEmail = async () => {
    try {
      // Generate random 6-digit key
      const secretKey = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now

      // Store key in database (using your existing column names)
      const { data: keyData, error: dbError } = await supabase
        .from('super_admin_keys')
        .insert({
          secret_key: secretKey, 
          expires_at: expiresAt,
          used: false
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to save key to database')
      }

      // Store in state for immediate use
      setSuperAdminKey(secretKey)
      setSuperAdminKeyExpiry(Date.now() + 10 * 60 * 1000)

      // Call Supabase Edge Function to send email
      const { data, error } = await supabase.functions.invoke('send-super-admin-key', {
        body: { 
          email: 'rumeighoraye@gmail.com',
          secretKey 
        }
      })

      if (error) {
        console.error('Email function error:', error)
        throw error
      }

      console.log('Secret key sent successfully:', data)
      return { success: true, message: 'Secret key sent to admin email' }
    } catch (error) {
      console.error('Send super admin key error:', error)
      return { success: false, error: error.message || 'Failed to send secret key' }
    }
  }

  // Super Admin: Login with secret key (FIXED)
  const loginSuperAdmin = async (inputKey) => {
    try {
      // Verify key from database (using your existing column names)
      const { data: keyRecord, error: keyError } = await supabase
        .from('super_admin_keys')
        .select('*')
        .eq('secret_key', inputKey)  // Changed from 'key' to 'secret_key'
        .eq('used', false)
        .single()

      if (keyError || !keyRecord) {
        return { success: false, error: 'Invalid secret key' }
      }

      // Check if key has expired
      if (new Date(keyRecord.expires_at) < new Date()) {
        return { success: false, error: 'Secret key has expired. Please request a new one.' }
      }

      // Mark key as used with timestamp
      const { error: updateError } = await supabase
        .from('super_admin_keys')
        .update({ 
          used: true,
          used_at: new Date().toISOString()  // Added used_at timestamp
        })
        .eq('id', keyRecord.id)

      if (updateError) {
        console.error('Error marking key as used:', updateError)
      }

      // Key is valid, fetch super admin user from database
      const { data: admins, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('is_super_admin', true)
        .single() // Use single() since there should be only one super admin

      if (adminError) {
        console.error('Super admin fetch error:', adminError)
        throw new Error('Super admin not found in database')
      }

      if (!admins) {
        throw new Error('Super admin record does not exist')
      }

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

      // Clear the key from state after successful login
      setSuperAdminKey(null)
      setSuperAdminKeyExpiry(null)

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