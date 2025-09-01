export const a50402 = {
  number: '0x02',
  title: 'Range -20°C to +60°C and 0% to 100%',
  status: 'released',
  description: '',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '8'
    }, {
      reserved: {},
      bitoffs: '24',
      bitsize: '4'
    }, {
      reserved: {},
      bitoffs: '29',
      bitsize: '1'
    }, {
      reserved: {},
      bitoffs: '31',
      bitsize: '1'
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
      info: 'DB_1 Temperature (8 bit) -20...+60°C, linear n=0...250',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '250'
      },
      scale: {
        min: '-20',
        max: '+60'
      },
      unit: '°C'
    }, {
      data: 'T-Sensor',
      shortcut: 'TSN',
      description: 'Availability of the Temperature Sensor',
      info: {},
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'not available'
        }, {
          value: '1',
          description: 'available'
        }]
      }
    }]
  }],
  originalIndex: 39,
  eep: 'a5-04-02',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Temperature and Humidity Sensor',
  func_number: '0x04',
  submitter: [
    'Eltako'
  ]
}
