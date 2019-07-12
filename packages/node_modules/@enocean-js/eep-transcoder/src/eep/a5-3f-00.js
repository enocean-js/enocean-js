export const a53f00 = {
  number: '0x00',
  title: 'Radio Link Test',
  status: 'released',
  description: '<br/><br/>\n              Units supporting the EEP Radio Link Test shall offer a functionality that allows for radio link testing between them (Position A to Position B, point-to-point only). Testing shall be possible without the need for prior teach-in and as an option it shall cover two way communications.\n              <br/>\n              <br/>\n              Further, testing shall be backward compatible to existing EnOcean installations that support at least 1BS (RORG=0xD5) and 4BS (RORG=0xA5) EnOcean messages.\n              <br/>\n              <br/>\n              The main area of RLT application are in-field testing of radio links between portable test equipment placed at different locations as well as between portable test equipment and fixed installation, e.g. an EnOcean Gateway.\n              <br/>\n              <h4>Functional description of RLT:</h4>\n              When two units perform radio link testing one unit needs to act in a mode called RLT Master and\n              the other unit needs to act in a mode called RLT Slave.\n              On a RLT enabled unit one or both modes may be supported. The mode(s) supported shall require\n              explicitly activation at run time.\n              <br/>\n              After activation a RLT Master listens for RLT_Query messages. On reception of at least one\n              RLT_Query message a RLT Master responds with an RLT_Response message. Following that it\n              starts transmission of RLT_MasterTest messages within a maximum time frame of 250ms and\n              awaits the response from the RLT Slave for each RLT_MasterTest message sent.\n              A radio link test communication consists of a minimum of 16 and a maximum of 256\n              RLT_MasterTest messages. Timing distance between individual RLT_MasterTest messages shall\n              not exceed 250ms.\n              When the radio link test communication is completed the RLT Master gets deactivated\n              automatically.\n              <br/>\n              After activation a RLT Slave periodically transmits RLT_Query messages (1 message / 2s). It stops\n              transmission of RLT_Query messages as soon as it has received at least one RLT_Response\n              message. It then waits for RLT_MasterTest messages from the same EnOcean ID and replies to\n              them within a maximum delay of 100ms thru RLT_SlaveTest messages.\n              If it does not receive RLT_MasterTest messages from the same EnOcean ID for a time period of\n              5s, the RLT Slave restarts periodic transmission of RLT_Query messages.\n              The RLT Slave requires explicit deactivation.\n              <h4>RLT_Query Message</h4>\n              This Message is a “4BS Teach-In Query” message with FUNC, Type and Manufacturer ID set\n              properly. For details please refer to the description of the 4BS teach-in process.\n              <h4>RLT_Response Message</h4>\n              This Message is a “4BS Teach-In Response” message with FUNC, Type and Manufacturer ID set\n              properly. For details please refer to the description of the 4BS teach-in process.\n              As a RLT Master does accept teach-in of a RLT Slave only for the time period required by a single\n              RLT communication it shall indicate the EEP to be supported but the EnOcean ID of the RLT Slave\n              not to be stored permanently.',
  case: [{
    title: 'RLT_MasterTest_4BS',
    description: 'This is the 4BS message sent by the RLT Master during a radio link test communication',
    direction: '1',
    condition: {
      datafield: [{
        bitoffs: '29',
        bitsize: '2',
        value: '2'
      }, {
        bitoffs: '31',
        bitsize: '1',
        value: '0'
      }]
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
      reserved: {},
      data: 'Not used',
      shortcut: '',
      description: '',
      info: {},
      bitoffs: '0',
      bitsize: '28',
      enum: {
        item: {
          value: '0',
          description: {}
        }
      }
    }, {
      data: 'MSG_ID',
      shortcut: 'MSGID',
      description: 'Message ID',
      info: {},
      bitoffs: '29',
      bitsize: '2',
      enum: {
        item: {
          value: '2',
          description: {}
        }
      }
    }, {
      data: 'MSG-Source',
      shortcut: 'MSGS',
      description: 'Message Source',
      info: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: {
          value: '0',
          description: 'RLT-Master'
        }
      }
    }]
  }, {
    title: 'RLT_SlaveTest_4BS',
    description: 'This is the 4BS message sent by the RLT Slave in reply to an RLT_MasterTest_4BS message.',
    direction: '2',
    condition: {
      datafield: [{
        bitoffs: '29',
        bitsize: '2',
        value: '2'
      }, {
        bitoffs: '31',
        bitsize: '1',
        value: '1'
      }]
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
      data: 'Sub-Telegram Counter',
      shortcut: 'STCNT',
      description: 'related to RLT_MasterTest_4BS message received\n                  Repeater level 2',
      info: {},
      bitoffs: '0',
      bitsize: '2',
      enum: [{
        item: {
          value: '0',
          description: 'not supported'
        }
      }, {
        item: {
          value: '1',
          description: '1 sub telegram'
        }
      }, {
        item: {
          value: '2',
          description: '2 sub telegram'
        }
      }, {
        item: {
          value: '3',
          description: '≥ 3 sub telegram'
        }
      }]
    }, {
      data: 'RSSI Level in dBm',
      shortcut: 'RSLV',
      description: 'related to RLT_MasterTest_4BS message received\n                  Repeater level 1',
      info: {},
      bitoffs: '2',
      bitsize: '6',
      enum: {
        item: [{
          value: '0x00',
          description: 'not supported'
        }, {
          value: '0x01',
          description: '≥-31',
          unit: 'dBm'
        }, {
          value: '0x02',
          description: '-32',
          unit: 'dBm'
        }, {
          value: '0x3F',
          description: '≤-93',
          unit: 'dBm'
        }]
      }
    }, {
      data: 'Sub-Telegram Counter/RSSI Level in dBm',
      shortcut: 'RSLV',
      description: 'Related to RLT_MasterTest_4BS message received\n Repeater level 1 (for details see DB3)',
      info: {},
      bitoffs: '8',
      bitsize: '8',
      enum: {
        item: {
          value: {},
          description: 'See prev'
        }
      }
    }, {
      data: 'Sub-Telegram Counter/RSSI Level in dBm',
      shortcut: 'RSLV',
      description: 'Related to RLT_MasterTest_4BS message received direct link',
      info: {},
      bitoffs: '16',
      bitsize: '8',
      enum: {
        item: {
          value: {},
          description: 'See prev'
        }
      }
    }, {
      data: 'RSSI Level in dBm',
      shortcut: 'RSLV',
      description: 'Non-EnOcean signal detection since last RLT_MasterTest message\n RSSI Level with 6dB quantization steps',
      info: {},
      bitoffs: '24',
      bitsize: '4',
      enum: {
        item: [{
          value: '0x00',
          description: 'not supported'
        }, {
          value: '0x01',
          description: '≥ -31',
          unit: 'dBm'
        }, {
          value: '0x02',
          description: '-32...-37',
          unit: 'dBm'
        }, {
          value: '0x03',
          description: '-38...-43',
          unit: 'dBm'
        }, {
          value: '0x04',
          description: '-44...-49',
          unit: 'dBm'
        }, {
          value: '0x05',
          description: '-50...-55',
          unit: 'dBm'
        }, {
          value: '0x06',
          description: '-56...-61',
          unit: 'dBm'
        }, {
          value: '0x07',
          description: '-62...-67',
          unit: 'dBm'
        }, {
          value: '0x08',
          description: '-68...-73',
          unit: 'dBm'
        }, {
          value: '0x09',
          description: '-74...-79',
          unit: 'dBm'
        }, {
          value: '0x0A',
          description: '-80...-85',
          unit: 'dBm'
        }, {
          value: '0x0B',
          description: '≤ -92',
          unit: 'dBm'
        }]
      }
    }, {
      data: 'MSG_ID',
      shortcut: 'MSGID',
      description: {},
      info: {},
      bitoffs: '29',
      bitsize: '2',
      enum: {
        item: {
          value: '2',
          description: {}
        }
      }
    }, {
      data: 'MSG-Source',
      shortcut: 'MSGS',
      description: {},
      info: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: {
          value: '1',
          description: 'RLT-Slave'
        }
      }
    }]
  }, {
    title: 'RLT_MasterTest_1BS',
    description: 'This is the 1BS message sent by the RLT Master during a radio link test communication.<br/><br/>\n                REMARK: The column "Bitrange" is automatically generated from the telegram type and the offset. The column Bitrange shows currently DB_3 instead of DB_0. This isn\'t a bug in the XML, only a weakness of the formatting. AT THIS POINT, DB_0 WOULD BE CORRECT.<br/>',
    direction: '1',
    condition: {
      datafield: {
        bitoffs: '31',
        bitsize: '1',
        value: '0'
      }
    },
    datafield: [{
      data: 'LRN Bit',
      shortcut: 'LRNB',
      description: 'LRN Bit',
      bitoffs: '4',
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
      data: 'RLT MSG-Counter',
      shortcut: 'MC',
      description: 'Round-trip, covering all RLT_x_1BS messages',
      info: {},
      spread: [
        {
          bitoffs: 0,
          bitsize: 4
        }, {
          bitoffs: 5,
          bitsize: 2
        }
      ]
    }, {
      data: 'MSG-Source',
      shortcut: 'MSGS',
      description: 'Message Source',
      info: {},
      bitoffs: '7',
      bitsize: '1',
      enum: {
        item: {
          value: '0',
          description: 'RLT Master'
        }
      }
    }]
  }, {
    title: 'RLT_SlaveTest_1BS',
    description: 'This is the 1BS message sent by the RLT Slave in reply to an RLT_MasterTest_1BS message.<br/><br/>\n                REMARK: The column "Bitrange" is automatically generated from the telegram type and the offset. The column Bitrange shows currently DB_3 instead of DB_0. This isn\'t a bug in the XML, only a weakness of the formatting. AT THIS POINT, DB_0 WOULD BE CORRECT.<br/>',
    direction: '2',
    condition: {
      datafield: {
        bitoffs: '31',
        bitsize: '1',
        value: '1'
      }
    },
    datafield: [{
      data: 'LRN Bit',
      shortcut: 'LRNB',
      description: 'LRN Bit',
      bitoffs: '4',
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
      data: 'RLT MSG-Counter',
      shortcut: 'MC',
      description: 'Round-trip, covering all RLT_x_1BS messages',
      info: {},
      spread: [
        {
          bitoffs: 0,
          bitsize: 4
        }, {
          bitoffs: 5,
          bitsize: 2
        }
      ]
    }, {
      data: 'MSG-Source',
      shortcut: 'MSGS',
      description: 'Message Source',
      info: {},
      bitoffs: '7',
      bitsize: '1',
      enum: {
        item: {
          value: '1',
          description: 'RLT-Slave'
        }
      }
    }]
  }],
  originalIndex: 137,
  eep: 'a5-3f-00',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Universal',
  func_number: '0x3F',
  submitter: [
    'PROBARE'
  ]
}
