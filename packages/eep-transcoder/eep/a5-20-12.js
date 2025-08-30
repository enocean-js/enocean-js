export const a52012 = {
  number: '0x12',
  title: 'Temperature Controller Input',
  status: 'released',
  description: '',
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
      data: 'Control Variable override',
      shortcut: 'CV',
      description: 'Actual value for controller',
      info: 'DB_3: Control variable … 100 % 0...255',
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '100'
      },
      unit: '%'
    }, {
      data: 'FanStage override',
      shortcut: 'FANOR',
      description: 'FanStage override',
      info: '',
      bitoffs: '8',
      bitsize: '8',
      enum: {
        item: [{
          value: '0',
          description: 'Stage 0'
        }, {
          value: '1',
          description: 'Stage 1'
        }, {
          value: '2',
          description: 'Stage 2'
        }, {
          value: '3',
          description: 'Stage 3'
        }, {
          value: '31',
          description: 'auto'
        }, {
          value: '255',
          description: 'not available'
        }]
      }
    }, {
      data: 'Setpoint shift',
      shortcut: 'SPS',
      description: 'Actual set point could be shifted',
      info: 'DB_1: 10K…\n              0… +10K 0…\n              128… 255',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '-10',
        max: '+10'
      },
      unit: '°K'
    }, {
      data: 'Fan override',
      shortcut: 'FANOR',
      description: {},
      info: {},
      bitoffs: '24',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Automatic'
        }, {
          value: '1',
          description: 'Override Fan DB2'
        }]
      }
    }, {
      data: 'Controller mode',
      shortcut: 'CTM',
      description: {},
      info: {},
      bitoffs: '25',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'Auto mode'
        }, {
          value: '1',
          description: 'Heating'
        }, {
          value: '2',
          description: 'Cooling'
        }, {
          value: '3',
          description: 'Off'
        }]
      }
    }, {
      data: 'Controller state',
      shortcut: 'CST',
      description: 'Controller state',
      info: 'Controller state',
      bitoffs: '27',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Automatic'
        }, {
          value: '1',
          description: 'Override control variable DB3'
        }]
      }
    }, {
      data: 'Energy hold-off / Dew point',
      shortcut: 'ERH',
      description: 'Energy hold-off / Dew point',
      info: 'Energy hold-off / Dew point',
      bitoffs: '29',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Normal'
        }, {
          value: '1',
          description: 'Energy hold-off/ Dew point'
        }]
      }
    }, {
      data: 'Room occupancy',
      shortcut: 'RO',
      description: 'Actual room occupancy',
      info: 'Room occupancy',
      bitoffs: '30',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'Occupied'
        }, {
          value: '1',
          description: 'Unoccupied'
        }, {
          value: '2',
          description: 'StandBy'
        }, {
          value: '3',
          description: 'Frost'
        }]
      }
    }]
  }],
  originalIndex: 128,
  eep: 'a5-20-12',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'HVAC Components',
  func_number: '0x20',
  submitter: [
    'Thermokon Sensortechnik GmbH'
  ]
}
