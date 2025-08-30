export const d50001 = {
  number: '0x01',
  title: 'Single Input Contact',
  status: 'released',
  case: [{
    datafield: [{
      data: 'Contact',
      shortcut: 'CO',
      description: {},
      bitoffs: '7',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'open'
        }, {
          value: '1',
          description: 'closed'
        }]
      }
    }, {
      data: 'Learn Button',
      shortcut: 'LRN',
      description: '..',
      bitoffs: '4',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'pressed'
        }, {
          value: '1',
          description: 'not pressed'
        }]
      }
    }]
  }],
  originalIndex: 12,
  eep: 'd5-00-01',
  rorg_title: '1BS Telegram',
  rorg_number: '0xD5',
  func_title: 'Contacts and Switches',
  func_number: '0x00',
  description: '',
  submitter: []
}
