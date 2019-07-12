export const a51002 = {
  number: '0x02',
  title: 'Temperature Sensor, Set Point, Fan Speed and Day/Night Control',
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
      data: 'Turn-switch for fan speed',
      shortcut: 'FAN',
      description: 'Turn-switch for fan speed',
      info: 'DB_3: Turn-switch for fan speed',
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: [{
          min: '210',
          max: '255',
          description: 'Stage Auto'
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
      data: 'Slide switch 0/I',
      shortcut: 'SLSW',
      description: 'Slide switch or Slide switch Day/Night',
      info: '...',
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Position I / Night / Off'
        }, {
          value: '1',
          description: 'Position O / Day / On'
        }]
      }
    }]
  }],
  originalIndex: 63,
  eep: 'a5-10-02',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Room Operating Panel',
  func_number: '0x10',
  description: '',
  submitter: []
}
