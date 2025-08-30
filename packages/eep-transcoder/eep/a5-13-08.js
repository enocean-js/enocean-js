export const a51308 = {
  number: '0x08',
  title: 'Rain Sensor',
  status: 'released',
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>This profile provides rain sensor information.\n            <br/>That includes the current rainfall count value and the rainfall count correction.\n            <br/>Using these values, the receiver of the information can calculate the currently\n                 measured amount of rainfall.\n            <br/>\n            <br/>Rainfall = (Rainfall Count x 0.6875 mm) x (1+ (Rainfall Adjust Sign) Rainfall Adjust)\n            <br/>\n            <br/>Example:\n            <br/>Rainfall Count = 10\n            <br/>Rainfall Adjust = 26\n            <br/>Rainfall Adjust Sign = 1\n            <br/>Rainfall = 10 x 0.6875 mm X (1 + 2.6/100) = 7.05375 mm\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: time-triggered\n            <br/>Communication interval: 183 seconds\n            <br/>Trigger event: timer\n            <br/>Tx delay: N/A\n            <br/>Rx timeout: N/A\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 1\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: N/A',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '1'
    }, {
      reserved: {},
      bitoffs: '24',
      bitsize: '4'
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
      data: 'Rainfall Adjust Sign',
      shortcut: 'RAS',
      description: 'Provides the sign of the rainfall adjust value',
      bitoffs: '1',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Negative'
        }, {
          value: '1',
          description: 'Positive'
        }]
      }
    }, {
      data: 'Rainfall Adjust',
      shortcut: 'RFA',
      description: 'Provides the rainfall count correction value',
      info: {},
      bitoffs: '2',
      bitsize: '6',
      enum: {
        item: [{
          min: '0',
          max: '39',
          scale: {
            min: '0',
            max: '3.9'
          },
          unit: '%'
        }, {
          min: '40',
          max: '63',
          description: 'Reserved'
        }]
      }
    }, {
      data: 'Rainfall Count',
      shortcut: 'RFC',
      description: 'Number of counted rain drops',
      info: {},
      bitoffs: '8',
      bitsize: '16',
      range: {
        min: '0',
        max: '65535'
      },
      scale: {
        min: '0',
        max: '65535'
      },
      unit: {}
    }, {
      data: 'Battery Status',
      shortcut: 'BS',
      description: 'Indicates if the battery is low',
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Battery okay'
        }, {
          value: '1',
          description: 'Battery low'
        }]
      }
    }]
  }],
  originalIndex: 114,
  eep: 'a5-13-08',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Environmental Applications',
  func_number: '0x13',
  submitter: [
    'Hideki Electronics Limited'
  ]
}
