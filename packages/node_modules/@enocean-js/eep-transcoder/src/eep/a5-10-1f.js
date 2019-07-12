export const a5101f = {
  number: '0x1F',
  title: 'Temperature Sensor, Set Point, Fan Speed, Occupancy and Unoccupancy Control',
  description: '',
  case: [{
    datafield: [{
      data: 'Turn-switch for fan speed',
      shortcut: 'FAN',
      description: 'Turn-switch for fan speed',
      info: {},
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: [{
          min: '210',
          max: '255',
          description: 'Stage auto'
        }, {
          min: '190',
          max: '209',
          description: 'Stage 0'
        }, {
          min: '165',
          max: '189',
          description: 'Stage 1'
        }, {
          min: '145',
          max: '164',
          description: 'Stage 2'
        }, {
          min: '0',
          max: '144',
          description: 'Stage 3'
        }]
      }
    }, {
      data: 'Set Point',
      shortcut: 'SP',
      description: 'Set point (linear) Min.- ... Max+',
      info: {},
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
      info: {},
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
      reserved: {},
      bitoffs: '24',
      bitsize: '1'
    }, {
      data: 'Temperature flag',
      shortcut: 'TMP_F',
      description: 'Temperature flag',
      bitoffs: '25',
      bitsize: '1',
      enum: {
        item: [{
          value: '1',
          description: 'Temperature present'
        }, {
          value: '0',
          description: 'Temperature absent'
        }]
      }
    }, {
      data: 'Set point flag',
      shortcut: 'SP_F',
      description: 'Set point flag',
      bitoffs: '26',
      bitsize: '1',
      enum: {
        item: [{
          value: '1',
          description: 'Set point present'
        }, {
          value: '0',
          description: 'Set point absent'
        }]
      }
    }, {
      data: 'Fan speed flag',
      shortcut: 'FAN_F',
      description: 'Fan speed flag',
      bitoffs: '27',
      bitsize: '1',
      enum: {
        item: [{
          value: '1',
          description: 'Fan speed present'
        }, {
          value: '0',
          description: 'Fan speed absent'
        }]
      }
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
      data: 'Unoccupancy',
      shortcut: 'UNOCC',
      description: 'Unoccupancy button',
      info: {},
      bitoffs: '30',
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
    }, {
      data: 'Occupancy',
      shortcut: 'OCC',
      description: 'Occupancy button',
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
  originalIndex: 90,
  eep: 'a5-10-1f',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Room Operating Panel',
  func_number: '0x10',
  submitter: [
    'Distech Controls'
  ]
}
