export const a5090b = {
  number: '0x0B',
  title: 'Radioactivity Sensor',
  status: 'released',
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>Radioactivity Sensor\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: -\n            <br/>Trigger event: change in radioactivity level\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: yes\n            <br/>Security level format: PSK, RLC, AES128',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '4',
      bitsize: '4'
    }, {
      data: 'Supply voltage',
      shortcut: 'SV',
      description: 'Supply voltage / super cap.',
      info: {},
      bitoffs: '0',
      bitsize: '4',
      range: {
        min: '0',
        max: '15'
      },
      scale: {
        min: '2.0',
        max: '5.0'
      },
      unit: 'V'
    }, {
      data: 'Radioactivity',
      shortcut: 'Ract',
      description: 'Radiation level',
      info: {},
      bitoffs: '8',
      bitsize: '16',
      range: {
        min: '0',
        max: '65535'
      },
      scale: {
        min: '0',
        max: '6553'
      },
      unit: 'According to'
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
      data: 'Scale Multiplier',
      shortcut: 'SCM',
      description: 'Scale Multiplier',
      bitoffs: '24',
      bitsize: '4',
      enum: {
        item: [{
          value: '0',
          description: '0.001'
        }, {
          value: '1',
          description: '0.01'
        }, {
          value: '2',
          description: '0.1'
        }, {
          value: '3',
          description: '1'
        }, {
          value: '4',
          description: '10'
        }, {
          value: '5',
          description: '100'
        }, {
          value: '6',
          description: '1000'
        }, {
          value: '7',
          description: '10000'
        }, {
          value: '8',
          description: '100000'
        }]
      }
    }, {
      data: 'Value unit',
      shortcut: 'VUNIT',
      description: 'The unit of the radiation level',
      bitoffs: '29',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'μSv/h'
        }, {
          value: '1',
          description: 'cpm'
        }, {
          value: '2',
          description: 'Bq/L'
        }, {
          value: '3',
          description: 'Bq/kg'
        }]
      }
    }, {
      data: 'Supply voltage availability',
      shortcut: 'SVA',
      description: 'Supply voltage availability at SV',
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Supply voltage is not supported'
        }, {
          value: '1',
          description: 'Supply voltage is supported'
        }]
      }
    }]
  }],
  originalIndex: 61,
  eep: 'a5-09-0b',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Gas Sensor',
  func_number: '0x09',
  submitter: [
    'SiMICS'
  ]
}
