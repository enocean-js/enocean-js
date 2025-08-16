export const a51103 = {
  number: '0x03',
  title: 'Blind Status',
  status: 'released',
  description: '<br/><br/>\n          This controller status is specific for blinds, awning and shutter\n          modules. All modules can use this 4BS telegram to send all information about\n          the status, the position and errors of the module, if these data are available.',
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
      data: 'Blind/shutter pos.',
      shortcut: 'BSP',
      description: {},
      info: {},
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '100'
      },
      scale: {
        min: '0',
        max: '100'
      },
      unit: '%'
    }, {
      data: 'Angle sign',
      shortcut: 'AS',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Positive sign'
        }, {
          value: '1',
          description: 'Negative sign'
        }]
      }
    }, {
      data: 'Angle',
      shortcut: 'AN',
      description: 'Angle in 2° steps<br/>\n              (e.g. 0 = 0°, 90 = 180°)<br/><br/>\n              (EEP 2.6.5:<br/>\n              valid range\n              <span style="text-decoration:line-through;color:red">0 … 180</span> ->\n              <span style="font-weight:bold;color:green">0 … 90</span><br/>\n              scale\n              <span style="text-decoration:line-through;color:red">0 … 360</span> ->\n              <span style="font-weight:bold;color:green">0 … 180</span>)<br/>',
      info: {},
      bitoffs: '9',
      bitsize: '7',
      range: {
        min: '0',
        max: '90'
      },
      scale: {
        min: '0',
        max: '180'
      },
      unit: '°'
    }, {
      data: 'Position value flag',
      shortcut: 'PVF',
      description: {},
      info: {},
      bitoffs: '16',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'No Position value available'
        }, {
          value: '1',
          description: 'Position value available'
        }]
      }
    }, {
      data: 'Angle value flag',
      shortcut: 'AVF',
      description: {},
      info: {},
      bitoffs: '17',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'No Angle value available'
        }, {
          value: '1',
          description: 'Angle value available'
        }]
      }
    }, {
      data: 'Error state',
      shortcut: 'ES',
      description: {},
      info: {},
      bitoffs: '18',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'No error present'
        }, {
          value: '1',
          description: 'End-positions are not configured'
        }, {
          value: '2',
          description: 'Internal failure'
        }, {
          value: '3',
          description: 'Not used'
        }]
      }
    }, {
      data: 'End-position',
      shortcut: 'EP',
      description: {},
      info: {},
      bitoffs: '20',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'No End-position available'
        }, {
          value: '1',
          description: 'No End-position reached'
        }, {
          value: '2',
          description: 'Blind fully open'
        }, {
          value: '3',
          description: 'Blind fully closed'
        }]
      }
    }, {
      data: 'Status',
      shortcut: 'ST',
      description: {},
      info: {},
      bitoffs: '22',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'No Status available'
        }, {
          value: '1',
          description: 'Blind is stopped'
        }, {
          value: '2',
          description: 'Blind opens'
        }, {
          value: '3',
          description: 'Blind closes'
        }]
      }
    }, {
      data: 'Service Mode',
      shortcut: 'SM',
      description: {},
      info: {},
      bitoffs: '24',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Normal mode'
        }, {
          value: '1',
          description: 'Service mode is activated (For example for maintenance)'
        }]
      }
    }, {
      data: 'Mode of the position',
      shortcut: 'MOTP',
      description: {},
      info: {},
      bitoffs: '25',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Normal mode:<br/>0% Blind fully open / 100% Blind fully close'
        }, {
          value: '1',
          description: 'Inverse mode:<br/>100% Blind fully open / 0% Blind fully close'
        }]
      }
    }, {
      reserved: {},
      bitoffs: '26',
      bitsize: '2'
    }, {
      reserved: {},
      bitoffs: '29',
      bitsize: '3'
    }]
  }],
  originalIndex: 97,
  eep: 'a5-11-03',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Controller Status',
  func_number: '0x11',
  submitter: [
    'PEHA',
    'infratec'
  ]
}
