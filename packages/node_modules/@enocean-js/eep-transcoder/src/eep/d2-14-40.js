export const d21440 = {
  number: '0x40',
  title: 'Indoor -Temperature, Humidity XYZ Acceleration, Illumination Sensor',
  status: 'proposed',
  description: '',
  case: {
    description: '',
    datafield: [
      {
        data: 'Temperature',
        shortcut: 'TMP10',
        description: 'Temperature (linear)',
        info: '',
        bitoffs: '0',
        bitsize: '10',
        enum: {
          item: [
            {
              min: '0',
              max: '1000',
              scale: { min: '-40', max: '60' },
              unit: '°C'
            },
            { min: '1001', max: '1020', description: 'Reserved' },
            { value: '1021', description: 'Out of Range negative' },
            { value: '1022', description: 'Out of Range positive' },
            { value: '1023', description: 'Error' }
          ]
        }
      },
      {
        data: 'Humidity',
        shortcut: 'HUM',
        description: 'Rel. Humidity (linear)',
        info: '',
        bitoffs: '10',
        bitsize: '8',
        enum: {
          item: [
            {
              min: '0',
              max: '200',
              scale: { min: '0', max: '100' },
              unit: '%'
            },
            { min: '201', max: '254', description: 'Reserved' },
            { value: '255', description: 'Error' }
          ]
        }
      },
      {
        data: 'Illumination',
        shortcut: 'ILL',
        description: 'Illumination (linear)',
        info: '',
        bitoffs: '18',
        bitsize: '17',
        enum: {
          item: [
            {
              min: '0',
              max: '100000',
              scale: { min: '0', max: '100000' },
              unit: 'lx'
            },
            { min: '100001', max: '131070', description: 'Reserved' },
            { value: '131071', description: 'Error' }
          ]
        }
      },
      {
        data: 'Accleration Status',
        shortcut: 'ACC_S',
        description: 'Status of the Sensor',
        info: '',
        bitoffs: '35',
        bitsize: '2',
        enum: {
          item: [
            { value: '0', description: 'Heartbeat' },
            { value: '1', description: 'Threshold 1 exceeded' },
            { value: '2', description: 'Threshold 2 exceeded' },
            { value: '3', description: 'Reserved' }
          ]
        }
      },
      {
        data: 'Acceleration X',
        shortcut: 'ACC_X',
        description: 'Acceleration  X (linear)',
        info: '',
        bitoffs: '37',
        bitsize: '10',
        enum: {
          item: [
            {
              min: '0',
              max: '1000',
              scale: { min: '-2.5', max: '2.5' },
              unit: 'g'
            },
            { min: '1000', max: '1020', description: 'Reserved' },
            { value: '1021', description: 'Out of range negative' },
            { value: '1022', description: 'Out of range positive' },
            { value: '1023', description: 'Error' }
          ]
        }
      },
      {
        data: 'Acceleration Y',
        shortcut: 'ACC_Y',
        description: 'Acceleration  Y (linear)',
        info: '',
        bitoffs: '47',
        bitsize: '10',
        enum: {
          item: [
            {
              min: '0',
              max: '1000',
              scale: { min: '-2.5', max: '2.5' },
              unit: 'g'
            },
            { min: '1000', max: '1020', description: 'Reserved' },
            { value: '1021', description: 'Out of range negative' },
            { value: '1022', description: 'Out of range positive' },
            { value: '1023', description: 'Error' }
          ]
        }
      },
      {
        data: 'Acceleration Z',
        shortcut: 'ACC_Z',
        description: 'Acceleration  Z (linear)',
        info: '',
        bitoffs: '57',
        bitsize: '10',
        enum: {
          item: [
            {
              min: '0',
              max: '1000',
              scale: { min: '-2.5', max: '2.5' },
              unit: 'g'
            },
            { min: '1000', max: '1020', description: 'Reserved' },
            { value: '1021', description: 'Out of range negative' },
            { value: '1022', description: 'Out of range positive' },
            { value: '1023', description: 'Error' }
          ]
        }
      },
      { reserved: '', bitoffs: '67', bitsize: '5' }
    ]
  },
  eep: 'd2-14-40',
  rorg_title: 'VLD',
  rorg_number: '0xD2',
  func_title: 'Multisensors',
  func_number: '0x14'
}
