export const a5090a = {
  number: '0x0A',
  title: 'Hydrogen Gas Sensor',
  status: 'released',
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>\n            Hydrogen Gas Sensor with 16 bit resolution and 0-2000 ppm\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: -\n            <br/>Trigger event: change in gas concentration and temp\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: yes\n            <br/>Security level format: PSK, RLC, AES128',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '29',
      bitsize: '1'
    }, {
      data: 'Concentration',
      shortcut: 'Conc',
      description: 'Gas concentration',
      info: {},
      bitoffs: '0',
      bitsize: '16',
      range: {
        min: '0',
        max: '65535'
      },
      scale: {
        min: '0',
        max: '65535'
      },
      unit: 'ppm'
    }, {
      data: 'Temperature',
      shortcut: 'TEMP',
      description: 'Temperature (linear)',
      info: {},
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '-20',
        max: '+60'
      },
      unit: '°C'
    }, {
      data: 'Supply voltage',
      shortcut: 'SV',
      description: 'Supply voltage / super cap.',
      info: {},
      bitoffs: '24',
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
      data: 'Temp sensor availability',
      shortcut: 'TSA',
      description: 'Temp sensor availability at TMP',
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Temp sensor is not supported'
        }, {
          value: '1',
          description: 'Temp sensor is supported'
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
  originalIndex: 60,
  eep: 'a5-09-0a',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Gas Sensor',
  func_number: '0x09',
  submitter: [
    'SiMICS'
  ]
}
