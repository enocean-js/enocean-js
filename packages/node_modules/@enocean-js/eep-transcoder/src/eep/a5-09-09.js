export const a50909 = {
  number: '0x09',
  title: 'Pure CO2 Sensor with Power Failure Detection',
  status: 'released',
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>Pure CO2 sensor with 8 bit resolution and 0 – 2000ppm.\n            <br/>1 digital Input – Power failure detection.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Trigger event: change of value over threshold, heartbeat, change of digital Input\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Remark</span>\n            <br/>Power failure detection expresses that the device was cut from power\n            source (unplugged / general power failure) and the device will probably\n            stop functioning very soon. In this case the measured value CO2 is\n            the last valid value.',
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
      reserved: {},
      bitoffs: '30',
      bitsize: '2'
    }, {
      data: 'CO2',
      shortcut: 'CO2',
      description: 'CO2 measurement',
      info: {},
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '2000'
      },
      unit: 'ppm'
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
      data: 'Power Failure detection',
      shortcut: 'PFD',
      description: 'Indicates if power supply has a failure / is not available',
      bitoffs: '29',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Power failure not detected'
        }, {
          value: '1',
          description: 'Power failure detected'
        }]
      }
    }]
  }],
  originalIndex: 59,
  eep: 'a5-09-09',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Gas Sensor',
  func_number: '0x09',
  submitter: [
    'Afriso',
    'EnOcean'
  ]
}
