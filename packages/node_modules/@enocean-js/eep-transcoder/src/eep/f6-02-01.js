export const f60201 = {
  number: '0x01',
  title: 'Light and Blind Control - Application Style 1',
  status: 'released',
  description: 'This EEP definition is based on the assumption that a RPS switch module (e.g. PTM200) is installed in a 0-STATE up position! Application Style 1 is widely used in EU but may be found in other markets as well.',
  case: [{
    condition: {
      statusfield: [{
        bitoffs: '2',
        bitsize: '1',
        value: '1'
      }, {
        bitoffs: '3',
        bitsize: '1',
        value: '1'
      }]
    },
    statusfield: [{
      data: 'T21',
      bitoffs: '2',
      bitsize: '1',
      value: '1'
    }, {
      data: 'NU',
      bitoffs: '3',
      bitsize: '1',
      value: '1'
    }],
    datafield: [{
      data: 'Rocker 1st action',
      shortcut: 'R1',
      description: '....',
      bitoffs: '0',
      bitsize: '3',
      enum: {
        item: [{
          value: '0',
          description: 'Button AI: "Switch light on" or "Dim light down" or "Move blind closed"'
        }, {
          value: '1',
          description: 'Button A0: "Switch light off" or "Dim light up" or "Move blind open"'
        }, {
          value: '2',
          description: 'Button BI: "Switch light on" or "Dim light down" or "Move blind closed”'
        }, {
          value: '3',
          description: 'Button B0: "Switch light off" or "Dim light up" or "Move blind open"'
        }]
      }
    }, {
      data: 'Energy Bow',
      shortcut: 'EB',
      description: '....',
      bitoffs: '3',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'released'
        }, {
          value: '1',
          description: 'pressed'
        }]
      }
    }, {
      data: 'Rocker 2nd action',
      shortcut: 'R2',
      description: '....',
      bitoffs: '4',
      bitsize: '3',
      enum: {
        item: [{
          value: '0',
          description: 'Button AI: <br/> "Switch light on" or "Dim light down" or "Move blind closed"'
        }, {
          value: '1',
          description: 'Button A0: <br/> "Switch light off" or "Dim light up" or "Move blind open"'
        }, {
          value: '2',
          description: 'Button BI: <br/>“Switch light on” or "Dim light down” or "Move blind closed”'
        }, {
          value: '3',
          description: 'Button B0: <br/>“Switch light off” or “Dim light up” or "Move blind open”'
        }]
      }
    }, {
      data: '2nd Action',
      shortcut: 'SA',
      description: '....',
      bitoffs: '7',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'No 2nd action'
        }, {
          value: '1',
          description: '2nd action valid'
        }]
      }
    }]
  }, {
    condition: {
      statusfield: [{
        bitoffs: '2',
        bitsize: '1',
        value: '1'
      }, {
        bitoffs: '3',
        bitsize: '1',
        value: '0'
      }]
    },
    statusfield: [{
      data: 'T21',
      bitoffs: '2',
      bitsize: '1',
      value: '1'
    }, {
      data: 'NU',
      bitoffs: '3',
      bitsize: '1',
      value: '0'
    }],
    datafield: [{
      data: 'Number of buttons pressed simultaneously (other bit combinations are not valid)',
      shortcut: 'R1',
      description: '....',
      bitoffs: '0',
      bitsize: '3',
      enum: {
        item: [{
          value: '0',
          description: 'no button'
        }, {
          value: '3',
          description: '3 or 4 buttons'
        }]
      }
    }, {
      data: 'Energy Bow',
      shortcut: 'EB',
      description: '....',
      bitoffs: '3',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'released'
        }, {
          value: '1',
          description: 'pressed'
        }]
      }
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: '4',
      bitsize: '4'
    }]
  }],
  originalIndex: 1,
  eep: 'f6-02-01',
  rorg_title: 'RPS Telegram',
  rorg_number: '0xF6',
  func_title: 'Rocker Switch, 2 Rocker',
  func_number: '0x02',
  submitter: [],
  icon: 'Switch_Style1.svg'
}
