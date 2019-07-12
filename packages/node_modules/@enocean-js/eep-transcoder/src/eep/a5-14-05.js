export const a51405 = {
  number: '0x05',
  title: 'Vibration/Tilt, Supply voltage monitor',
  status: 'released',
  description: '<br/><br/>\n          Purpose (eg): Intrusion (breakage of glass), Calling system',
  case: [{
    datafield: [{
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
      description: 'Supply voltage / super cap. (linear);\n                <br/>251 – 255 reserved for error code',
      info: {},
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '250'
      },
      scale: {
        min: '0',
        max: '5.0'
      },
      unit: 'V'
    }, {
      reserved: {},
      bitoffs: '8',
      bitsize: '20'
    }, {
      reserved: {},
      bitoffs: '29',
      bitsize: '1'
    }, {
      reserved: {},
      bitoffs: '31',
      bitsize: '1'
    }, {
      data: 'Vibration',
      shortcut: 'VIB',
      description: {},
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0b0',
          description: 'No vibration detected'
        }, {
          value: '0b1',
          description: 'Vibration detected'
        }]
      }
    }]
  }],
  originalIndex: 120,
  eep: 'a5-14-05',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Multi-Func Sensor',
  func_number: '0x14',
  submitter: [
    'Lutuo Technology'
  ]
}
