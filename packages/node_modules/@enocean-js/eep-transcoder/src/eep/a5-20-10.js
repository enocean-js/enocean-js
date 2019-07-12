export const a52010 = {
  number: '0x10',
  title: 'Generic HVAC Interface',
  status: 'released',
  description: '<br/><br/>\n          Functions: Mode, Vane Position, Fan Speed, Sensors and On/Off: With this\n          EEP plus the already existing EEP A5-10-03 and A5-20-11 all the information of AC\n          indoor unit can be sent and received allowing a much easier and complete control\n          of these units.\n          <br/>\n          <br/>\n          DIRECTION-1 = Receive mode: Commands received by the HVAC interface.\n          <br/>\n          DIRECTION-2 = Transmit mode: Commands sent by the HVAC interface.',
  case: [{
    direction: '1',
    condition: {
      direction: '1'
    },
    datafield: [{
      reserved: {},
      bitoffs: '24',
      bitsize: '4'
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
      data: 'Mode',
      shortcut: 'MD',
      description: 'The modes are the same as in KNX and LON allowing a more transparent integration with this protocols\nand it has plenty of free positions for future expansion',
      info: {},
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: [{
          value: '0',
          description: 'Auto'
        }, {
          value: '1',
          description: 'Heat'
        }, {
          value: '2',
          description: 'Morning Warmup'
        }, {
          value: '3',
          description: 'Cool'
        }, {
          value: '4',
          description: 'Night Purge'
        }, {
          value: '5',
          description: 'Precool'
        }, {
          value: '6',
          description: 'Off'
        }, {
          value: '7',
          description: 'Test'
        }, {
          value: '8',
          description: 'Emergency Heat'
        }, {
          value: '9',
          description: 'Fan only'
        }, {
          value: '10',
          description: 'Free cool'
        }, {
          value: '11',
          description: 'Ice'
        }, {
          value: '12',
          description: 'Max heat'
        }, {
          value: '13',
          description: 'Economic heat/cool'
        }, {
          value: '14',
          description: 'Dehumidification (dry)'
        }, {
          value: '15',
          description: 'Calibration'
        }, {
          value: '16',
          description: 'Emergency cool'
        }, {
          value: '17',
          description: 'Emergency steam'
        }, {
          value: '18',
          description: 'max cool'
        }, {
          value: '19',
          description: 'Hvc load'
        }, {
          value: '20',
          description: 'no load'
        }, {
          min: '21',
          max: '30',
          description: 'reserved'
        }, {
          value: '31',
          description: 'Auto Heat'
        }, {
          value: '32',
          description: 'Auto Cool'
        }, {
          min: '33',
          max: '254',
          description: 'reserved'
        }, {
          value: '255',
          description: 'N/A'
        }]
      }
    }, {
      data: 'Vane position',
      shortcut: 'VPS',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '4',
      enum: {
        item: [{
          value: '0',
          description: 'Auto'
        }, {
          value: '1',
          description: 'Horizontal'
        }, {
          value: '2',
          description: 'Pos2'
        }, {
          value: '3',
          description: 'Pos3'
        }, {
          value: '4',
          description: 'Pos4'
        }, {
          value: '5',
          description: 'Vertical'
        }, {
          value: '6',
          description: 'Swing'
        }, {
          min: '7',
          max: '10',
          description: 'Reserved'
        }, {
          value: '11',
          description: 'Vertical swing'
        }, {
          value: '12',
          description: 'Horizontal swing'
        }, {
          value: '13',
          description: 'Horizontal and vertical swing'
        }, {
          value: '14',
          description: 'Stop swing'
        }, {
          value: '15',
          description: 'N/A'
        }]
      }
    }, {
      data: 'Fan Speed',
      shortcut: 'FANSP',
      description: 'fan speed value goes from 1 to 14. 1 is the lowest fan speed allowed by the AC and from there it\nincrements with the value of this variable. Typically AC units have up to 5-6 speeds. Any speed higher than\nthe maximum the AC allows would set it to the higher speed.\n0 is auto and 15 is N/A',
      info: {},
      bitoffs: '12',
      bitsize: '4',
      enum: {
        item: [{
          value: '0',
          description: 'Auto'
        }, {
          min: '1',
          max: '14',
          description: 'Up to 14 fan speeds being 1 the lowest'
        }, {
          value: '15',
          description: 'N/A'
        }]
      }
    }, {
      data: 'Control variable',
      shortcut: 'CVAR',
      description: 'Control variable; value 255 = auto',
      info: 'DB_1 Control variable 0… 100% 0...100, 255 = Auto',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '100, 255'
      },
      scale: {
        min: '0',
        max: '100'
      },
      unit: '%'
    }, {
      data: 'Room occupancy',
      shortcut: 'RO',
      description: 'The interfaces can automatically control the behaviour of the AC without integration in automation\nsystems when linked to presence/movement sensors.',
      info: {},
      bitoffs: '29',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'Occupied'
        }, {
          value: '1',
          description: 'StandBy (waiting to perform action)'
        }, {
          value: '2',
          description: 'Unoccupied (action performed)'
        }, {
          value: '3',
          description: 'Off (no occupancy and no action)'
        }]
      }
    }, {
      data: 'On/Off',
      shortcut: 'O/I',
      description: 'On/Off',
      info: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'off (the unit is not running)'
        }, {
          value: '1',
          description: 'on'
        }]
      }
    }]
  }, {
    direction: '2',
    condition: {
      direction: '2'
    },
    datafield: [{
      reserved: {},
      bitoffs: '24',
      bitsize: '4'
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
      data: 'Mode',
      shortcut: 'MD',
      description: 'The modes are the same as in KNX and LON allowing a more transparent integration with this protocols\nand it has plenty of free positions for future expansion',
      info: {},
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: [{
          value: '0',
          description: 'Auto'
        }, {
          value: '1',
          description: 'Heat'
        }, {
          value: '2',
          description: 'Morning Warmup'
        }, {
          value: '3',
          description: 'Cool'
        }, {
          value: '4',
          description: 'Night Purge'
        }, {
          value: '5',
          description: 'Precool'
        }, {
          value: '6',
          description: 'Off'
        }, {
          value: '7',
          description: 'Test'
        }, {
          value: '8',
          description: 'Emergency Heat'
        }, {
          value: '9',
          description: 'Fan only'
        }, {
          value: '10',
          description: 'Free cool'
        }, {
          value: '11',
          description: 'Ice'
        }, {
          value: '12',
          description: 'Max heat'
        }, {
          value: '13',
          description: 'Economic heat/cool'
        }, {
          value: '14',
          description: 'Dehumidification (dry)'
        }, {
          value: '15',
          description: 'Calibration'
        }, {
          value: '16',
          description: 'Emergency cool'
        }, {
          value: '17',
          description: 'Emergency steam'
        }, {
          value: '18',
          description: 'max cool'
        }, {
          value: '19',
          description: 'Hvc load'
        }, {
          value: '20',
          description: 'no load'
        }, {
          min: '21',
          max: '30',
          description: 'reserved'
        }, {
          value: '31',
          description: 'Auto Heat'
        }, {
          value: '32',
          description: 'Auto Cool'
        }, {
          min: '33',
          max: '254',
          description: 'reserved'
        }, {
          value: '255',
          description: 'N/A'
        }]
      }
    }, {
      data: 'Vane position',
      shortcut: 'VPS',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '4',
      enum: {
        item: [{
          value: '0',
          description: 'Auto'
        }, {
          value: '1',
          description: 'Horizontal'
        }, {
          value: '2',
          description: 'Pos2'
        }, {
          value: '3',
          description: 'Pos3'
        }, {
          value: '4',
          description: 'Pos4'
        }, {
          value: '5',
          description: 'Vertical'
        }, {
          value: '6',
          description: 'Swing'
        }, {
          min: '7',
          max: '10',
          description: 'Reserved'
        }, {
          value: '11',
          description: 'Vertical swing'
        }, {
          value: '12',
          description: 'Horizontal swing'
        }, {
          value: '13',
          description: 'Horizontal and vertical swing'
        }, {
          value: '14',
          description: 'Stop swing'
        }, {
          value: '15',
          description: 'N/A'
        }]
      }
    }, {
      data: 'Fan Speed',
      shortcut: 'FANSP',
      description: 'fan speed value goes from 1 to 14. 1 is the lowest fan speed allowed by the AC and from there it\nincrements with the value of this variable. Typically AC units have up to 5-6 speeds. Any speed higher than\nthe maximum the AC allows would set it to the higher speed.\n0 is auto and 15 is N/A',
      info: {},
      bitoffs: '12',
      bitsize: '4',
      enum: {
        item: [{
          value: '0',
          description: 'Auto'
        }, {
          min: '1',
          max: '14',
          description: 'Up to 14 fan speeds being 1 the lowest'
        }, {
          value: '15',
          description: 'N/A'
        }]
      }
    }, {
      data: 'Control variable',
      shortcut: 'CVAR',
      description: 'Control variable (linear); value 255 = auto',
      info: 'DB_1 Control variable 0… 100% 0...100, 255 = Auto',
      bitoffs: '16',
      bitsize: '8',
      enum: {
        item: [
          {
            min: '0',
            max: '100',
            description: 'Control variable 0… 100% 0...100',
            unit: '%'
          }, {
            value: 255,
            description: 'Auto',
            unit: ''
          }, {
            min: '101',
            max: '254',
            description: 'not used',
            unit: ''
          }
        ]
      }
    }, {
      data: 'Room occupancy',
      shortcut: 'RO',
      description: 'Room occupancy',
      info: {},
      bitoffs: '29',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'Occupied'
        }, {
          value: '1',
          description: 'StandBy (waiting to perform action)'
        }, {
          value: '2',
          description: 'Unoccupied (action performed)'
        }, {
          value: '3',
          description: 'Off (no occupancy and no action)'
        }]
      }
    }, {
      data: 'On/Off',
      shortcut: 'O/I',
      description: 'On/Off',
      info: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'off'
        }, {
          value: '1',
          description: 'on'
        }]
      }
    }]
  }],
  originalIndex: 126,
  eep: 'a5-20-10',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'HVAC Components',
  func_number: '0x20',
  submitter: [
    'Intesis Software SL'
  ]
}
