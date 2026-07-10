import React, { useState, useEffect } from 'react'
import { useToast } from './Toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDoorOpen, faPlus, faUpload, faEdit, faTrash, faStar, faSearch,
  faTimes, faDownload, faFileExcel, faExclamationTriangle, faCheckCircle, faCheck
} from '@fortawesome/free-solid-svg-icons'
import RoomEditModal from './RoomEditModal'
import SlideOver from './SlideOver'
import RoomTimetable from './RoomTimetable'
import './RoomManagement.css'

const TT_DAY_KEYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const TT_DAY_INIT = { monday:'M', tuesday:'T', wednesday:'W', thursday:'T', friday:'F', saturday:'S', sunday:'S' }

function TimetablePreview({ schedule }) {
  if (!schedule) return null
  const activeDays = TT_DAY_KEYS.filter(d => schedule[d] && Object.keys(schedule[d]).length > 0)
  if (activeDays.length === 0) return null
  const allTimes = activeDays.flatMap(d => Object.values(schedule[d]).map(s => s.time).filter(Boolean))
  const firstTime = allTimes[0] || null
  const lastTime = allTimes[allTimes.length - 1] || null
  return (
    <div className="timetable-preview">
      <div className="preview-days">
        {TT_DAY_KEYS.slice(0, 5).map(d => (
          <span key={d} className={`preview-day ${activeDays.includes(d) ? 'on' : 'off'}`}>{TT_DAY_INIT[d]}</span>
        ))}
      </div>
      {firstTime && (
        <span className="preview-time">{firstTime}{lastTime && lastTime !== firstTime ? ` – ${lastTime}` : ''}</span>
      )}
    </div>
  )
}

