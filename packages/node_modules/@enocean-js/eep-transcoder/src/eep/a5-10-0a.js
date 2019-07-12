export const a5100a = {
  number: '0x0A',
  title: 'Temperature Sensor, Set Point Adjust and Single Input Contact',
  status: 'released',
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
      info: 'DB_2: Set point Min. - … Max. +, linear n=0...255',
      bitoffs: '8',
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
      data: 'Temperature',
      shortcut: 'TMP',
      description: 'Temperature (linear)',
      info: 'DB_1: Temperature 0...40°C, linear n=255...0',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '255',
        max: '0'
      },
      scale: {
        min: '0',
        max: '+40'
      },
      unit: '°C'
    }, {
      data: 'Contact State',
      shortcut: 'CTST',
      description: 'Contact state',
      info: 'Contact state',
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'closed'
        }, {
          value: '1',
          description: 'open'
        }]
      }
    }]
  }],
  originalIndex: 71,
  eep: 'a5-10-0a',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Room Operating Panel',
  func_number: '0x10',
  description: '',
  submitter: []
}
