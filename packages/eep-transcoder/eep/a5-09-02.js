export const a50902 = {
  number: '0x02',
  title: 'CO-Sensor 0 ppm to 1020 ppm',
  status: 'released',
  description: '',
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
      data: 'Supply voltage',
      shortcut: 'SVC',
      description: 'Supply voltage (linear)',
      info: {},
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
      data: 'Concentration',
      shortcut: 'Conc',
      description: 'Gas concentration',
      info: {},
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '1020'
      },
      unit: 'ppm'
    }, {
      data: 'Temperature',
      shortcut: 'TMP',
      description: 'Temperature (linear)',
      info: {},
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '+51'
      },
      unit: '°C'
    }, {
      data: 'T-Sensor',
      shortcut: 'TSN',
      description: '..',
      info: {},
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Temperature Sensor not available'
        }, {
          value: '1',
          description: 'Temperature Sensor available'
        }]
      }
    }]
  }],
  originalIndex: 53,
  eep: 'a5-09-02',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Gas Sensor',
  func_number: '0x09',
  submitter: [
    'Unitronic AG'
  ]
}
