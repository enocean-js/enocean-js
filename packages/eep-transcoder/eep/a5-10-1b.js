export const a5101b = {
  number: '0x1B',
  title: 'Supply Voltage Monitor, Illumination, Temperature Sensor, Fan Speed and Occupancy Control',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '24',
      bitsize: '1'
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
      data: 'Supply Voltage',
      shortcut: 'SV',
      description: '(super cap)\n 251 – 255 reserved for error code',
      info: 'DB_3: Supply Voltage (super cap).',
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '250'
      },
      scale: {
        min: '0',
        max: '5'
      },
      unit: 'V'
    }, {
      data: 'Illumination',
      shortcut: 'ILL',
      description: 'Illumination (linear), 251: Over range, 252-255: reserved',
      info: 'DB_2: Illumination 0 – 1000 Lux, Linear 0-250,\n              251 - over range, 252-255 reserved',
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '0',
        max: '250'
      },
      scale: {
        min: '0',
        max: '1000'
      },
      unit: 'lx'
    }, {
      data: 'Temperature',
      shortcut: 'TMP',
      description: 'Temperature (linear)',
      info: 'DB_1: Temperature 0...40°C, linear n=0...250',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '250',
        max: '0'
      },
      scale: {
        min: '0',
        max: '+40'
      },
      unit: '°C'
    }, {
      data: 'Fan speed',
      shortcut: 'FAN',
      description: 'Fan Speed',
      info: 'DB_0.BIT_5_ BIT_4: Fan speed',
      bitoffs: '25',
      bitsize: '3',
      enum: {
        item: [{
          value: '0',
          description: 'Auto'
        }, {
          value: '1',
          description: 'Speed 0'
        }, {
          value: '2',
          description: 'Speed 1'
        }, {
          value: '3',
          description: 'Speed 2'
        }, {
          value: '4',
          description: 'Speed 3'
        }, {
          value: '5',
          description: 'Speed 4'
        }, {
          value: '6',
          description: 'Speed 5'
        }, {
          value: '7',
          description: 'Off'
        }]
      }
    }, {
      data: 'Occupancy enable/disable',
      shortcut: 'OED',
      description: {},
      info: 'DB_0.BIT_1: Occ enable/disable',
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Occupancy enabled'
        }, {
          value: '1',
          description: 'Occupancy disabled'
        }]
      }
    }, {
      data: 'Occupancy button',
      shortcut: 'OB',
      description: {},
      info: 'DB_0.BIT_0: Occupancy button',
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
  originalIndex: 86,
  eep: 'a5-10-1b',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Room Operating Panel',
  func_number: '0x10',
  description: '',
  submitter: []
}
