export const a5140a = {
  number: '0x0a',
  title: 'Window/Door-Sensor with States Open/Closed/Tilt, Supply voltage monitor and Vibrationdetection',
  status: 'released',
  description: '<br/><br/>\n          Purpose (eg): Ventilation，Lighting，Alarm ，Intrusion (breakage of glass),\n          Calling system',
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
      data: 'Supply voltage',
      shortcut: 'SVC',
      description: 'Supply voltage / super cap. (linear);\n                <br/>251 – 255 reserved for error code',
      info: {},
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '250'
      },
      scale: {
        min: '0',
        max: '5.0'
      },
      unit: 'V'
    }, {
      data: 'Vibration',
      shortcut: 'VIB',
      description: {},
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0b0',
          description: 'No vibration detected'
        }, {
          value: '0b1',
          description: 'Vibration detected'
        }]
      }
    }, {
      data: 'Contact',
      shortcut: 'CT',
      description: {},
      bitoffs: '29',
      bitsize: '2',
      enum: {
        item: [{
          value: '0',
          description: 'Closed'
        }, {
          value: '1',
          description: 'Tilt'
        }, {
          value: '3',
          description: 'Open'
        }]
      }
    }]
  }],
  originalIndex: 118,
  eep: 'a5-14-0a',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Multi-Func Sensor',
  func_number: '0x14',
  submitter: [
    'EiMSIG eine Marke der EFP GmbH'
  ]
}
