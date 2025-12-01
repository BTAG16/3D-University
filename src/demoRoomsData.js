// Demo rooms data for DemoMap
// This simulates what would be in the database

export const demoRoomsData = {
  'demo-admin': [
    {
      id: 'room-admin-1',
      building_id: 'demo-admin',
      room_number: '101',
      room_name: "Registrar's Office",
      is_office: true,
      purpose: 'Course registration, transcripts, and academic records',
      hours: 'Mon-Fri: 9:00 AM - 4:00 PM',
      floor: 1,
      timetable: {
        services: [
          'Phone reception',
          'Personal reception',
          'Document verification',
          'Transcript requests'
        ],
        schedule: {
          monday: {
            am: {
              time: '8:00 – 9:00',
              services: ['Phone reception']
            },
            midmorning: {
              time: '9:00 - 11:00',
              services: ['Personal reception', 'Document verification']
            },
            noon: {
              time: '11:00 - 12:00',
              services: ['Transcript requests']
            }
          },
          tuesday: {
            am: {
              time: '8:00 - 10:00',
              services: ['Phone reception']
            },
            midmorning: {
              time: '10:00 - 12:00',
              services: ['Personal reception']
            }
          },
          wednesday: {
            am: {
              time: '8:00 - 9:00',
              services: ['Phone reception']
            },
            noon: {
              time: '11:00 - 12:00',
              services: ['Document verification']
            }
          },
          thursday: {
            am: {
              time: '8:00 - 9:00',
              services: ['Phone reception']
            },
            pm: {
              time: '13:00 – 15:00',
              services: ['Personal reception']
            }
          },
          friday: {
            am: {
              time: '9:00 - 12:00',
              services: ['Personal reception', 'Document verification']
            }
          }
        },
        notes: 'Please arrive 10 minutes before your appointment. Bring valid ID and required documents.'
      }
    },
    {
      id: 'room-admin-2',
      building_id: 'demo-admin',
      room_number: '102',
      room_name: 'Financial Aid Office',
      is_office: true,
      purpose: 'Financial aid counseling, scholarship information, and loan processing',
      hours: 'Mon-Fri: 9:00 AM - 4:00 PM',
      floor: 1,
      timetable: {
        services: [
          'Walk-in consultation',
          'Scheduled appointments',
          'Document submission'
        ],
        schedule: {
          monday: {
            morning: {
              time: '9:00 - 12:00',
              services: ['Walk-in consultation']
            },
            afternoon: {
              time: '13:00 - 16:00',
              services: ['Scheduled appointments']
            }
          },
          wednesday: {
            morning: {
              time: '9:00 - 12:00',
              services: ['Walk-in consultation']
            },
            afternoon: {
              time: '13:00 - 16:00',
              services: ['Scheduled appointments']
            }
          },
          friday: {
            morning: {
              time: '9:00 - 12:00',
              services: ['Document submission']
            }
          }
        },
        notes: 'Walk-ins welcome Monday and Wednesday mornings. Appointments recommended for afternoons.'
      }
    },
    {
      id: 'room-admin-3',
      building_id: 'demo-admin',
      room_number: '201',
      room_name: 'Student Services Center',
      is_office: true,
      purpose: 'General student support, ID cards, and campus information',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
      floor: 2
    },
    {
      id: 'room-admin-4',
      building_id: 'demo-admin',
      room_number: '202',
      room_name: 'Conference Room A',
      is_office: false,
      purpose: null,
      hours: null,
      floor: 2
    }
  ],
  'demo-library': [
    {
      id: 'room-library-1',
      building_id: 'demo-library',
      room_number: 'Main Desk',
      room_name: 'Reference & Information Desk',
      is_office: true,
      purpose: 'Research assistance, library help, and general inquiries',
      hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
      floor: 1,
      timetable: {
        services: [
          'Research consultation',
          'Library orientation',
          'Computer assistance'
        ],
        schedule: {
          monday: {
            slot1: {
              time: '9:00 - 12:00',
              services: ['Research consultation', 'Computer assistance']
            },
            slot2: {
              time: '13:00 - 17:00',
              services: ['Research consultation']
            }
          },
          tuesday: {
            slot1: {
              time: '9:00 - 12:00',
              services: ['Library orientation']
            },
            slot2: {
              time: '13:00 - 17:00',
              services: ['Research consultation']
            }
          },
          wednesday: {
            slot1: {
              time: '9:00 - 12:00',
              services: ['Research consultation', 'Computer assistance']
            },
            slot2: {
              time: '13:00 - 17:00',
              services: ['Research consultation']
            }
          },
          thursday: {
            slot1: {
              time: '9:00 - 12:00',
              services: ['Library orientation']
            },
            slot2: {
              time: '13:00 - 17:00',
              services: ['Research consultation']
            }
          },
          friday: {
            slot1: {
              time: '9:00 - 12:00',
              services: ['Research consultation']
            }
          }
        },
        notes: 'Library orientations available Tuesday and Thursday mornings. Book your slot online.'
      }
    },
    {
      id: 'room-library-2',
      building_id: 'demo-library',
      room_number: 'Lab-A',
      room_name: 'Computer Lab',
      is_office: false,
      purpose: null,
      hours: 'Mon-Thu: 7:00 AM - 11:00 PM',
      floor: 2
    },
    {
      id: 'room-library-3',
      building_id: 'demo-library',
      room_number: 'Study-1',
      room_name: 'Group Study Room 1',
      is_office: false,
      purpose: null,
      hours: null,
      floor: 3
    }
  ],
  'demo-dormitory': [
    {
      id: 'room-dorm-1',
      building_id: 'demo-dormitory',
      room_number: 'RA-Office',
      room_name: 'Resident Advisor Office',
      is_office: true,
      purpose: 'Dormitory support, residential life programs, and student assistance',
      hours: 'Available 24/7',
      floor: 1,
      timetable: {
        services: [
          'Office hours',
          'Emergency support',
          'Event planning'
        ],
        schedule: {
          monday: {
            evening: {
              time: '18:00 - 21:00',
              services: ['Office hours', 'Event planning']
            }
          },
          wednesday: {
            evening: {
              time: '18:00 - 21:00',
              services: ['Office hours', 'Event planning']
            }
          },
          friday: {
            evening: {
              time: '18:00 - 20:00',
              services: ['Office hours']
            }
          }
        },
        notes: 'Emergency support available 24/7. Call campus security for after-hours emergencies.'
      }
    },
    {
      id: 'room-dorm-2',
      building_id: 'demo-dormitory',
      room_number: 'Common',
      room_name: 'Common Lounge',
      is_office: false,
      purpose: null,
      hours: null,
      floor: 1
    }
  ]
}

export const getAllRoomsForBuilding = (buildingId) => {
  return demoRoomsData[buildingId] || []
}

export const getOfficeRoomsForBuilding = (buildingId) => {
  const rooms = demoRoomsData[buildingId] || []
  return rooms.filter(room => room.is_office)
}
