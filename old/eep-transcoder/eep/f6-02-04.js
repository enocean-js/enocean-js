export const f60204 = {
  number: '0x04',
  title: 'Light and blind control ERP2',
  status: 'released',
  description: '',
  case: [{
    datafield: [{
      data: 'Energy Bow',
      shortcut: 'EBO',
      description: 'State of the energy bow',
      bitoffs: '0',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'released'
        }, {
          value: '1',
          description: 'pressed'
        }]
      }
    }, {
      data: 'Button coding',
      shortcut: 'BC',
      description: 'Signalize button coding',
      bitoffs: '1',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'button'
        }]
      }
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: '2',
      bitsize: '2'
    }, {
      data: 'BI',
      shortcut: 'RBI',
      description: 'State I of the rocker B',
      bitoffs: '4',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'not pressed'
        }, {
          value: '1',
          description: 'pressed'
        }]
      }
    }, {
      data: 'B0',
      shortcut: 'RB0',
      description: 'State 0 of the rocker B',
      bitoffs: '5',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'not pressed'
        }, {
          value: '1',
          description: 'pressed'
        }]
      }
    }, {
      data: 'AI',
      shortcut: 'RAI',
      description: 'State I of the rocker A',
      bitoffs: '6',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'not pressed'
        }, {
          value: '1',
          description: 'pressed'
        }]
      }
    }, {
      data: 'A0',
      shortcut: 'RA0',
      description: 'State 0 of the rocker A',
      bitoffs: '7',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'not pressed'
        }, {
          value: '1',
          description: 'pressed'
        }]
      }
    }]
  }],
  originalIndex: 4,
  eep: 'f6-02-04',
  rorg_title: 'RPS Telegram',
  rorg_number: '0xF6',
  func_title: 'Rocker Switch, 2 Rocker',
  func_number: '0x02',
  submitter: [
    'EnOcean GmbH'
  ],
  icon: 'Switch.svg'
}
