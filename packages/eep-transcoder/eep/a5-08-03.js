export const a50803 = {
  number: '0x03',
  title: 'Range 0lx to 1530lx, -30°C to +50°C and Occupancy Button',
  status: 'released',
  description: 'E.g. for outdoor sensor.',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '24',
      bitsize: '4'
    }, {
      reserved: {},
      bitoffs: '29',
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
      data: 'Supply voltage',
      shortcut: 'SVC',
      description: 'Supply voltage (linear)',
      info: 'DB_3: Supply voltage 0…5.1V, linear n=0…255',
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '5.1'
      },
      unit: 'V'
    }, {
      data: 'Illumination',
      shortcut: 'ILL',
      description: 'Illumination (linear)',
      info: 'DB_2: Illumination 0...1530lx, linear n=0...255',
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '1530'
      },
      unit: 'lx'
    }, {
      data: 'Temperature',
      shortcut: 'TMP',
      description: 'Temperature (linear)',
      info: 'DB_1: -30...50°C, linear n=0...255',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '-30',
        max: '+50'
      },
      unit: '°C'
    }, {
      data: 'PIR Status',
      shortcut: 'PIRS',
      description: 'PIR Status',
      info: {},
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'PIR on'
        }, {
          value: '1',
          description: 'PIR off'
        }]
      }
    }, {
      data: 'Occupancy Button',
      shortcut: 'OCC',
      description: '..',
      info: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Button pressed'
        }, {
          value: '1',
          description: 'Button released'
        }]
      }
    }]
  }],
  originalIndex: 52,
  eep: 'a5-08-03',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Light, Temperature and Occupancy Sensor',
  func_number: '0x08',
  submitter: []
}