function RoomManagement({ universityId, buildings, onClose }) {
  const toast = useToast()
  const [activeView, setActiveView] = useState('list') // 'list', 'timetable'
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingRoom, setEditingRoom] = useState(null)
  const [selectedRooms, setSelectedRooms] = useState([])
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [selectedTimetableRoom, setSelectedTimetableRoom] = useState(null)

  // Load rooms on mount
  useEffect(() => {
    loadRooms()
  }, [universityId])

  // Filter rooms when search or building changes
  useEffect(() => {
    filterRooms()
  }, [searchQuery, selectedBuilding, rooms])

  useEffect(() => {
    setSelectedRooms([])
  }, [activeView, searchQuery, selectedBuilding])

  const loadRooms = async () => {
    setLoading(true)
    setError(null)
    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.getAllRoomsForUniversity(universityId)
      
      if (result.success) {
        setRooms(result.data || [])
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filterRooms = () => {
    let filtered = rooms

    // Filter by building
    if (selectedBuilding !== 'all') {
      filtered = filtered.filter(room => room.building_id === selectedBuilding)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(room =>
        room.room_number.toLowerCase().includes(query) ||
        room.room_name.toLowerCase().includes(query) ||
        (room.purpose && room.purpose.toLowerCase().includes(query)) ||
        (room.building?.name && room.building.name.toLowerCase().includes(query))
      )
    }

    setFilteredRooms(filtered)
  }

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return

    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.deleteRoom(roomId)
      
      if (result.success) {
        toast.success('Room deleted successfully')
        setSuccess('Room deleted successfully')
        loadRooms()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        toast.error(result.error)
        setError(result.error)
      }
    } catch (err) {
      toast.error(err.message)
      setError(err.message)
    }
  }

  const handleToggleOffice = async (room) => {
    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.updateRoom(room.id, {
        is_office: !room.is_office
      })
      
      if (result.success) {
        const successMsg = room.is_office ? 'Office status removed' : 'Marked as office'
        toast.success(successMsg)
        setSuccess(successMsg)
        loadRooms()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        toast.error(result.error)
        setError(result.error)
      }
    } catch (err) {
      toast.error(err.message)
      setError(err.message)
    }
  }

  const handleEditRoom = async (roomId, updates) => {
    try {
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.updateRoom(roomId, updates)
      
      if (result.success) {
        toast.success('Room updated successfully')
        setSuccess('Room updated successfully')
        loadRooms()
        setEditingRoom(null)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        toast.error(result.error)
        setError(result.error)
      }
    } catch (err) {
      toast.error(err.message)
      setError(err.message)
    }
  }

  const toggleRoomSelection = (roomId) => {
    setSelectedRooms(prev => {
      if (prev.includes(roomId)) {
        return prev.filter(id => id !== roomId)
      } else {
        return [...prev, roomId]
      }
    })
  }

  const toggleSelectAll = () => {
    if (selectedRooms.length === filteredRooms.length) {
      setSelectedRooms([])
    } else {
      setSelectedRooms(filteredRooms.map(r => r.id))
    }
  }

  const handleBulkDelete = () => {
    if (selectedRooms.length === 0) {
      setError('Please select at least one room to delete')
      setTimeout(() => setError(null), 3000)
      return
    }
    setBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    try {
      const { dbService } = await import('../lib/dbService')
      
      const deletePromises = selectedRooms.map(roomId => 
        dbService.deleteRoom(roomId)
      )
      
      await Promise.all(deletePromises)
      const successMsg = `Successfully deleted ${selectedRooms.length} room${selectedRooms.length > 1 ? 's' : ''}`
      toast.success(successMsg)
      setSuccess(successMsg)
      loadRooms()
      setSelectedRooms([])
      setBulkDeleteConfirm(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      const errorMsg = `Error deleting rooms: ${error.message}`
      toast.error(errorMsg)
      setError(errorMsg)
      setBulkDeleteConfirm(false)
    }
  }

  const downloadCSVTemplate = () => {
    const csv = 'room_number,room_name,building_name\nF-001,Computer Lab,F Building\nF-002,Lecture Hall,F Building\nP-101,Dean Office,P Building'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rooms_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getBuildingName = (buildingId) => {
    const building = buildings.find(b => b.id === buildingId)
    return building ? building.name : 'Unknown Building'
  }

  const clearFilters = () => {
    setSelectedBuilding('all')
    setSearchQuery('')
  }

  return (
    <div className="tab-panel">
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Rooms</h1>
          <select value={selectedBuilding} onChange={e => setSelectedBuilding(e.target.value)} style={{ height: 38, padding: '0 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
            <option value="all">All buildings</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 3 }}>
            <button onClick={() => setActiveView('list')} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: activeView === 'list' ? 'var(--accent-subtle)' : 'transparent', color: activeView === 'list' ? 'var(--accent)' : 'var(--text-secondary)', transition: 'all 200ms var(--ease)', border: 'none', cursor: 'pointer' }}>List</button>
            <button onClick={() => setActiveView('timetable')} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: activeView === 'timetable' ? 'var(--accent-subtle)' : 'transparent', color: activeView === 'timetable' ? 'var(--accent)' : 'var(--text-secondary)', transition: 'all 200ms var(--ease)', border: 'none', cursor: 'pointer' }}>Timetable</button>
          </div>
          <button onClick={() => setShowAddRoom(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', transition: 'all 150ms var(--ease)', minHeight: 38, border: 'none', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faPlus} /> Add Room
          </button>
          <button onClick={() => setShowBulkImport(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, transition: 'all 150ms var(--ease)', minHeight: 38, cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faUpload} /> Import
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--error-subtle)', color: 'var(--error)', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '12px 16px', background: 'var(--success-subtle)', color: 'var(--success)', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <FontAwesomeIcon icon={faCheckCircle} />
          {success}
        </div>
      )}

      {/* LIST VIEW */}
      {activeView === 'list' && (
        <>
          {selectedRooms.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, background: 'var(--accent-subtle)', border: '1px solid var(--accent-muted)', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-hover)' }}>{selectedRooms.length} selected</span>
              <span style={{ flex: 1 }}></span>
              <button onClick={() => setSelectedRooms([])} style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', padding: '6px 10px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer' }}>Clear</button>
              <button onClick={handleBulkDelete} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--error)', padding: '6px 12px', borderRadius: 7, border: '1px solid var(--error)', background: 'transparent', cursor: 'pointer' }}>Delete selected</button>
            </div>
          )}

          <div className="dr-table-wrap" style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ width: 44, padding: '12px 8px 12px 20px', textAlign: 'left' }}>
                    <input type="checkbox" checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0} onChange={toggleSelectAll} style={{ accentColor: 'var(--accent)', width: 15, height: 15, cursor: 'pointer' }} />
                  </th>
                  <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room</th>
                  <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Floor</th>
                  <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                  <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacity</th>
                  <th style={{ padding: '12px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '12px 20px 12px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>No rooms found</td>
                  </tr>
                ) : filteredRooms.map(room => {
                  const isSelected = selectedRooms.includes(room.id)
                  // Mocks for fields not in schema
                  const parsedFloor = room.room_number.match(/\d+/) ? room.room_number.match(/\d+/)[0][0] : '1'
                  const isOffice = room.is_office
                  const catLabel = isOffice ? 'Office' : 'Classroom'
                  const catBg = isOffice ? 'rgba(34,211,238,0.14)' : 'rgba(192,132,252,0.16)'
                  const catColor = isOffice ? '#0891B2' : '#7C3AED'
                  const capacity = Math.floor((parseInt(parsedFloor,10) || 1) * 15 + 10)
                  const status = room.id.length % 3 === 0 ? 'In Use' : 'Available'
                  const statusDot = status === 'Available' ? 'var(--success)' : 'var(--warning)'
                  const statusColor = status === 'Available' ? 'var(--success)' : 'var(--warning)'
                  
                  return (
                    <tr key={room.id} style={{ borderTop: '1px solid var(--border-light)', background: isSelected ? 'var(--accent-subtle)' : 'transparent', transition: 'background 150ms var(--ease)' }}>
                      <td style={{ padding: '11px 8px 11px 20px' }}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleRoomSelection(room.id)} style={{ accentColor: 'var(--accent)', width: 15, height: 15, cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{room.room_number}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{room.room_name}</div>
                      </td>
                      <td style={{ padding: '11px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>Floor {parsedFloor}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 9999, fontSize: 11.5, fontWeight: 600, background: catBg, color: catColor }}>{catLabel}</span>
                      </td>
                      <td style={{ padding: '11px 12px', fontSize: 13, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{capacity}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 500, color: statusColor }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusDot }}></span>{status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 20px 11px 12px', textAlign: 'right' }}>
                        <button onClick={() => setEditingRoom(room)} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', padding: '6px 12px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 150ms var(--ease)' }}>Edit</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TIMETABLE VIEW */}
      {activeView === 'timetable' && (() => {
        const timetableRooms = filteredRooms.filter(r => r.timetable)
        if (loading) return (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading rooms…</div>
        )
        if (timetableRooms.length === 0) return (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <FontAwesomeIcon icon={faDoorOpen} style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>No timetables found</div>
            <div style={{ fontSize: 13 }}>Add timetable data to rooms to see them here.</div>
          </div>
        )
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {timetableRooms.map(room => (
              <div
                key={room.id}
                onClick={() => setSelectedTimetableRoom(room)}
                style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)', padding: '14px 16px', cursor: 'pointer', transition: 'border-color 150ms var(--ease), box-shadow 150ms var(--ease)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-subtle)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>{room.room_number}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-muted)', borderRadius: 9999, padding: '2px 8px' }}>Schedule</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{room.room_name}</div>
                {room.building?.name && (
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{room.building.name}</div>
                )}
                {room.timetable?.schedule && <TimetablePreview schedule={room.timetable.schedule} />}
              </div>
            ))}
          </div>
        )
      })()}

      {/* OVERLAYS */}
      {selectedTimetableRoom && (
        <SlideOver
          title={`${selectedTimetableRoom.room_number} · ${selectedTimetableRoom.room_name}`}
          onClose={() => setSelectedTimetableRoom(null)}
        >
          {selectedTimetableRoom.building?.name && (
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 0, marginBottom: 16 }}>{selectedTimetableRoom.building.name}</p>
          )}
          {selectedTimetableRoom.purpose && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{selectedTimetableRoom.purpose}</p>
          )}
          {selectedTimetableRoom.hours && (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>{selectedTimetableRoom.hours}</p>
          )}
          <RoomTimetable timetable={selectedTimetableRoom.timetable} />
        </SlideOver>
      )}

      {showAddRoom && (
        <SlideOver title="Add Room" onClose={() => setShowAddRoom(false)}>
          <AddRoomForm buildings={buildings} universityId={universityId} onSuccess={() => { setShowAddRoom(false); loadRooms(); setSuccess('Room added!') }} onError={setError} />
        </SlideOver>
      )}

      {showBulkImport && (
        <SlideOver title="Bulk Import Rooms" onClose={() => setShowBulkImport(false)}>
          <BulkImportView buildings={buildings} universityId={universityId} onSuccess={(m) => { setShowBulkImport(false); loadRooms(); setSuccess(m) }} onError={setError} onDownloadTemplate={downloadCSVTemplate} />
        </SlideOver>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <RoomEditModal
          room={editingRoom}
          buildings={buildings}
          onSave={handleEditRoom}
          onCancel={() => setEditingRoom(null)}
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setBulkDeleteConfirm(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', padding: 24, borderRadius: 14, width: '100%', maxWidth: 400 }}>
            <div className="delete-confirm">
              <h2 style={{ marginTop: 0 }}>Delete {selectedRooms.length} Room{selectedRooms.length > 1 ? 's' : ''}?</h2>
              <p>Are you sure you want to delete these rooms? This action cannot be undone.</p>
              <div className="confirm-buttons" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn-cancel" onClick={() => setBulkDeleteConfirm(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button className="btn-delete-confirm" onClick={confirmBulkDelete} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--error)', color: '#fff', cursor: 'pointer' }}>
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add Room Form Component
function AddRoomForm({ buildings, universityId, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    building_id: '',
    room_number: '',
    room_name: '',
    is_office: false,
    purpose: '',
    hours: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    onError(null)

    try {
      if (!formData.building_id) {
        throw new Error('Please select a building')
      }
      if (!formData.room_number || !formData.room_name) {
        throw new Error('Room number and name are required')
      }

      const { dbService } = await import('../lib/dbService')
      const result = await dbService.createRoom({
        building_id: formData.building_id,
        university_id: universityId,
        room_number: formData.room_number.trim(),
        room_name: formData.room_name.trim(),
        is_office: formData.is_office,
        purpose: formData.is_office && formData.purpose ? formData.purpose.trim() : null,
        hours: formData.is_office && formData.hours ? formData.hours.trim() : null
      })

      if (result.success) {
        setFormData({
          building_id: formData.building_id, // Keep building selected
          room_number: '',
          room_name: '',
          is_office: false,
          purpose: '',
          hours: ''
        })
        onSuccess()
      } else {
        onError(result.error)
      }
    } catch (err) {
      onError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="add-room-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Building *</label>
        <select
          value={formData.building_id}
          onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
          required
        >
          <option value="">Select a building</option>
          {buildings.map(building => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Room Number *</label>
          <input
            type="text"
            placeholder="e.g., 112, F-001, Lab A"
            value={formData.room_number}
            onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
            required
          />
          <small>Can be numbers, letters, or combination</small>
        </div>

        <div className="form-group">
          <label>Room Name *</label>
          <input
            type="text"
            placeholder="e.g., Computer Lab, Dean's Office"
            value={formData.room_name}
            onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.is_office}
            onChange={(e) => setFormData({ ...formData, is_office: e.target.checked })}
          />
          <span>Mark as Office/Special Room</span>
        </label>
      </div>

      {formData.is_office && (
        <>
          <div className="form-group">
            <label>Purpose</label>
            <input
              type="text"
              placeholder="e.g., Administration, Faculty Office"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Opening Hours</label>
            <input
              type="text"
              placeholder="e.g., Mon-Fri 9am-5pm"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
            />
          </div>
        </>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Adding...' : 'Add Room'}
      </button>
    </form>
  )
}

// Bulk Import View Component
function BulkImportView({ buildings, universityId, onSuccess, onError, onDownloadTemplate }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [importResults, setImportResults] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      onError('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    previewCSV(selectedFile)
  }

  const previewCSV = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      const previewLines = lines.slice(0, 6) // Header + 5 rows
      setPreview(previewLines.join('\n'))
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!file) {
      onError('Please select a file')
      return
    }

    setLoading(true)
    onError(null)
    setImportResults(null)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or has no data rows')
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const roomNumberIndex = headers.indexOf('room_number')
      const roomNameIndex = headers.indexOf('room_name')
      const buildingNameIndex = headers.indexOf('building_name')

      if (roomNumberIndex === -1 || roomNameIndex === -1 || buildingNameIndex === -1) {
        throw new Error('CSV must have columns: room_number, room_name, building_name')
      }

      // Build building name to ID map
      const buildingMap = {}
      buildings.forEach(b => {
        buildingMap[b.name.toLowerCase().trim()] = b.id
      })

      // Process rows
      const roomsToImport = []
      const skippedRows = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const roomNumber = values[roomNumberIndex]
        const roomName = values[roomNameIndex]
        const buildingName = values[buildingNameIndex]

        if (!roomNumber || !roomName || !buildingName) {
          skippedRows.push({ row: i + 1, reason: 'Missing required fields' })
          continue
        }

        const buildingId = buildingMap[buildingName.toLowerCase().trim()]
        if (!buildingId) {
          skippedRows.push({ row: i + 1, reason: `Building "${buildingName}" not found` })
          continue
        }

        roomsToImport.push({
          building_id: buildingId,
          university_id: universityId,
          room_number: roomNumber,
          room_name: roomName
        })
      }

      if (roomsToImport.length === 0) {
        throw new Error('No valid rooms to import')
      }

      // Import rooms
      const { dbService } = await import('../lib/dbService')
      const result = await dbService.createRoomsBulk(roomsToImport)

      if (result.success) {
        setImportResults({
          imported: result.count,
          skipped: skippedRows.length,
          skippedRows
        })
        onSuccess(`Successfully imported ${result.count} rooms`)
      } else {
        onError(result.error)
      }
    } catch (err) {
      onError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bulk-import-view">
      <div className="import-instructions">
        <h3>CSV Import Instructions</h3>
        <ol>
          <li>Download the CSV template below</li>
          <li>Fill in your room data with columns: <code>room_number</code>, <code>room_name</code>, <code>building_name</code></li>
          <li>Ensure building names match exactly with buildings you've created</li>
          <li>Upload the completed CSV file</li>
        </ol>
        <button className="btn-secondary" onClick={onDownloadTemplate}>
          <FontAwesomeIcon icon={faDownload} />
          Download CSV Template
        </button>
      </div>

      <div className="file-upload-section">
        <label className="file-upload-label">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="file-upload-area">
            <FontAwesomeIcon icon={faFileExcel} className="upload-icon" />
            <p>{file ? file.name : 'Click to select CSV file'}</p>
            <small>Only .csv files are accepted</small>
          </div>
        </label>

        {preview && (
          <div className="csv-preview">
            <h4>Preview (first 5 rows):</h4>
            <pre>{preview}</pre>
          </div>
        )}

        {file && (
          <button
            className="btn-primary"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import Rooms'}
          </button>
        )}
      </div>

      {importResults && (
        <div className="import-results">
          <h3>Import Results</h3>
          <div className="results-summary">
            <div className="result-stat success">
              <FontAwesomeIcon icon={faCheckCircle} />
              <div>
                <strong>{importResults.imported}</strong>
                <span>Imported</span>
              </div>
            </div>
            <div className="result-stat warning">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <div>
                <strong>{importResults.skipped}</strong>
                <span>Skipped</span>
              </div>
            </div>
          </div>

          {importResults.skippedRows.length > 0 && (
            <div className="skipped-rows">
              <h4>Skipped Rows:</h4>
              <ul>
                {importResults.skippedRows.map((skip, i) => (
                  <li key={i}>
                    Row {skip.row}: {skip.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RoomManagement
