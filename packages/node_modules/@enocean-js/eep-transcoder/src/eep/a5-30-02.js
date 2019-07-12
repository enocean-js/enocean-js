export const a53002 = {
  number: '0x02',
  title: 'Single Input Contact',
  status: 'released',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '28'
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
      data: 'Input State',
      shortcut: 'IPS',
      description: 'Input State',
      info: 'DB_0.0: Input State',
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Contact closed'
        }, {
          value: '1',
          description: 'Contact open'
        }]
      }
    }]
  }],
  originalIndex: 130,
  eep: 'a5-30-02',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Digital Input',
  func_number: '0x30',
  description: '',
  submitter: []
}
