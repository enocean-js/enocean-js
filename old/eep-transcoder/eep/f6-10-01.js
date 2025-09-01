export const f61001 = {
  number: '0x01',
  title: 'Window Handle ERP2',
  status: 'released',
  description: '\n              <br/><br/>\n              DB0.6 – needs to show that RPS/ERP2 has a different coding as RPS/ERP1.',
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: '0',
      bitsize: '1',
      enum: {}
    }, {
      data: 'Handle coding',
      shortcut: 'HC',
      description: 'Signalize window handle coding',
      bitoffs: '1',
      bitsize: '1',
      enum: {
        item: {
          value: '1',
          description: 'handle'
        }
      }
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: '2',
      bitsize: '2',
      enum: {}
    }, {
      data: 'Handle value',
      shortcut: 'HVL',
      description: 'Value of the 4MSB of the Data field of ERP1 coding',
      bitoffs: '4',
      bitsize: '4',
      enum: {
        item: [{
          value: '0b11X0',
          description: 'Moved from up to left.\n                      <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_01.png</img>'
        }, {
          value: '0b1111',
          description: 'Moved from right to down.\n                      <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_02.png</img>'
        }, {
          value: '0b11X0',
          description: 'Moved from down to left.\n                      <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_03.png</img>'
        }, {
          value: '0b1101',
          description: 'Moved from left to up.\n\t\t\t\t\t  <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_04.png</img>'
        }, {
          value: '0b11X0',
          description: 'Moved from up to left.\n\t\t\t\t\t  <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_05.png</img>'
        }, {
          value: '0b1111',
          description: 'Moved from left  to down.\n\t\t\t\t\t  <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_06.png</img>'
        }, {
          value: '0b11X0',
          description: 'Moved from down to right.\n\t\t\t\t\t  <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_07.png</img>'
        }, {
          value: '0b1101',
          description: 'Moved from right to up.\n\t\t\t\t\t  <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_08.png</img>'
        }]
      }
    }]
  }],
  originalIndex: 11,
  eep: 'f6-10-01',
  rorg_title: 'RPS Telegram',
  rorg_number: '0xF6',
  func_title: 'Mechanical Handle',
  func_number: '0x10',
  submitter: [
    'HOPPE AG'
  ]
}
