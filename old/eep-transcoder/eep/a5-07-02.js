export const a50702 = {
  number: '0x02',
  title: 'Occupancy with Supply voltage monitor',
  status: 'released',
  description: '<br/><br/>\n  The transmission of “PIR off” telegrams is optional.',
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
      data: 'Supply voltage (REQUIRED)',
      shortcut: 'SVC',
      description: 'Supply voltage / super cap. (linear);<br/>\n      251 – 255 reserved for error code',
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
      data: 'PIR Status',
      shortcut: 'PIRS',
      description: 'PIR Status',
      info: 'PIR Status',
      bitoffs: '24',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Uncertain of occupancy status'
        }, {
          value: '1',
          description: 'Motion detected'
        }]
      }
    }, {
      reserved: {},
      bitoffs: '8',
      bitsize: '16'
    }, {
      reserved: {},
      bitoffs: '25',
      bitsize: '3'
    }, {
      reserved: {},
      bitoffs: '29',
      bitsize: '3'
    }]
  }],
  originalIndex: 48,
  eep: 'a5-07-02',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Occupancy Sensor',
  func_number: '0x07',
  submitter: [
    'Lutuo Technology'
  ]
}
