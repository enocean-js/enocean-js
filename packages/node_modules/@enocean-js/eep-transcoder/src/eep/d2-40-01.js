export const d24001 = {
  number: '0x01',
  title: 'Type 0x01',
  status: 'released',
  description: '\n              <br/>\n              <br/>\n              <b>MsgId 0x01:</b>Status of RGB LED controller\n              <br/>\n              <img>graphics/D2-40-01.png</img>',
  case: [{
    datafield: [{
      data: 'LED output enabled',
      shortcut: 'OUTEN',
      description: 'Driving LED enabled',
      info: {},
      bitoffs: '0',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Disabled'
        }, {
          value: '1',
          description: 'Enabled'
        }]
      }
    }, {
      data: '“Demand Response” mode Active',
      shortcut: 'DRA',
      description: 'Controller is in the DR mode. It had received a\n                DR command from DR controller, and it is executing it.',
      info: {},
      bitoffs: '1',
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
      data: 'Daylight Harvesting Active',
      shortcut: 'DHAR',
      description: 'Daylight harvesting feature is turned on.\n                Readings from photo sensor are influencing the dimming level.',
      info: {},
      bitoffs: '2',
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
      data: 'Occupancy State',
      shortcut: 'OCC',
      description: 'Room which controller is in charge of\n                is considered occupied.',
      info: {},
      bitoffs: '3',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'Not occupied'
        }, {
          value: '1',
          description: 'Occupied'
        }, {
          value: '2',
          description: 'Unknown'
        }]
      }
    }, {
      data: 'Status Tx reason',
      shortcut: 'SREAS',
      description: 'Reason for sending this status message',
      info: {},
      bitoffs: '5',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Other'
        }, {
          value: '1',
          description: 'Heartbeat'
        }]
      }
    }, {
      data: 'MsgId',
      shortcut: 'MI',
      description: 'Message Id; 0x01',
      info: {},
      bitoffs: '6',
      bitsize: '2',
      enum: {
        item: {
          value: '1',
          description: 'LED Status RGB'
        }
      }
    }, {
      data: 'Current Dim Level LED R',
      shortcut: 'DLVLR',
      description: 'Current dim level for the red LED',
      info: {},
      bitoffs: '8',
      bitsize: '8',
      enum: {
        item: [{
          min: '0',
          max: '200',
          scale: {
            min: '0',
            max: '100'
          },
          unit: '%'
        }, {
          value: '0xFF',
          description: 'If not used'
        }]
      }
    }, {
      data: 'Current Dim Level LED G',
      shortcut: 'DLVLG',
      description: 'Current dim level for the green LED',
      info: {},
      bitoffs: '16',
      bitsize: '8',
      enum: {
        item: [{
          min: '0',
          max: '200',
          scale: {
            min: '0',
            max: '100'
          },
          unit: '%'
        }, {
          value: '0xFF',
          description: 'If not used'
        }]
      }
    }, {
      data: 'Current Dim Level LED B',
      shortcut: 'DLVLB',
      description: 'Current dim level for the blue LED',
      info: {},
      bitoffs: '24',
      bitsize: '8',
      enum: {
        item: [{
          min: '0',
          max: '200',
          scale: {
            min: '0',
            max: '100'
          },
          unit: '%'
        }, {
          value: '0xFF',
          description: 'If not used'
        }]
      }
    }]
  }],
  originalIndex: 210,
  eep: 'd2-40-01',
  rorg_title: 'VLD Telegram',
  rorg_number: '0xD2',
  func_title: 'LED Controller Status',
  func_number: '0x40',
  submitter: [
    'EnOcean GmbH'
  ]
}
