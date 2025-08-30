export const a50905 = {
  number: '0x05',
  title: 'VOC Sensor',
  status: 'released',
  description: '',
  case: [{
    datafield: [{
      data: 'VOC',
      shortcut: 'Conc',
      description: 'VOC Concentration',
      info: {},
      bitoffs: '0',
      bitsize: '16',
      range: {
        min: '0',
        max: '65535'
      },
      scale: {
        min: '0',
        max: '65535'
      },
      unit: 'ppb'
    }, {
      data: 'VOC ID',
      shortcut: 'VOC_ID',
      description: 'VOC identification',
      info: {},
      bitoffs: '16',
      bitsize: '8',
      enum: {
        item: [{
          value: '0',
          description: 'VOCT (total)'
        }, {
          value: '1',
          description: 'Formaldehyde'
        }, {
          value: '2',
          description: 'Benzene'
        }, {
          value: '3',
          description: 'Styrene'
        }, {
          value: '4',
          description: 'Toluene'
        }, {
          value: '5',
          description: 'Tetrachloroethylene'
        }, {
          value: '6',
          description: 'Xylene'
        }, {
          value: '7',
          description: 'n-Hexane'
        }, {
          value: '8',
          description: 'n-Octane'
        }, {
          value: '9',
          description: 'Cyclopentane'
        }, {
          value: '10',
          description: 'Methanol'
        }, {
          value: '11',
          description: 'Ethanol'
        }, {
          value: '12',
          description: '1-Pentanol'
        }, {
          value: '13',
          description: 'Acetone'
        }, {
          value: '14',
          description: 'ethylene Oxide'
        }, {
          value: '15',
          description: 'Acetaldehyde ue'
        }, {
          value: '16',
          description: 'Acetic Acid'
        }, {
          value: '17',
          description: 'Propionice Acid'
        }, {
          value: '18',
          description: 'Valeric Acid'
        }, {
          value: '19',
          description: 'Butyric Acid'
        }, {
          value: '20',
          description: 'Ammoniac'
        }, {
          value: '22',
          description: 'Hydrogen Sulfide'
        }, {
          value: '23',
          description: 'Dimethylsulfide'
        }, {
          value: '24',
          description: '2-Butanol (butyl Alcohol)'
        }, {
          value: '25',
          description: '2-Methylpropanol'
        }, {
          value: '26',
          description: 'Diethyl ether'
        }, {
          value: '255',
          description: 'ozone'
        }]
      }
    }, {
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
      reserved: {},
      bitoffs: '29',
      bitsize: '1'
    }, {
      data: 'Scale Multiplier',
      shortcut: 'SCM',
      description: 'Scale Multiplier',
      bitoffs: '30',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: '0.01'
        }, {
          value: '1',
          description: '0.1'
        }, {
          value: '2',
          description: '1'
        }, {
          value: '3',
          description: '10'
        }]
      }
    }]
  }],
  originalIndex: 55,
  eep: 'a5-09-05',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Gas Sensor',
  func_number: '0x09',
  submitter: [
    'NanoSense'
  ]
}
