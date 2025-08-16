export const a51203 = {
  number: '0x03',
  title: 'Water',
  status: 'released',
  description: '',
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
      data: 'Meter reading',
      shortcut: 'MR',
      description: 'Cumulative value in m³\n              or\n              Current value in liter/s',
      bitoffs: '0',
      bitsize: '24',
      range: {
        min: '0',
        max: '16777215'
      },
      scale: {
        ref: 'DIV'
      },
      unit: {
        ref: 'DT'
      }
    }, {
      data: 'Tariff info',
      shortcut: 'TI',
      description: {},
      bitoffs: '24',
      bitsize: '4',
      range: {
        min: '0',
        max: '15'
      },
      scale: {
        min: '0',
        max: '15'
      },
      unit: '1'
    }, {
      data: 'Data type (unit)',
      shortcut: 'DT',
      description: 'Current value or cumulative value',
      bitoffs: '29',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Cumulative value',
          scale: '0',
          unit: 'm³'
        }, {
          value: '1',
          description: 'Current value',
          scale: '1',
          unit: 'Liter/s'
        }]
      }
    }, {
      data: 'Divisor (scale)',
      shortcut: 'DIV',
      description: 'Divisor for value',
      bitoffs: '30',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'x/1',
          scale: {
            min: '0',
            max: '16777215'
          }
        }, {
          value: '1',
          description: 'x/10',
          scale: {
            min: '0',
            max: '1677721.5'
          }
        }, {
          value: '2',
          description: 'x/100',
          scale: {
            min: '0',
            max: '167772.15'
          }
        }, {
          value: '3',
          description: 'x/1000',
          scale: {
            min: '0',
            max: '16777.215'
          }
        }]
      }
    }]
  }],
  originalIndex: 103,
  eep: 'a5-12-03',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Automated Meter Reading (AMR)',
  func_number: '0x12',
  submitter: [
    'EnOcean GmbH'
  ]
}
