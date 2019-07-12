export const a53001 = {
  number: '0x01',
  title: 'Single Input Contact, Battery Monitor',
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
      data: 'Supply voltage',
      shortcut: 'SVC',
      description: 'Supply voltage (linear)',
      info: 'DB_2: Supply voltage',
      bitoffs: '8',
      bitsize: '8',
      enum: {
        item: [{
          min: '0',
          max: '120',
          description: 'Battery LOW'
        }, {
          min: '121',
          max: '255',
          description: 'Battery OK'
        }]
      }
    }, {
      data: 'Input State',
      shortcut: 'IPS',
      description: 'Input State',
      info: 'DB_1: Input State',
      bitoffs: '16',
      bitsize: '8',
      enum: {
        item: [{
          min: '0',
          max: '195',
          description: 'Contact closed'
        }, {
          min: '196',
          max: '255',
          description: 'Contact open'
        }]
      }
    }]
  }],
  originalIndex: 129,
  eep: 'a5-30-01',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Digital Input',
  func_number: '0x30',
  description: '',
  submitter: []
}
