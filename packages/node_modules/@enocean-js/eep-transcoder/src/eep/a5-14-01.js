export const a51401 = {
  number: '0x01',
  title: 'Single Input Contact (Window/Door), Supply voltage monitor',
  status: 'released',
  description: '<br/><br/>\n          Purpose (eg): Ventilation, Lighting, Alarm',
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
      description: 'Supply voltage / super cap. (linear);<br/>\n            251 – 255 reserved for error code',
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
      bitsize: '2'
    }, {
      data: 'Contact',
      shortcut: 'CT',
      description: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0b0',
          description: 'Contact closed'
        }, {
          value: '0b1',
          description: 'Contact open'
        }]
      }
    }]
  }],
  originalIndex: 116,
  eep: 'a5-14-01',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Multi-Func Sensor',
  func_number: '0x14',
  submitter: [
    'Lutuo Technology'
  ]
}
