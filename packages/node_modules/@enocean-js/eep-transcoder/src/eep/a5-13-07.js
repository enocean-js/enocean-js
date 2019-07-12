export const a51307 = {
  number: '0x07',
  title: 'Wind Sensor',
  status: 'released',
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>This profile provides wind sensor information.\n            <br/>That includes the current wind direction, the average and the\n            maximum wind speed.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: time-triggered\n            <br/>Communication interval: 33 seconds\n            <br/>Trigger event: timer\n            <br/>Tx delay: N/A\n            <br/>Rx timeout: N/A\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 1\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: N/A',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '4'
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
      data: 'Wind Direction',
      shortcut: 'WD',
      description: 'Shows the current wind direction',
      bitoffs: '4',
      bitsize: '4',
      enum: {
        item: [{
          value: '0',
          description: 'NNE'
        }, {
          value: '1',
          description: 'NE'
        }, {
          value: '2',
          description: 'ENE'
        }, {
          value: '3',
          description: 'E'
        }, {
          value: '4',
          description: 'ESE'
        }, {
          value: '5',
          description: 'SE'
        }, {
          value: '6',
          description: 'SSE'
        }, {
          value: '7',
          description: 'S'
        }, {
          value: '8',
          description: 'SSW'
        }, {
          value: '9',
          description: 'SW'
        }, {
          value: '10',
          description: 'WSW'
        }, {
          value: '11',
          description: 'W'
        }, {
          value: '12',
          description: 'WNW'
        }, {
          value: '13',
          description: 'NW'
        }, {
          value: '14',
          description: 'NNW'
        }, {
          value: '15',
          description: 'N'
        }]
      }
    }, {
      data: 'Average Wind Speed',
      shortcut: 'AWS',
      description: 'Linear average wind speed',
      info: {},
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '1',
        max: '199.9'
      },
      unit: 'mph'
    }, {
      data: 'Maximum Wind Speed',
      shortcut: 'MWS',
      description: 'Maximum wind speed',
      info: {},
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '1',
        max: '199.9'
      },
      unit: 'mph'
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
  originalIndex: 113,
  eep: 'a5-13-07',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Environmental Applications',
  func_number: '0x13',
  submitter: [
    'Hideki Electronics Limited'
  ]
}
