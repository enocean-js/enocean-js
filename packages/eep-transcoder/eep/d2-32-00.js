export const d23200 = {
  number: '0x00',
  title: 'Type 0x00',
  status: 'released',
  description: '\n              <br/>\n              <br/>\n              <img>graphics/D2-32-00.png</img>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Notes</span>\n              <br/>1) If Power Fail bit is set, all channel readings will be set to\n              zero when this final telegram is sent.\n              <br/>2) Scale/divisor is set to 0 or 1 for all channels only, not individually.',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '2',
      bitsize: '6'
    }, {
      reserved: {},
      bitoffs: '20',
      bitsize: '4'
    }, {
      data: 'Power Fail',
      shortcut: 'PF',
      description: 'See Note 1',
      info: {},
      bitoffs: '0',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'False'
        }, {
          value: '1',
          description: 'True'
        }]
      }
    }, {
      data: 'Divisor',
      shortcut: 'DIV',
      description: 'Divisor for all channels',
      info: {},
      bitoffs: '1',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'x/1',
          scale: {
            min: 0,
            max: 4095
          }
        }, {
          value: '1',
          description: 'x/10',
          scale: {
            min: 0,
            max: 409.5
          }
        }]
      }
    }, {
      data: 'Channel 1',
      shortcut: 'CH1',
      description: 'Current value',
      info: {},
      bitoffs: '8',
      bitsize: '12',
      range: {
        min: '0',
        max: '0xFFF'
      },
      scale: {
        ref: 'DIV'
      },
      unit: 'A'
    }]
  }],
  originalIndex: 206,
  eep: 'd2-32-00',
  rorg_title: 'VLD Telegram',
  rorg_number: '0xD2',
  func_title: 'A.C. Current Clamp',
  func_number: '0x32',
  submitter: [
    'Pressac Communications Ltd'
  ]
}
