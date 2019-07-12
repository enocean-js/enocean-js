export const d20001 = {
  number: '0x01',
  title: 'RCP with Temperature Measurement and Display (BI-DIR)',
  status: 'released',
  description: '\n            <br/>\n            <br/>\n            <span style="background-color:#F8DF36;">\n            Note: EEP Release 2.1, 2.5, and 2.6 reflected a wrong byte-order for all messages of this EEP!</span><br/>\n            <span style="background-color:#FFF08D;">\n            Example Message Type A:</span><br/>\n            <span style="background-color:#FFF08D;">\n            Instead of DB_1 = 0x01    DB_0 = 0x81 (which is correct for KP=1 and CV=1)</span><br/>\n            <span style="background-color:#FFF08D;">\n            by mistake DB_1 = 0x81    DB_0 = 0x11 (which is wrong) was printed.</span><br/>\n            <span style="background-color:#FFF08D;">\n            We apologize for the mistake.</span>',
  case: [{
    title: 'Message type A / ID 01 (First User Action on RCP)',
    description: 'Direction: Sensor -> Gateway<br/>\n            Transaction Response: Message Type B or Type E<br/>\n            Chaining: No<br/>\n            Timing: T1+ = 170ms<br/>\n            <img>graphics/EEP_D2-00-01_Message_A.png</img>',
    condition: {
      datafield: {
        bitoffs: '5',
        bitsize: '3',
        value: '1'
      }
    },
    datafield: [{
      data: 'MsgId',
      shortcut: 'MI',
      description: 'Message Id; 0x01',
      info: {},
      bitoffs: '5',
      bitsize: '3',
      enum: {
        item: {
          value: '1',
          description: 'Message Id'
        }
      }
    }, {
      reserved: {},
      bitoffs: '9',
      bitsize: '2'
    }, {
      reserved: {},
      bitoffs: '0',
      bitsize: '5'
    }, {
      data: 'User Action',
      shortcut: 'KP',
      description: {},
      info: {},
      bitoffs: '11',
      bitsize: '5',
      enum: {
        item: [{
          value: '0x00',
          description: 'not used'
        }, {
          value: '0x01',
          description: 'Presence'
        }, {
          value: '0x02',
          description: 'Temperature Set Point “down” or “—“'
        }, {
          value: '0x03',
          description: 'not used'
        }, {
          value: '0x04',
          description: 'not used'
        }, {
          value: '0x05',
          description: 'Temperature Set Point “up” or “+”'
        }, {
          value: '0x06',
          description: 'Fan'
        }, {
          min: '0x07',
          max: '0x1F',
          description: 'Not Used'
        }]
      }
    }, {
      data: 'ConfigValid',
      shortcut: 'CV',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '1',
      enum: {
        item: [{
          value: '0x00',
          description: 'Configuration data not valid (e.g. never received message of type E)'
        }, {
          value: '0x01',
          description: 'Configuration data valid'
        }]
      }
    }]
  }, {
    title: 'Message Type B / ID 02 (Display Content)',
    description: 'Direction: Gateway -> Sensor<br/>\n            Reply to Message Type A<br/>\n            Response: None<br/>\n            Chaining: Up to 2 messages per chain<br/>\n            Timing: T2+ = 300ms<br/>\n            <img>graphics/EEP_D2-00-01_Message_B.png</img><br/>\n            IMPORTANT NOTE:<br/>\n            The symbols Sa, Sb, Sc, Sd, Se are optional. One or more of those symbols are available\n            on the display only if the manufacturer of a RCP implements them in a specific design.\n            Thus, they are NOT mandatory for a RCP in order to comply with this EEP.<br/>',
    condition: {
      datafield: {
        bitoffs: '5',
        bitsize: '3',
        value: '2'
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: '32',
      bitsize: '3'
    }, {
      data: 'MsgId',
      shortcut: 'MI',
      description: 'Message Id;0x02',
      info: {},
      bitoffs: '5',
      bitsize: '3',
      enum: {
        item: {
          value: '2',
          description: 'Message Id'
        }
      }
    }, {
      data: 'MoreData',
      shortcut: 'MD',
      description: {},
      info: {},
      bitoffs: '4',
      bitsize: '1',
      enum: {
        item: [{
          value: '0x00',
          description: 'no more data'
        }, {
          value: '0x01',
          description: 'more data will follow after T2+'
        }]
      }
    }, {
      data: 'Fan',
      shortcut: 'F',
      description: {},
      info: {},
      bitoffs: '1',
      bitsize: '3',
      enum: {
        item: [{
          value: '0x00',
          description: 'Do not display'
        }, {
          value: '0x01',
          description: 'Speed Level 0'
        }, {
          value: '0x02',
          description: 'Speed Level 1'
        }, {
          value: '0x03',
          description: 'Speed Level 2'
        }, {
          value: '0x04',
          description: 'Speed Level 3'
        }, {
          min: '0x05',
          max: '0x07',
          description: 'not used'
        }]
      }
    }, {
      data: 'Fan manual',
      shortcut: 'M',
      description: {},
      info: {},
      bitoffs: '0',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Auto'
        }, {
          value: '1',
          description: 'Fan manual'
        }]
      }
    }, {
      data: 'Figure A Type',
      shortcut: 'TA',
      description: {},
      info: {},
      bitoffs: '11',
      bitsize: '5',
      enum: {
        item: [{
          value: '0x00',
          description: 'Do not display'
        }, {
          value: '0x01',
          description: 'Room Temperature',
          unit: '°C'
        }, {
          value: '0x02',
          description: 'Room Temperature',
          unit: '°F'
        }, {
          value: '0x03',
          description: 'Nominal Temperature',
          unit: '°C'
        }, {
          value: '0x04',
          description: 'Nominal Temperature',
          unit: '°F'
        }, {
          value: '0x05',
          description: 'Delta Temperature Set Point',
          unit: '°C'
        }, {
          value: '0x06',
          description: 'Delta Temperature Set Point',
          unit: '°F'
        }, {
          value: '0x07',
          description: 'Delta Temperature Set Point(graphic)'
        }, {
          value: '0x08',
          description: 'Time 00:00 to 23:59 [24h]'
        }, {
          value: '0x09',
          description: 'Time 00:00 to 11:59 [AM]'
        }, {
          value: '0x0A',
          description: 'Time 00:00 to 11:59 [PM]'
        }, {
          value: '0x0B',
          description: 'Date 01.01 to 31.12 [DD.MM]'
        }, {
          value: '0x0C',
          description: 'Date 01.01 to 12.31 [MM.DD]'
        }, {
          value: '0x0D',
          description: 'Illumination (linear) 0 to 9999',
          unit: 'lx'
        }, {
          value: '0x0E',
          description: 'Percentage 0 to 100',
          unit: '%'
        }, {
          value: '0x0F',
          description: 'Parts per Million 0 to 9999',
          unit: 'ppm'
        }, {
          value: '0x10',
          description: 'Relative Humidity 0 to 100',
          unit: '% rH'
        }, {
          min: '0x11',
          max: '0x1F',
          description: 'not used'
        }]
      }
    }, {
      data: 'Presence',
      shortcut: 'PR',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '3',
      enum: {
        item: [{
          value: '0x00',
          description: 'Do not display'
        }, {
          value: '0x01',
          description: 'Present'
        }, {
          value: '0x02',
          description: 'Not present'
        }, {
          value: '0x03',
          description: 'Night time reduction'
        }, {
          min: '0x04',
          max: '0x07',
          description: 'not used'
        }]
      }
    }, {
      data: 'Figure A Value',
      shortcut: 'ZA',
      description: 'Format according to TA:<br/>Byte-Order: Little-Endian!',
      info: {},
      bitoffs: '16',
      bitsize: '16',
      enum: {
        item: [{
          min: '0x01',
          max: '0x07',
          description: '0 ... 4000',
          unit: '0.01°'
        }, {
          min: '0x08',
          max: '0x0A',
          description: 'Time 0000 ... 2359'
        }, {
          min: '0x0B',
          max: '0x0C',
          description: 'Date 0101 ... 3112'
        }, {
          value: '0x0D',
          description: '0 ... 9999',
          unit: 'lx'
        }, {
          min: '0x0E',
          max: '0x10',
          description: '0 ... 10000',
          unit: '0.01%'
        }, {
          value: '0x0F',
          description: '0 ... 9999',
          unit: 'ppm'
        }]
      }
    }, {
      data: 'Heating',
      shortcut: 'Sa',
      description: 'optional',
      info: {},
      bitoffs: '39',
      bitsize: '1',
      enum: {
        item: [{
          value: '0x0',
          description: 'Off'
        }, {
          value: '0x1',
          description: 'On'
        }]
      }
    }, {
      data: 'Cooling',
      shortcut: 'Sb',
      description: 'optional',
      info: {},
      bitoffs: '38',
      bitsize: '1',
      enum: {
        item: [{
          value: '0x0',
          description: 'Off'
        }, {
          value: '0x1',
          description: 'On'
        }]
      }
    }, {
      data: 'Dew-Point',
      shortcut: 'Sc',
      description: 'optional',
      info: {},
      bitoffs: '37',
      bitsize: '1',
      enum: {
        item: [{
          value: '0x0',
          description: 'Warning'
        }, {
          value: '0x1',
          description: 'No warning'
        }]
      }
    }, {
      data: 'Window',
      shortcut: 'Sd',
      description: 'optional',
      info: {},
      bitoffs: '36',
      bitsize: '1',
      enum: {
        item: [{
          value: '0x0',
          description: 'Closed'
        }, {
          value: '0x1',
          description: 'Opened'
        }]
      }
    }, {
      data: 'User Notification',
      shortcut: 'Se',
      description: 'optional',
      info: {},
      bitoffs: '35',
      bitsize: '1',
      enum: {
        item: [{
          value: '0x0',
          description: 'Off'
        }, {
          value: '0x1',
          description: 'On'
        }]
      }
    }]
  }, {
    title: 'Message Type C / ID 03 (Repeated User Action on RCP)',
    description: 'Direction: Sensor -> Gateway<br/>\n            Fire and Forget<br/>\n            Response: None <br/>\n            Chaining: No<br/>\n            Timing: may only be sent within 5s from latest receipt of a Message Type B<br/>\n            <img>graphics/EEP_D2-00-01_Message_C.png</img><br/>',
    condition: {
      datafield: {
        bitoffs: '5',
        bitsize: '3',
        value: '3'
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: '4',
      bitsize: '1'
    }, {
      reserved: {},
      bitoffs: '0',
      bitsize: '1'
    }, {
      data: 'MsgId',
      shortcut: 'MI',
      description: 'Message Id; 0x03',
      info: {},
      bitoffs: '5',
      bitsize: '3',
      enum: {
        item: {
          value: '3',
          description: 'Message Id'
        }
      }
    }, {
      data: 'Fan',
      shortcut: 'F',
      description: {},
      info: {},
      bitoffs: '1',
      bitsize: '3',
      enum: {
        item: [{
          value: '0x00',
          description: 'no change'
        }, {
          value: '0x01',
          description: 'Speed Level 0'
        }, {
          value: '0x02',
          description: 'Speed Level 1'
        }, {
          value: '0x03',
          description: 'Speed Level 2'
        }, {
          value: '0x04',
          description: 'Speed Level 3'
        }, {
          value: '0x05',
          description: 'Speed Level Auto'
        }, {
          min: '0x06',
          max: '0x07',
          description: 'not used'
        }]
      }
    }, {
      data: 'Set Point A Type',
      shortcut: 'TA',
      description: {},
      info: {},
      bitoffs: '11',
      bitsize: '5',
      enum: {
        item: [{
          value: '0x00',
          description: 'no change'
        }, {
          min: '0x01',
          max: '0x04',
          description: 'not used'
        }, {
          value: '0x05',
          description: 'Temperature Set Point [°]'
        }, {
          min: '0x06',
          max: '0x1F',
          description: 'not used'
        }]
      }
    }, {
      data: 'Presence',
      shortcut: 'PR',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '3',
      enum: {
        item: [{
          value: '0x00',
          description: 'no change'
        }, {
          value: '0x01',
          description: 'Present'
        }, {
          value: '0x02',
          description: 'Not present'
        }, {
          value: '0x03',
          description: 'Night time reduction'
        }, {
          min: '0x04',
          max: '0x07',
          description: 'not used'
        }]
      }
    }, {
      data: 'Set Point A Value',
      shortcut: 'ZA',
      description: 'Format according to TA: 0x05 [0.01°]<br/><br/>Byte-Order: Little-Endian!',
      info: {},
      bitoffs: '16',
      bitsize: '16',
      range: {
        min: '-1270',
        max: '+1270'
      },
      scale: {
        min: '-12.70',
        max: '+12.70'
      },
      unit: '°'
    }]
  }, {
    title: 'Message Type D / ID 04 (Measurement Result)',
    description: 'Direction: Sensor -> Gateway<br/>\n            Fire and Forget<br/>\n            Response: None<br/>\n            Chaining: No<br/>\n            Timing: None<br/>\n            <img>graphics/EEP_D2-00-01_Message_D.png</img><br/>',
    condition: {
      datafield: {
        bitoffs: '5',
        bitsize: '3',
        value: '4'
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '5'
    }, {
      data: 'MsgId',
      shortcut: 'MI',
      description: 'Message Id;0x04',
      info: {},
      bitoffs: '5',
      bitsize: '3',
      enum: {
        item: {
          value: '4',
          description: 'Message Id'
        }
      }
    }, {
      data: 'Channel A Value',
      shortcut: 'VA',
      description: 'Format according to TA',
      info: {},
      spread: [
        {
          bitoffs: '20',
          bitsize: '4'
        }, {
          bitoffs: 8,
          bitsize: 8
        }
      ],
      bitoffs: 8,
      bitsize: 8,
      range: {
        min: 0,
        max: 4000
      },
      scale: {
        min: 0,
        max: 40
      },
      unit: '°C'
    }, {
      data: 'Channel A Type',
      shortcut: 'TA',
      description: {},
      info: {},
      bitoffs: '16',
      bitsize: '4',
      enum: {
        item: [{
          value: '0x00',
          description: 'Temperature [°C]'
        }, {
          min: '0x01',
          max: '0x0E',
          description: 'not used'
        }, {
          value: '0x0F',
          description: 'Measurement result not valid'
        }]
      }
    }]
  }, {
    title: 'Message Type E / ID 05 (Sensor Configuration)',
    description: 'Direction: Gateway -> Sensor<br/>\n            Reply to Message Type A<br/>\n            Response: None <br/>\n            Chaining: Up to 2 messages per chain<br/>\n            Timing: T2+ = 300ms<br/>\n            <img>graphics/EEP_D2-00-01_Message_E.png</img><br/>',
    condition: {
      datafield: {
        bitoffs: '5',
        bitsize: '3',
        value: '5'
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '4'
    }, {
      reserved: {},
      bitoffs: '8',
      bitsize: '1'
    }, {
      reserved: {},
      bitoffs: '16',
      bitsize: '1'
    }, {
      reserved: {},
      bitoffs: '28',
      bitsize: '4'
    }, {
      reserved: {},
      bitoffs: '44',
      bitsize: '1'
    }, {
      data: 'MsgId',
      shortcut: 'MI',
      description: 'Message Id; 0x05',
      info: {},
      bitoffs: '5',
      bitsize: '3',
      enum: {
        item: {
          value: '5',
          description: 'Message Id'
        }
      }
    }, {
      data: 'MoreData',
      shortcut: 'MD',
      description: {},
      info: {},
      bitoffs: '4',
      bitsize: '1',
      enum: {
        item: [{
          value: '0x0',
          description: 'no more data'
        }, {
          value: '0x1',
          description: 'more data will follow after T2+'
        }]
      }
    }, {
      data: 'Set Point Range Limit',
      shortcut: 'SPR',
      description: 'Limit of Set Point Range, absolute value:<br/><br/>\n                REMARK:<br/>Set Point Range shall be symmetrical to 0°',
      info: {},
      bitoffs: '9',
      bitsize: '7',
      enum: {
        item: [{
          value: '0x00',
          description: 'Set Point disabled'
        }, {
          min: '0x01',
          max: '0x7F',
          description: '0,1° … 12,7° [0,1°]',
          scale: {
            min: '0.1',
            max: '12.7'
          },
          unit: '°'
        }]
      }
    }, {
      data: 'Set PointSteps',
      shortcut: 'SPS',
      description: 'Number of Set Point Steps:<br/><br/>\n                REMARK:<br/>Specifies the number of equidistant steps between 0 and Set Point Range Limit',
      info: {},
      bitoffs: '17',
      bitsize: '7',
      enum: {
        item: [{
          value: '0x00',
          description: 'Set Point disabled'
        }, {
          min: '0x01',
          max: '0x7F',
          description: '1 … 127',
          scale: {
            min: '1',
            max: '127'
          }
        }]
      }
    }, {
      data: 'Temperature Measurement Timing',
      shortcut: 'TT (LSB)',
      description: 'Time between two subsequent Temperature measurements\n                  <br/><br/>\n                  LSB (Bit 3 ... 0)',
      info: {},
      bitoffs: '24',
      bitsize: '4',
      enum: {
        item: [{
          value: '0x00',
          description: 'Temperature measurement disabled'
        }, {
          min: '0x01',
          max: '0x3C',
          description: '10 … 600s [10s]',
          scale: {
            min: '10',
            max: '600'
          },
          unit: 's'
        }]
      }
    }, {
      data: 'Temperature Measurement Timing',
      shortcut: 'TT (MSB)',
      description: 'Time between two subsequent Temperature measurements\n                  <br/><br/>\n                  MSB (Bit 5 ... 4)',
      info: {},
      bitoffs: '38',
      bitsize: '2'
    }, {
      data: 'Fan',
      shortcut: 'F',
      description: 'Number of Fan Speed Levels available to user:',
      info: {},
      bitoffs: '35',
      bitsize: '3',
      enum: {
        item: [{
          value: '0x0',
          description: 'Fan Speed disabled'
        }, {
          min: '0x1',
          max: '0x7',
          description: '1 … 7',
          scale: {
            min: '1',
            max: '7'
          }
        }]
      }
    }, {
      data: 'Presence',
      shortcut: 'PR',
      description: 'Number of Presence Levels available to user',
      info: {},
      bitoffs: '32',
      bitsize: '3',
      enum: {
        item: [{
          value: '0x0',
          description: 'Presence disabled'
        }, {
          min: '0x1',
          max: '0x7',
          description: '1 … 7',
          scale: {
            min: '1',
            max: '7'
          }
        }]
      }
    }, {
      data: 'Keep Alive Timing',
      shortcut: 'KA',
      description: 'Number of measurements (without trigger of a message\n                  Type D) between two subsequent “Keep Alive messages”:',
      info: {},
      bitoffs: '45',
      bitsize: '3',
      enum: {
        item: [{
          value: '0x0',
          description: 'Transmission of measurement result with\n                      each Temperature measurement'
        }, {
          min: '0x1',
          max: '0x7',
          description: '10 … 70 measurements [step-size 10]',
          scale: {
            min: '10',
            max: '70'
          }
        }]
      }
    }, {
      data: 'Significant Temperature Difference',
      shortcut: 'ST',
      description: 'Difference between two subsequent temperature\n                measurements to trigger a Message Type D [0.2°]',
      info: {},
      bitoffs: '40',
      bitsize: '4',
      range: {
        min: '0x0',
        max: '0xF'
      },
      scale: {
        min: '0.0',
        max: '3.0'
      },
      unit: '°'
    }]
  }],
  originalIndex: 139,
  eep: 'd2-00-01',
  rorg_title: 'VLD Telegram',
  rorg_number: '0xD2',
  func_title: 'Room Control Panel (RCP)',
  func_number: '0x00',
  submitter: [
    'Fr. Sauter AG'
  ]
}
