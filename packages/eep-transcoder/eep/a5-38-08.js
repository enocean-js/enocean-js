export const a53808 = {
  number: '0x08',
  title: 'Gateway',
  description: 'Communication between gateway and actuator uses byte DB_3 to identify Commands.\n              Commands 0x01 to 0x7F shall be common to all types belonging to this profile.\n              Commands 0x80 to 0xFE can be defined individually for each device type.',
  case: [{
    title: '0x01 Switching',
    description: '',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '0',
        bitsize: '8',
        value: '0x01'
      }
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
      data: 'Command',
      shortcut: 'COM',
      description: 'Command ID',
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: {
          value: '0x01',
          description: {}
        }
      }
    }, {
      data: 'Time',
      shortcut: 'TIM',
      description: 'Time in 1/10 seconds. 0 = no time specifed',
      info: 'DB_2/DB_1: Time in 1/10 seconds.',
      bitoffs: '8',
      bitsize: '16',
      range: {
        min: '1',
        max: '65535'
      },
      scale: {
        min: '0.1',
        max: '6553.5'
      },
      unit: 's'
    }, {
      data: 'Lock/Unlock',
      shortcut: 'LCK',
      description: 'Lock for duration time if time >0, unlimited time of no time\n                  specified. Locking may be cleared with „unlock“. During lock\n                  phase no other commands will be accepted or executed',
      info: {},
      bitoffs: '29',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Unlock'
        }, {
          value: '1',
          description: 'Lock'
        }]
      }
    }, {
      data: 'Delay or duration',
      shortcut: 'DEL',
      description: 'Delay or duration (if Time > 0);<br/> 0 = Duration (Execute switching command immediately and switch back after duration)<br/> 1 = Delay (Execute switching command after delay)',
      info: {},
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Duration'
        }, {
          value: '1',
          description: 'Delay'
        }]
      }
    }, {
      data: 'Switching Command',
      shortcut: 'SW',
      description: 'Switching Command ON/OFF',
      info: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Off'
        }, {
          value: '1',
          description: 'On'
        }]
      }
    }]
  }, {
    title: '0x02 Dimming',
    description: 'REMARK:\n              <br/>\n              Ramp time is the time needed to transition from minimum to maximum dimming levels.\n              <br/>',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '0',
        bitsize: '8',
        value: '0x02'
      }
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
      data: 'Command',
      shortcut: 'COM',
      description: 'Command ID',
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: {
          value: '0x02',
          description: {}
        }
      }
    }, {
      data: 'Dimming value',
      shortcut: 'EDIM',
      description: 'Dimming value (absolute [0...255] or relative [0...100])',
      info: 'DB_2: Dimming value (absolute [0...255] or relative [0...100])',
      bitoffs: '8',
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
      data: 'Ramping time',
      shortcut: 'RMP',
      description: 'Ramping time in seconds, 0 = no ramping, 1... 255 = seconds to 100%',
      info: 'DB_1: Ramping time in seconds',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '255'
      },
      unit: 's'
    }, {
      data: 'Dimming Range',
      shortcut: 'EDIM R',
      description: 'Dimming Range',
      info: {},
      bitoffs: '29',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Absolute value'
        }, {
          value: '1',
          description: 'Relative value'
        }]
      }
    }, {
      data: 'Store final value',
      shortcut: 'STR',
      description: 'Store final value',
      info: {},
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'No'
        }, {
          value: '1',
          description: 'Yes'
        }]
      }
    }, {
      data: 'Switching Command',
      shortcut: 'SW',
      description: 'Switching Command ON/OFF',
      info: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Off'
        }, {
          value: '1',
          description: 'On'
        }]
      }
    }]
  }, {
    title: '0x03 Setpoint shift',
    description: '<span style="background-color:#CDFF7D;border-bottom:2px groove #000000;font-style:italic;">Submitter: Thermokon Sensortechnik GmbH</span><br/><br/>\n              Used for changing set point, for example summer / winter compensation',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '0',
        bitsize: '8',
        value: '0x03'
      }
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
      data: 'Command',
      shortcut: 'COM',
      description: 'Command ID',
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: {
          value: '0x03',
          description: {}
        }
      }
    }, {
      data: 'Setpoint',
      shortcut: 'SP',
      description: 'Setpoint shift',
      info: 'DB_1: Setpoint shift -12,7\n                  K… 0… +12,8 K 0…\n                  128… 255',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '-12.7',
        max: '12.8'
      },
      unit: 'K'
    }]
  }, {
    title: '0x04 Basic Setpoint',
    description: '<span style="background-color:#CDFF7D;border-bottom:2px groove #000000;font-style:italic;">Submitter: Thermokon Sensortechnik GmbH</span><br/><br/>\n              Send a new basic set point via DDC to an actuator',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '0',
        bitsize: '8',
        value: '0x04'
      }
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
      data: 'Command',
      shortcut: 'COM',
      description: 'Command ID',
      info: 'DB_3: 0x04',
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: {
          value: '0x04',
          description: {}
        }
      }
    }, {
      data: 'Basic Setpoint',
      shortcut: 'BSP',
      description: 'Basic Setpoint',
      info: 'DB_1: Basic Setpoint 0°C … 51.2°C …\n                  255',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '+51.2'
      },
      unit: '°C'
    }]
  }, {
    title: '0x05 Control variable',
    description: '<span style="background-color:#CDFF7D;border-bottom:2px groove #000000;font-style:italic;">Submitter: Thermokon Sensortechnik GmbH</span><br/><br/>\n              Set occupancy, energy holdoff and control directly actuator',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '0',
        bitsize: '8',
        value: '0x05'
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: '8',
      bitsize: '8'
    }, {
      reserved: {},
      bitoffs: '24',
      bitsize: '1'
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
      data: 'Command',
      shortcut: 'COM',
      description: 'Command ID',
      info: 'DB_3: 0x05',
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: {
          value: '0x05',
          description: {}
        }
      }
    }, {
      data: 'Control variable override',
      shortcut: 'CVOV',
      description: 'Control variable override',
      info: 'DB_1: Control variable override 0… 100 % 0...\n                  255',
      bitoffs: '16',
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
      data: 'Controller mode',
      shortcut: 'CM',
      description: 'Controller Mode',
      info: {},
      bitoffs: '25',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'Automatic mode selection'
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
      shortcut: 'CS',
      description: 'Controller state',
      info: {},
      bitoffs: '27',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Automatic'
        }, {
          value: '1',
          description: 'Override'
        }]
      }
    }, {
      data: 'Energy hold off',
      shortcut: 'ENHO',
      description: 'Energy Hold Off',
      info: {},
      bitoffs: '29',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Normal'
        }, {
          value: '1',
          description: 'Energy holdoff/ Dew point'
        }]
      }
    }, {
      data: 'Room occupancy',
      shortcut: 'RMOCC',
      description: 'Room occupancy',
      info: {},
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
          description: 'Standby'
        }]
      }
    }]
  }, {
    title: '0x06 Fan stage',
    description: '<span style="background-color:#CDFF7D;border-bottom:2px groove #000000;font-style:italic;">Submitter: Thermokon Sensortechnik GmbH</span><br/><br/>\n              Set directly fan stage<br/>',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '0',
        bitsize: '8',
        value: '0x06'
      }
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
      data: 'Command',
      shortcut: 'COM',
      description: 'Command ID',
      info: 'DB_3: 0x06',
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: {
          value: '0x06',
          description: {}
        }
      }
    }, {
      data: 'FanStage override',
      shortcut: 'FO',
      description: 'FanStage override',
      info: {},
      bitoffs: '16',
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
          value: '255',
          description: 'Auto'
        }]
      }
    }]
  }, {
    title: '0x07 Blind Central Command',
    description: '',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '0',
        bitsize: '8',
        value: '0x07'
      }
    },
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
      data: 'Command',
      shortcut: 'COM',
      description: 'Command ID',
      info: 'DB_3: 0x07',
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: {
          value: '0x07',
          description: 'Shutters / Blinds'
        }
      }
    }, {
      data: 'Parameter 1',
      shortcut: 'P1',
      description: 'Function defined parameter value',
      info: {},
      bitoffs: '8',
      bitsize: '8',
      enum: {
        item: {
          description: 'Func. 00: -- not used –-\n\n                    <br/><br/>Func. 01: -- not used --\n\n                    <br/><br/>Func. 02: -- not used --\n\n                    <br/><br/>Func. 03: -- not used --\n\n                    <br/><br/>Func. 04: 0% ... 100%\n                    <br/>e.g.: 0% = Blind fully open / 100% = Blind fully closed\n\n                    <br/><br/>Func. 05: 0 ... 255 seconds\n\n                    <br/><br/>Func. 06: 0 ... 255 seconds\n\n                    <br/><br/>Func. 07: Runtime value to close the blind\n                    <br/>0 ... 255 seconds\n\n                    <br/><br/>Func. 08: Runtime value for the sunblind reversion time\n                    <br/>This is the time to revolve the sunblind from one\n                    <br/>slat angle end position to the other end position:\n                    <br/>0.0 … 25.5 seconds (0.1s steps)\n\n                    <br/><br/>Func. 09: Set minimal position value\n                    <br/>0 ... 100%\n\n                    <br/><br/>Func. 10: Angle at the fully SHUT position\n                    <br/>Bit7 0 = positive sign\n                    <br/>Bit7 1 = negative sign\n                    <br/>Bit6...0  0 ... 90\n                    <br/>Angle in 2° steps (e.g. 0 = 0°, 90 = 180°)\n\n                    <br/><br/>Func. 11: Position logic\n                    <br/>0 = Highest position = 0% / Lowest position = 100%\n                    <br/>1 = Highest position = 100% / Lowest position = 0%'
        }
      }
    }, {
      data: 'Parameter 2',
      shortcut: 'P2',
      description: 'Function defined parameter value',
      info: {},
      bitoffs: '16',
      bitsize: '8',
      enum: {
        item: {
          description: 'Func. 00: -- not used –-\n\n                    <br/><br/>Func. 01: -- not used --\n\n                    <br/><br/>Func. 02: -- not used --\n\n                    <br/><br/>Func. 03: -- not used --\n\n                    <br/><br/>Func. 04: Angel (see remark 1)\n                    <br/>Bit7 0 = positive sign\n                    <br/>Bit7 1 = negative sign\n                    <br/>Bit6...0  0 ... 90\n                    <br/>Angle in 2° steps (e.g. 0 = 0°, 90 = 180°)\n\n                    <br/><br/>Func. 05: 0.0 ... 25.5 seconds\n\n                    <br/><br/>Func. 06: 0.0 ... 25.5 seconds\n\n                    <br/><br/>Func. 07: Runtime value to open the blind\n                    <br/>0 ... 255 seconds\n\n                    <br/><br/>Func. 08: -- not used --\n\n                    <br/><br/>Func. 09: Set maximal position value\n                    <br/>0 ... 100%\n\n                    <br/><br/>Func. 10: Angle at the fully OPEN position\n                    <br/>Bit7 0 = positive sign\n                    <br/>Bit7 1 = negative sign\n                    <br/>Bit6...0  0 ... 90\n                    <br/>Angle in 2° steps (e.g. 0 = 0°, 90 = 180°)\n\n                    <br/><br/>Func. 11: -- not used --'
        }
      }
    }, {
      data: 'Function',
      shortcut: 'FUNC',
      description: {},
      bitoffs: '24',
      bitsize: '4',
      enum: {
        item: [{
          value: '0',
          description: 'Do nothing, status request'
        }, {
          value: '1',
          description: 'Blind stops'
        }, {
          value: '2',
          description: 'Blind opens'
        }, {
          value: '3',
          description: 'Blind closes'
        }, {
          value: '4',
          description: 'Blind drives to position with angle value (see remark 2)'
        }, {
          value: '5',
          description: 'Blind opens for time (position value) and angle (angle value)'
        }, {
          value: '6',
          description: 'Blind closes for time (position value) and angle (angle value)'
        }, {
          value: '7',
          description: 'Set Runtime parameters (see remark 3)'
        }, {
          value: '8',
          description: 'Set angle configuration (see remark 3)'
        }, {
          value: '9',
          description: 'Set Min, Max values (see remark 4)'
        }, {
          value: '10',
          description: 'Set slat angle for SHUT and OPEN position (see remark 5)'
        }, {
          value: '11',
          description: 'Set position logic (see remark 6)'
        }]
      }
    }, {
      data: 'Send status flag',
      shortcut: 'SSF',
      description: 'see remark 7',
      bitoffs: '29',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Send new status of device'
        }, {
          value: '1',
          description: 'Send no status (e.g. Global central commands)'
        }]
      }
    }, {
      data: 'Pos. and Angle flag',
      shortcut: 'PAF',
      description: {},
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'No Angle and position value available'
        }, {
          value: '1',
          description: 'Angle and position value available'
        }]
      }
    }, {
      data: 'Service Mode Flag',
      shortcut: 'SMF',
      description: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Normal operation'
        }, {
          value: '1',
          description: 'Service mode: The module disables all\n                      senders, except this sender, which has set the service mode.\n                      (For example for maintenance)'
        }]
      }
    }]
  }],
  originalIndex: 135,
  eep: 'a5-38-08',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Central Command',
  func_number: '0x38',
  submitter: []
}
