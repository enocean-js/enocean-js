export const a52003 = {
  number: '0x03',
  title: 'Line powered Actuator',
  status: 'released',
  description: '<br/><br/>\n          DIRECTION-1 = Transmit mode: Message from the actuator to the controller.\n          <br/>\n          DIRECTION-2 = Receive mode: Commands from the controller to the actuator;\n          max. reponse time 1 sec.',
  case: [{
    direction: '1',
    condition: {
      direction: '1'
    },
    datafield: [{
      reserved: {},
      bitoffs: '8',
      bitsize: '8'
    }, {
      reserved: {},
      bitoffs: '24',
      bitsize: '4'
    }, {
      reserved: {},
      bitoffs: '29',
      bitsize: '3'
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
      data: 'Actual valve',
      shortcut: 'AV',
      description: 'Actual valve',
      info: 'Transmit status (sent every time there is a positioning or randomly sent every 15-\n                20 minutes if no change in position. “Heartbeat”)\n                DB_3: % open value 0...100 %, linear n=0...255',
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
      data: 'Temperature',
      shortcut: 'TMP',
      description: 'Temperature (linear)',
      info: 'Receive: DB_1: Temperature 0-40 deg C. linear n=255…0',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '+40'
      },
      unit: '°C'
    }]
  }, {
    direction: '2',
    condition: {
      direction: '2'
    },
    datafield: [{
      reserved: {},
      bitoffs: '16',
      bitsize: '5'
    }, {
      reserved: {},
      bitoffs: '23',
      bitsize: '5'
    }, {
      reserved: {},
      bitoffs: '29',
      bitsize: '3'
    }, {
      data: 'Set Point Inverse',
      shortcut: {},
      description: 'Valve set point can be sent to the actuator normal or inverted through BAS/Gateway controller.\nThe selection is done by DB_1.Bit1. in the actuator with DB_3. This function is used in dependence on the\ntype of valve.',
      info: {},
      bitoffs: '22',
      bitsize: '1',
      enum: {
        item: {
          value: '1',
          description: 'true'
        }
      }
    }, {
      data: 'Set Point Selection',
      shortcut: 'SPS',
      description: 'Set Point Selection for DB3',
      info: {},
      bitoffs: '21',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Actuator Setpoint (0-100%); Unit respond to controller.'
        }, {
          value: '1',
          description: 'Temperature Setpoint 0...+40°C; Unit respond to room sensor and use internal PI loop.'
        }]
      }
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
      data: 'Actuator or Temperature Setpoint',
      shortcut: 'ATS',
      description: 'Actuator Setpoint: in combination with BAS/Gateway controllers.<br/><br/>Temperature Setpoint: The actuator can be used as self-sufficient room controller (pi controller) without integration\nin automation systems. Wherever the user wants room conditions to be individually controlled,\nthe actuator can work in combination with a wireless room device (RCU).',
      info: 'DB_3: Valve set point 0...100 %, linear n=0...100\n                Temperature set point 0...40°C, linear n=0...255',
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '100 or 255'
      },
      scale: {
        min: '0',
        max: '100 or +40'
      },
      unit: '% or °C'
    }, {
      data: 'Temperature  from RCU',
      shortcut: 'TMPRC',
      description: 'Temperature actual from RCU = 0b0 (Room controller-unit)',
      info: 'Temperature actual from RCU = 0b0, Room controller-unit …\n                0...40°C, linear n=255...0',
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '255',
        max: '0'
      },
      scale: {
        min: '0',
        max: '+40'
      },
      unit: '°C'
    }]
  }],
  originalIndex: 124,
  eep: 'a5-20-03',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'HVAC Components',
  func_number: '0x20',
  submitter: [
    'Spartan Peripheral Devices'
  ]
}
