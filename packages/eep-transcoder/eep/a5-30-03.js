export const a53003 = {
  number: '0x03',
  title: '4 Digital Inputs, Wake and Temperature',
  status: 'released',
  description: '\n            <br/><br/>\n            Description:<br/>\n            This is used for universal modules with 4 digital inputs and a room temperature.\n            The wake input signal of the device is provided to show the telegram transmission trigger.\n            The application meaning and exact data interpretation of the digital channels depends on the end application and is not defined in this profile documentation.\n            <br/><br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>\n            Direction: unidirectional<br/>\n            Addressing: broadcast<br/>\n            Communication trigger: event- & time-triggered<br/>\n            Trigger event: wake event – application dependent<br/>\n            Teach-in method: 4BS teach-in 2\n            <br/><br/>\n            Appendix:<br/>\n            D1.4 – The Status of Wake signalizes the status of the WAKE PIN which has a special\n            meaning in an ultra low application. Usually, by a status change of this input the module\n            is triggered to perform a predefined operation.<br/><br/>\n            Applications using this profile:<br/>\n            <ul>\n            <li> water sensor conductive – Wake Status = 0 (water detected) </li>\n            <li> pressure gauge with minimum or maximum (wake signal, configurable if min or max) </li>\n            <li> indication and individual switching points (digital channels show different areas) </li>\n            </ul>',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '8'
    }, {
      reserved: {},
      bitoffs: '16',
      bitsize: '3'
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
      data: 'Temperature',
      shortcut: 'TMP',
      description: 'Temperature (linear)',
      info: 'Temperature (linear)',
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '255',
        max: '0'
      },
      scale: {
        min: '0',
        max: '40'
      },
      unit: '°C'
    }, {
      data: 'Status of Wake',
      shortcut: 'WA0',
      description: 'Value of wake signal',
      info: 'Status of Wake',
      bitoffs: '19',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Low'
        }, {
          value: '1',
          description: 'High'
        }]
      }
    }, {
      data: 'Digital Input 3',
      shortcut: 'DI3',
      description: 'Digital Input 3',
      info: 'Digital Input 3',
      bitoffs: '20',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Low'
        }, {
          value: '1',
          description: 'High'
        }]
      }
    }, {
      data: 'Digital Input 2',
      shortcut: 'DI2',
      description: 'Digital Input 2',
      info: 'Digital Input 2',
      bitoffs: '21',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Low'
        }, {
          value: '1',
          description: 'High'
        }]
      }
    }, {
      data: 'Digital Input 1',
      shortcut: 'DI1',
      description: 'Digital Input 1',
      info: 'Digital Input 1',
      bitoffs: '22',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Low'
        }, {
          value: '1',
          description: 'High'
        }]
      }
    }, {
      data: 'Digital Input 0',
      shortcut: 'DI0',
      description: 'Digital Input 0',
      info: 'Digital Input 0',
      bitoffs: '23',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Low'
        }, {
          value: '1',
          description: 'High'
        }]
      }
    }]
  }],
  originalIndex: 131,
  eep: 'a5-30-03',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Digital Input',
  func_number: '0x30',
  submitter: [
    'Afriso',
    'EnOcean'
  ]
}
