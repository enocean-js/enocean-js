export const a53005 = {
  number: '0x05',
  title: 'Single Input Contact, Retransmission, Battery Monitor',
  status: 'released',
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval:\n            <br/>- retransmission: 5 ... 255 seconds (one time configuration)\n            <br/>- number of retransmission times: 0 ... 127 times (one time configuration)\n            <br/>- heartbeat: 60 ... 65535 seconds (one time configuration)\n            <br/>Trigger event: digital input, retransmission, heartbeat\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -',
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
      shortcut: 'VDD',
      description: 'Supply voltage',
      info: {},
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '3.3'
      },
      unit: 'V'
    }, {
      data: 'Signal type',
      shortcut: 'ST',
      description: 'Signal type',
      info: {},
      bitoffs: '16',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Normal signal'
        }, {
          value: '1',
          description: 'Heart beat signal'
        }]
      }
    }, {
      data: 'Index of Signals',
      shortcut: 'IOS',
      description: 'Ordinal count',
      info: {},
      bitoffs: '17',
      bitsize: '7',
      enum: {
        item: {
          min: '0',
          max: '127',
          description: 'Increment a counter by new telegram'
        }
      }
    }]
  }],
  originalIndex: 133,
  eep: 'a5-30-05',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Digital Input',
  func_number: '0x30',
  submitter: [
    'ITEC'
  ]
}
