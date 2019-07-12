export const a51104 = {
  number: '0x04',
  title: 'Extended Lighting Status',
  status: 'released',
  description: '<br/><br/>\n          This status is an extended answer of new lighting-controllers.\n          All modules can use this 4BS telegram to send all information about the status\n          and errors of the module, if these data are available.',
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
      data: 'Parameter 1',
      shortcut: 'P1',
      description: {},
      info: {},
      bitoffs: '0',
      bitsize: '8',
      enum: {
        item: {
          description: 'Mode 0: Dimm-Value (0 .. 255)\n                <br/>\n                Mode 1: R - Red (0 .. 255)\n                <br/>\n                Mode 2: Energy metering value (MSB 15 .. 8)\n                <br/>\n                Mode 3: Not used'
        }
      }
    }, {
      data: 'Parameter 2',
      shortcut: 'P2',
      description: {},
      info: {},
      bitoffs: '8',
      bitsize: '8',
      enum: {
        item: {
          description: 'Mode 0: Lamp operating hours (MSB 15 .. 8)\n                <br/>\n                Mode 1: G - Green (0 .. 255)\n                <br/>\n                Mode 2: Energy metering value (7 .. 0 LSB)\n                <br/>\n                Mode 3: Not used'
        }
      }
    }, {
      data: 'Parameter 3',
      shortcut: 'P3',
      description: {},
      info: {},
      bitoffs: '16',
      bitsize: '8',
      enum: {
        item: {
          description: 'Mode 0: Lamp operating hours (7 .. 0 LSB)\n                <br/>\n                Mode 1: B - Blue (0 .. 255)\n                <br/>\n                Mode 2: Unit for energy values:<br/>\n                Enum:<br/>\n                0 = mW<br/>\n                1 = W<br/>\n                2 = kW<br/>\n                3 = MW<br/>\n                4 = Wh<br/>\n                5 = kWh<br/>\n                6 = MWh<br/>\n                7 = GWh<br/>\n                8 = mA<br/>\n                9 = 1/10 A<br/>\n                10 = mV<br/>\n                11 = 1/10 V<br/>\n                12 .. 15 Not used<br/>\n                <br/>\n                Mode 3: Not used'
        }
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
          description: 'Service mode is activated.<br/>\n                  (For example for maintenance)'
        }]
      }
    }, {
      data: 'Operating hours flag',
      shortcut: 'OHF',
      description: 'For Mode 0',
      info: {},
      bitoffs: '25',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'No lamp operating hours available'
        }, {
          value: '1',
          description: 'Lamp operating hours available'
        }]
      }
    }, {
      data: 'Error state',
      shortcut: 'ES',
      description: {},
      info: {},
      bitoffs: '26',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'No error present'
        }, {
          value: '1',
          description: 'Lamp-failure'
        }, {
          value: '2',
          description: 'Internal failure'
        }, {
          value: '3',
          description: 'Failure on the external periphery'
        }]
      }
    }, {
      data: 'Parameter Mode',
      shortcut: 'PM',
      description: {},
      info: {},
      bitoffs: '29',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: '8 Bit Dimmer Value and Lamp operating hours'
        }, {
          value: '1',
          description: 'RGB Value'
        }, {
          value: '2',
          description: 'Energy metering value'
        }, {
          value: '3',
          description: 'Not used'
        }]
      }
    }, {
      data: 'Status',
      shortcut: 'ST',
      description: {},
      info: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Lighting off'
        }, {
          value: '1',
          description: 'Lighting on'
        }]
      }
    }]
  }],
  originalIndex: 98,
  eep: 'a5-11-04',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Controller Status',
  func_number: '0x11',
  submitter: [
    'PEHA',
    'infratec'
  ]
}
