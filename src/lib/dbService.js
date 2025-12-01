import { supabase } from './supabase'

/**
 * Database Service
 * Handles all database operations with Supabase
 */

export const dbService = {
  // ============================================
  // UNIVERSITIES
  // ============================================

  /**
   * Get all universities (for public view and super admin)
   */
  async getAllUniversities() {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select(`
          *,
          buildings(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get universities error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get single university by ID
   */
  async getUniversity(universityId) {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select(`
          *,
          buildings(
            *,
            key_offices(*),
            rooms(count)
          )
        `)
        .eq('id', universityId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get university error:', error)
      return { success: false, error: error.message }
    }
  },

  async createUniversity(universityData) {
    try {
      const { data, error } = await supabase
        .from('universities')
        .insert([universityData])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create university error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get university by admin ID
   */
  async getUniversityByAdmin(adminId) {
    try {
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('university_id')
        .eq('id', adminId)
        .single()

      if (adminError) throw adminError

      return await this.getUniversity(admin.university_id)
    } catch (error) {
      console.error('Get university by admin error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update university
   */
  async updateUniversity(universityId, updates) {
    try {
      const { data, error } = await supabase
        .from('universities')
        .update(updates)
        .eq('id', universityId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update university error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Delete university (super admin only)
   */
  async deleteUniversity(universityId) {
    try {
      const { error } = await supabase
        .from('universities')
        .delete()
        .eq('id', universityId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete university error:', error)
      return { success: false, error: error.message }
    }
  },

  // ============================================
  // BUILDINGS
  // ============================================

  /**
   * Get all buildings for a university
   */
  async getBuildings(universityId) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select(`
          *,
          key_offices(*),
          rooms(count)
        `)
        .eq('university_id', universityId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get buildings error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get single building
   */
  async getBuilding(buildingId) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select(`
          *,
          key_offices(*),
          rooms(*),
          university:universities(name, city)
        `)
        .eq('id', buildingId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get building error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Create new building
   */
  async createBuilding(buildingData) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .insert([buildingData])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create building error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update building
   */
  async updateBuilding(buildingId, updates) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .update(updates)
        .eq('id', buildingId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update building error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Delete building
   */
  async deleteBuilding(buildingId) {
    try {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', buildingId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete building error:', error)
      return { success: false, error: error.message }
    }
  },

  // ============================================
  // KEY OFFICES
  // ============================================

  /**
   * Create key office
   */
  async createKeyOffice(officeData) {
    try {
      const { data, error } = await supabase
        .from('key_offices')
        .insert([officeData])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create key office error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update key office
   */
  async updateKeyOffice(officeId, updates) {
    try {
      const { data, error } = await supabase
        .from('key_offices')
        .update(updates)
        .eq('id', officeId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update key office error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Delete key office
   */
  async deleteKeyOffice(officeId) {
    try {
      const { error } = await supabase
        .from('key_offices')
        .delete()
        .eq('id', officeId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete key office error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Bulk create key offices for a building
   */
  async createKeyOffices(buildingId, offices) {
    try {
      // If offices already have building_id, don't add it again
      const officesData = offices.map(office => {
        const officeData = { ...office }
        if (!officeData.building_id) {
          officeData.building_id = buildingId
        }
        return officeData
      })

      const { data, error } = await supabase
        .from('key_offices')
        .insert(officesData)
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create key offices error:', error)
      return { success: false, error: error.message }
    }
  },

  // ============================================
  // ROOMS (NEW)
  // ============================================

  /**
   * Get all rooms for a building
   */
  async getRooms(buildingId) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('building_id', buildingId)
        .order('room_number', { ascending: true })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get rooms error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get all rooms for a university
   */
  async getAllRoomsForUniversity(universityId) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          building:buildings(name, category)
        `)
        .eq('university_id', universityId)
        .order('room_number', { ascending: true })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get university rooms error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get single room
   */
  async getRoom(roomId) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          building:buildings(name, category, coordinates)
        `)
        .eq('id', roomId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get room error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Create single room
   */
  async createRoom(roomData) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Create room error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Bulk create rooms
   */
  async createRoomsBulk(roomsData) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert(roomsData)
        .select()

      if (error) throw error
      return { success: true, data, count: data.length }
    } catch (error) {
      console.error('Bulk create rooms error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Bulk upsert rooms (insert or update on conflict)
   */
  async upsertRooms(roomsData) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .upsert(roomsData, {
          onConflict: 'building_id,room_number',
          ignoreDuplicates: false
        })
        .select()

      if (error) throw error
      return { success: true, data, count: data.length }
    } catch (error) {
      console.error('Upsert rooms error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update room
   */
  async updateRoom(roomId, updates) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update room error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Delete room
   */
  async deleteRoom(roomId) {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete room error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Delete all rooms for a building
   */
  async deleteAllRoomsForBuilding(buildingId) {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('building_id', buildingId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete building rooms error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Search rooms using the smart search function
   */
  async searchRooms(query, universityId = null) {
    try {
      const { data, error } = await supabase
        .rpc('search_rooms', {
          search_query: query,
          university_id_param: universityId
        })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Search rooms error:', error)
      
      // Fallback to basic search if RPC function doesn't exist yet
      try {
        let queryBuilder = supabase
          .from('rooms')
          .select(`
            *,
            building:buildings(name, category, coordinates)
          `)
          .or(`room_number.ilike.%${query}%,room_name.ilike.%${query}%`)
          .limit(20)

        if (universityId) {
          queryBuilder = queryBuilder.eq('university_id', universityId)
        }

        const { data: fallbackData, error: fallbackError } = await queryBuilder

        if (fallbackError) throw fallbackError
        return { success: true, data: fallbackData }
      } catch (fallbackErr) {
        return { success: false, error: fallbackErr.message }
      }
    }
  },

  /**
   * Convert room to office (add office-specific fields)
   */
  async convertRoomToOffice(roomId, officeData) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({
          is_office: true,
          purpose: officeData.purpose || null,
          hours: officeData.hours || null
        })
        .eq('id', roomId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Convert room to office error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update room timetable
   */
  async updateRoomTimetable(roomId, timetable) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({ timetable })
        .eq('id', roomId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update room timetable error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get rooms with timetables for a building
   */
  async getRoomsWithTimetables(buildingId) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('building_id', buildingId)
        .not('timetable', 'is', null)
        .order('room_number', { ascending: true })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get rooms with timetables error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Clear room timetable
   */
  async clearRoomTimetable(roomId) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({ timetable: null })
        .eq('id', roomId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Clear room timetable error:', error)
      return { success: false, error: error.message }
    }
  },

  // ============================================
  // ADMINS
  // ============================================

  /**
   * Get all admins (super admin only)
   */
  async getAllAdmins() {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select(`
          *,
          university:universities(name, city)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get admins error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get admin by user ID
   */
  async getAdmin(userId) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select(`
          *,
          university:universities(*)
        `)
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      
      if (!data) {
        return { success: false, error: 'Admin record not found' }
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get admin error:', error)
      return { success: false, error: error.message }
    }
  },

  // ============================================
  // SEARCH & STATS
  // ============================================

  /**
   * Search buildings across all universities
   */
  async searchBuildings(query) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select(`
          *,
          university:universities(name, city),
          key_offices(*)
        `)
        .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Search buildings error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Search buildings and rooms combined
   */
  async searchBuildingsAndRooms(query, universityId = null) {
    try {
      // Search buildings
      let buildingQuery = supabase
        .from('buildings')
        .select('*, university:universities(name, city)')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10)

      if (universityId) {
        buildingQuery = buildingQuery.eq('university_id', universityId)
      }

      const buildingsPromise = buildingQuery

      // Search rooms
      const roomsPromise = this.searchRooms(query, universityId)

      const [buildingsResult, roomsResult] = await Promise.all([
        buildingsPromise,
        roomsPromise
      ])

      return {
        success: true,
        data: {
          buildings: buildingsResult.data || [],
          rooms: roomsResult.data || []
        }
      }
    } catch (error) {
      console.error('Search buildings and rooms error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get platform statistics (for super admin dashboard)
   */
  async getStats() {
    try {
      const [universitiesResult, buildingsResult, adminsResult, roomsResult] = await Promise.all([
        supabase.from('universities').select('id', { count: 'exact', head: true }),
        supabase.from('buildings').select('id', { count: 'exact', head: true }),
        supabase.from('admins').select('id', { count: 'exact', head: true }),
        supabase.from('rooms').select('id', { count: 'exact', head: true })
      ])

      return {
        success: true,
        data: {
          totalUniversities: universitiesResult.count || 0,
          totalBuildings: buildingsResult.count || 0,
          totalAdmins: adminsResult.count || 0,
          totalRooms: roomsResult.count || 0
        }
      }
    } catch (error) {
      console.error('Get stats error:', error)
      return { success: false, error: error.message }
    }
  }
}
