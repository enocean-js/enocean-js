export const d20200 = {
  number: '0x00',
  title: 'Type 0x00',
  status: 'released',
  description: '',
  case: [{
    title: 'CMD 0x1 - Sensor Measurement',
    description: 'This message is sent by a sensor if one of the following events occurs:\n                <br/>\n                <br/>- Measurement results trigger an automated transmission (see Actuator Set Measurement message)\n                <br/>\n                <br/>- Message Actuator Measurement Query has been received\n                <br/>\n                <br/>Response Timing: None\n                <br/>\n                <br/>\n                <img>graphics/EEP_D2-02-xx_CMD_01.png</img>\n                <br/>\n                <br/>',
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '4'
    }, {
      data: 'Command ID',
      shortcut: 'CMD',
      description: 'command identifier',
      info: {},
      bitoffs: '4',
      bitsize: '4',
      enum: {
        item: {
          value: '0x01',
          description: 'ID 01'
        }
      }
    }, {
      data: 'Measurement type',
      shortcut: 'type',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '3',
      enum: {
        item: [{
          value: '0x00',
          description: 'Temperature (0…65535: -40 to +120°C)'
        }, {
          value: '0x01',
          description: 'Illumination (0…65535: 0 to 2047lx)'
        }, {
          value: '0x02',
          description: 'Occupancy (0: not detected; 1: detected)'
        }, {
          value: '0x03',
          description: 'Smoke\n                      <br/>The following content applies for the value in DB_0 and DB_1:\n                      <br/>0x00 - No smoke detected\n                      <br/>0x01 - Smoke detected via ionization chamber\n                      <br/>0x02 - Smoke detected via optical chamber\n                      <br/>0x03 - Smoke detected via both chambers\n                      <br/>'
        }]
      }
    }, {
      reserved: {},
      bitoffs: '11',
      bitsize: '5'
    }, {
      data: 'Measurement value (2 bytes)',
      shortcut: 'MV',
      description: '...',
      info: {},
      bitoffs: '16',
      bitsize: '16',
      range: {
        min: '0',
        max: '65535'
      },
      unit: 'N/A'
    }]
  }, {
    title: 'CMD 0x2 - Sensor Test/Trigger',
    description: 'This message is sent to a sensor.\n              It causes the sensor to enter self-test mode or trigger an alarm (if supported).\n                <br/>\n                <br/>Response Timing: None\n                <br/>\n                <br/>\n                <img>graphics/EEP_D2-02-xx_CMD_02.png</img>\n                <br/>',
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '4'
    }, {
      data: 'Command ID',
      shortcut: 'CMD',
      description: 'Command identifier',
      info: {},
      bitoffs: '4',
      bitsize: '4',
      enum: {
        item: {
          value: '0x02',
          description: 'ID 02'
        }
      }
    }, {
      data: 'Self-test',
      shortcut: 'ST',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '1',
      enum: {
        item: [{
          value: '0b0',
          description: 'Self-test mode'
        }, {
          value: '0b1',
          description: 'Normal operation'
        }]
      }
    }, {
      data: 'Trigger alarm',
      shortcut: 'TA',
      description: {},
      info: {},
      bitoffs: '9',
      bitsize: '1',
      enum: {
        item: [{
          value: '0b0',
          description: 'Trigger alarm'
        }, {
          value: '0b1',
          description: 'Normal operation'
        }]
      }
    }, {
      reserved: {},
      bitoffs: '10',
      bitsize: '6'
    }]
  }, {
    title: 'CMD 0x3 - Actuator Set Measurement',
    description: 'This message is sent to a sensor. It configures the measurement behaviour of the sensor.\n                <br/>\n                <br/>Response Timing: None\n                <br/>\n                <br/>\n                <img>graphics/EEP_D2-02-xx_CMD_03.png</img>',
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '4'
    }, {
      data: 'Command ID',
      shortcut: 'CMD',
      description: 'Command identifier',
      info: {},
      bitoffs: '4',
      bitsize: '4',
      enum: {
        item: {
          value: '0x03',
          description: 'ID 03'
        }
      }
    }, {
      data: 'Report measurement',
      shortcut: 'RM',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '1',
      enum: {
        item: [{
          value: '0b0',
          description: 'Report measurement: query only'
        }, {
          value: '0b1',
          description: 'Report measurement: query / auto reporting'
        }]
      }
    }, {
      reserved: {},
      bitoffs: '9',
      bitsize: '7'
    }, {
      data: 'Measurement delta to be reported',
      shortcut: 'MD',
      description: {},
      info: {},
      spread: [
        {
          bitoffs: '24',
          bitsize: '8'
        }, {
          bitoffs: '16',
          bitsize: '4'
        }
      ],
      range: {
        min: '0',
        max: '4095'
      },
      scale: {
        min: '0',
        max: '4095'
      },
      unit: {
        ref: 'UN'
      }
    }, {
      reserved: {},
      bitoffs: '20',
      bitsize: '1'
    }, {
      data: 'Unit',
      shortcut: 'UN',
      description: {},
      info: {},
      bitoffs: '21',
      bitsize: '3',
      enum: {
        item: [{
          value: '0x00',
          description: 'Temperature (°C)',
          unit: '°C'
        }, {
          value: '0x01',
          description: 'Illumination (lx)',
          unit: 'lx'
        }, {
          min: '0x02',
          max: '0x07',
          description: 'Not used',
          unit: ''
        }]
      }
    }, {
      data: 'Maximum time between two subsequent Actuator',
      shortcut: 'MAT',
      description: 'Measurement Response messages [10s]',
      info: {},
      bitoffs: '32',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '10',
        max: '2550'
      },
      unit: 's'
    }, {
      data: 'Minimum time between two subsequent Actuator',
      shortcut: 'MIT',
      description: 'Measurement Response messages [s]',
      info: {},
      bitoffs: '40',
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
    }]
  }, {
    title: 'CMD 0x4 - Sensor Measurement Query',
    description: 'This message is sent to a sensor. The sensor replies with an Sensor Measurement message.\n                <br/>\n                <br/>Response Timing:\n                <br/>A Sensor Measurement message shall be received within a maximum of\n                300ms from the time of transmission of this message.\n                <br/>In case no such response is received within this time frame the action\n                shall be treated as completed without result.\n                <br/>\n                <img>graphics/EEP_D2-02-xx_CMD_04.png</img>',
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '4'
    }, {
      data: 'Command ID',
      shortcut: 'CMD',
      description: 'Command identifier',
      info: {},
      bitoffs: '4',
      bitsize: '4',
      enum: {
        item: {
          value: '0x04',
          description: 'ID 04'
        }
      }
    }, {
      data: 'Query',
      shortcut: 'qu',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '3',
      enum: {
        item: [{
          value: '0x0',
          description: 'Query temperature'
        }, {
          value: '0x1',
          description: 'Query illumination'
        }, {
          value: '0x2',
          description: 'Query occupancy'
        }, {
          value: '0x3',
          description: 'Query smoke'
        }, {
          min: '0x4',
          max: '0x7',
          description: 'Not used'
        }]
      }
    }, {
      reserved: {},
      bitoffs: '11',
      bitsize: '5'
    }]
  }],
  originalIndex: 159,
  eep: 'd2-02-00',
  rorg_title: 'VLD Telegram',
  rorg_number: '0xD2',
  func_title: 'Sensors for Temperature, Illumination, Occupancy And Smoke',
  func_number: '0x02',
  submitter: [
    'MSR-Office'
  ]
}
