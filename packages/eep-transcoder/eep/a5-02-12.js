export const a50212 = {
  number: '0x12',
  title: 'Temperature Sensor Range -40°C to +40°C',
  status: 'released',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '16'
    }, {
      reserved: {},
      bitoffs: '24',
      bitsize: '4'
    }, {
      reserved: {},
      bitoffs: '29',
      bitsize: '3'
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
      info: 'DB_1 Temperature (8 bit) -40... +40°C, linear n=255...0',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '255',
        max: '0'
      },
      scale: {
        min: '-40',
        max: '+40'
      },
      unit: '°C'
    }]
  }],
  originalIndex: 26,
  eep: 'a5-02-12',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Temperature Sensors',
  func_number: '0x02',
  description: '',
  submitter: []
}
