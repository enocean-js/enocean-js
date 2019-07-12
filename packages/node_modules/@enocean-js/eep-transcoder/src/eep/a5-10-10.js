export const a51010 = {
  number: '0x10',
  title: 'Temperature and Humidity Sensor, Set Point and Occupancy Control',
  status: 'released',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '24',
      bitsize: '4'
    }, {
      reserved: {},
      bitoffs: '29',
      bitsize: '2'
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
      data: 'Set point',
      shortcut: 'SP',
      description: 'Set point (linear)   Min.- ... Max+',
      info: 'DB_3: Set point Min. - … Max. +, linear n=0...255',
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '255'
      },
      unit: 'N/A'
    }, {
      data: 'Humidity',
      shortcut: 'HUM',
      description: 'Rel. Humidity (linear)',
      info: 'DB_2: Rel. Humidity 0...100%, linear n=0...250',
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '0',
        max: '250'
      },
      scale: {
        min: '0',
        max: '100'
      },
      unit: '%'
    }, {
      data: 'Temperature',
      shortcut: 'TMP',
      description: 'Temperature (linear)',
      info: 'DB_1: Temperature 0...40°C, linear n=255...0',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '250'
      },
      scale: {
        min: '0',
        max: '+40'
      },
      unit: '°C'
    }, {
      data: 'Occupancy',
      shortcut: 'OCC',
      description: 'Occupancy button',
      info: 'Occupancy button',
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '1',
          description: 'Button released'
        }, {
          value: '0',
          description: 'Button pressed'
        }]
      }
    }]
  }],
  originalIndex: 75,
  eep: 'a5-10-10',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Room Operating Panel',
  func_number: '0x10',
  description: '',
  submitter: []
}
