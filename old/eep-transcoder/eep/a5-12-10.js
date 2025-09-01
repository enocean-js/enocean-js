export const a51210 = {
  number: '0x10',
  title: 'Current meter 16 channels',
  status: 'released',
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>\n            This profile is used for up to 16 channels current meters.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: can be defined by user\n            <br/>Trigger event: 10 or 20 % delta for observed value\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Recommendation</span>\n            <br/>Channels not used should not be transmitted.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Appendix</span>\n            <br/>\n            Our new product is a 12 channels current meter. It is able to measure,\n            using a maximum of 12 current transformers, the current (mA) or\n            cumulative current (mAh) of all of his channels.\n            It is however not sending data for not configured channels\n            (e.g. channels 12 to 15).\n            The meter is sending values every 5 or 10 seconds, and in order to\n            improve accuracy, a current fluctuation of more than 10 or 20 % will\n            trigger a new transmission of the corresponding channel.\n            <br/>\n            <img>graphics/A5-12-10.png</img>',
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
      description: 'Current value in mA or\n              cumulative value in A.h',
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
      data: 'Measurement channel',
      shortcut: 'CH',
      description: 'Channel no.',
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
      unit: {}
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
          unit: 'A.h'
        }, {
          value: '1',
          description: 'Current value',
          scale: '1',
          unit: 'mA'
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
  originalIndex: 106,
  eep: 'a5-12-10',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Automated Meter Reading (AMR)',
  func_number: '0x12',
  submitter: [
    'Ewattch'
  ]
}
