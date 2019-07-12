export const a51017 = {
  number: '0x17',
  title: '10 Bit Temperature Sensor, Occupancy Control',
  status: 'released',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '14'
    }, {
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
      data: 'Temperature',
      shortcut: 'TMP',
      description: 'Temperature 10 bit (linear)',
      info: 'DB_1.0(LSB) to DB_2.1(MSB) Temperature (10 bit) -10...41.2°C, linear n=1023...0',
      bitoffs: '14',
      bitsize: '10',
      range: {
        min: '1023',
        max: '0'
      },
      scale: {
        min: '-10',
        max: '+41.2'
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
  originalIndex: 82,
  eep: 'a5-10-17',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Room Operating Panel',
  func_number: '0x10',
  description: '',
  submitter: []
}
