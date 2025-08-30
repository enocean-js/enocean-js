export const a53004 = {
  number: '0x04',
  title: '3 Digital Inputs, 1 Digital Input 8 Bits',
  status: 'released',
  description: '\n            <br/>\n            <br/>Description:\n            <br/>This profile is used for universal module with 1 analog input (= 8 bits resolution digital) and 3 digital inputs.\n            The application meaning and exact data interpretation of the input channels depends on the\n            end application and is not defined in this profile documentation.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Trigger event: values have changed\n            <br/>Teach-in method: 4BS teach-in 2',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '16'
    }, {
      reserved: {},
      bitoffs: '24',
      bitsize: '4'
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
      data: 'Digital value-input',
      shortcut: 'DV0',
      description: 'Digital value 1 byte',
      info: 'Digital value-input',
      bitoffs: '16',
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
      data: 'Digital Input 2',
      shortcut: 'DI2',
      description: 'Measured digital Input 2',
      info: 'Digital Input 2',
      bitoffs: '29',
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
      description: 'Measured digital Input 1',
      info: 'Digital Input 1',
      bitoffs: '30',
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
      description: 'Measured digital Input 0',
      info: 'Digital Input 0',
      bitoffs: '31',
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
  originalIndex: 132,
  eep: 'a5-30-04',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Digital Input',
  func_number: '0x30',
  submitter: [
    'Afriso',
    'EnOcean'
  ]
}
