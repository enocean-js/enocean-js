export const a50602 = {
  number: '0x02',
  title: 'Range 0lx to 1.020lx',
  status: 'released',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '24',
      bitsize: '4'
    }, {
      reserved: {},
      bitoffs: '29',
      bitsize: '2'
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
      data: 'Supply voltage',
      shortcut: 'SVC',
      description: 'Supply voltage (linear)',
      info: 'DB_3: Supply voltage 0…5.1V, linear n=0…255',
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '5.1'
      },
      unit: 'V'
    }, {
      data: 'Illumination',
      shortcut: 'ILL2',
      description: 'Illumination (linear)',
      info: 'DB_2: Illumination 0…510 lx, linear n=0…255',
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '510'
      },
      unit: 'lx'
    }, {
      data: 'Illumination',
      shortcut: 'ILL1',
      description: 'Illumination (linear)',
      info: 'DB_1: Illumination 0…1.024 lx, linear n=0…255',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '1020'
      },
      unit: 'lx'
    }, {
      data: 'Range select',
      shortcut: 'RS',
      description: 'Range',
      info: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Range acc. to DB_1 (ILL1)'
        }, {
          value: '1',
          description: 'Range acc. to DB_2 (ILL2)'
        }]
      }
    }]
  }],
  originalIndex: 43,
  eep: 'a5-06-02',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Light Sensor',
  func_number: '0x06',
  description: '',
  submitter: []
}
