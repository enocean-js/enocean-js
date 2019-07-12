export const a50207 = {
  number: '0x07',
  title: 'Temperature Sensor Range +20°C to +60°C',
  status: 'released',
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: '0',
      bitsize: '16',
      scale: ''
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: '24',
      bitsize: '4',
      scale: ''
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: '29',
      bitsize: '3',
      scale: ''
    }, {
      data: 'LRN Bit',
      shortcut: 'LRNB',
      description: 'LRN Bit',
      bitoffs: '28',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Teach-in telegram'
        }, {
          value: '1',
          description: 'Data telegram'
        }]
      }
    }, {
      data: 'Temperature',
      shortcut: 'TMP',
      description: 'Temperature (linear)',
      info: 'DB_1 Temperature (8 bit) 20... +60°C, linear n=255...0',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '255',
        max: '0'
      },
      scale: {
        min: '+20',
        max: '+60'
      },
      unit: '°C'
    }]
  }],
  originalIndex: 19,
  eep: 'a5-02-07',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Temperature Sensors',
  func_number: '0x02',
  description: '',
  submitter: []
}
