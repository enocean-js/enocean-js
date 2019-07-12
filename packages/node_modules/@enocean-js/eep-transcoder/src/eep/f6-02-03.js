export const f60203 = {
  number: '0x03',
  title: 'Light Control - Application Style 1',
  status: 'released',
  description: '\n              <br/>\n              <br/>\n              Definition of Auto, I/O for Rocker switch, Dim control (PTM200)',
  case: [{
    statusfield: [{
      data: 'T21',
      bitoffs: '2',
      bitsize: '1',
      value: '1'
    }, {
      data: 'NU',
      bitoffs: '3',
      bitsize: '1',
      value: '1'
    }],
    datafield: [{
      data: 'Rocker action',
      shortcut: 'RA',
      description: '....',
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: [{
          value: '0x30',
          description: 'Button A0: <br/>Set the controller in automatic mode'
        }, {
          value: '0x10',
          description: 'Button A1: <br/>Set the controller in manually mode and toggles between<br/>switch light on and switch light off'
        }, {
          value: '0x70',
          description: 'Button B0: <br/>Dim light up'
        }, {
          value: '0x50',
          description: 'Button B1: <br/>Dim light down'
        }]
      }
    }]
  }],
  originalIndex: 3,
  eep: 'f6-02-03',
  rorg_title: 'RPS Telegram',
  rorg_number: '0xF6',
  func_title: 'Rocker Switch, 2 Rocker',
  func_number: '0x02',
  submitter: [
    'Servodan'
  ],
  icon: 'Switch_Style1.svg'
}
