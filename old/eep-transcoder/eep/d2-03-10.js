export const d20310 = {
  number: '0x10',
  title: 'Mechanical Handle',
  status: 'released',
  description: '\n              <br/>\n              <br/>This document contains the description of\n              <span style="border-bottom:2px groove #000000;">decrypted</span> mechanical handle data.\n              The mechanical handle profile must be redefined because there is no\n              status field in EnOcean security available.\n              <br/>\n              <br/>\n              <b>EEP Properties:</b>\n              <br/>DATA EXCHANGE\n              <br/>Direction: unidirectional\n              <br/>Addressing: broadcast\n              <br/>Communication trigger: event-triggered\n              <br/>Communication interval: N/A\n              <br/>Trigger event: rotate mechanical handle\n              <br/>Tx delay: N/A\n              <br/>Rx timeout: N/A\n              <br/>\n              <br/>TEACH-IN\n              <br/>Teach-in method: Secure Teach-in, followed by special RPS teach-in\n              sequence: Mechanical handle (closed => opened => closed within 2s)\n              <br/>\n              <br/>SECURITY\n              <br/>Encryption supported: yes\n              <br/>Security level format:',
  case: [{
    datafield: [{
      data: 'Window handle, decrypted data',
      shortcut: 'WIN',
      description: 'Movement of the window handle',
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: [{
          value: '0b00000001',
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_01.png</img>'
        }, {
          value: '0b00000010',
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_02.png</img>'
        }, {
          value: '0b00000011',
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_03.png</img>'
        }, {
          value: '0b00000100',
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_04.png</img>'
        }, {
          value: '0b00000011',
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_05.png</img>'
        }, {
          value: '0b00000010',
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_06.png</img>'
        }, {
          value: '0b00000011',
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_07.png</img>'
        }, {
          value: '0b00000100',
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_08.png</img>'
        }]
      }
    }]
  }],
  originalIndex: 163,
  eep: 'd2-03-10',
  rorg_title: 'VLD Telegram',
  rorg_number: '0xD2',
  func_title: 'Light, Switching + Blind Control',
  func_number: '0x03',
  submitter: [
    'Eltako'
  ]
}
