export const d22002 = {
  number: '0x02',
  title: 'Type 0x02',
  status: 'released',
  description: '',
  case: [{
    title: 'Telegram Definition : ‘Fan Control Message’',
    description: '* Devices with discrete fan speed levels instead of a continuous fan speed\n              range should divide the full range linearly and match values beside those\n              discrete levels to the next lower fan speed level.',
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '7'
    }, {
      reserved: {},
      bitoffs: '8',
      bitsize: '2'
    }, {
      reserved: {},
      bitoffs: '16',
      bitsize: '8'
    }, {
      data: 'Message Type',
      shortcut: 'MT',
      description: 'Defines the message type',
      info: {},
      bitoffs: '7',
      bitsize: '1',
      enum: {
        item: {
          value: '0',
          description: 'Fan control'
        }
      }
    }, {
      data: 'Room Size Reference',
      shortcut: 'RSR',
      description: 'Defines if the provided room size has to be considered',
      info: {},
      bitoffs: '10',
      bitsize: '2',
      enum: [{
        item: {
          value: '0',
          description: 'Used'
        }
      }, {
        item: {
          value: '1',
          description: 'Not used'
        }
      }, {
        item: {
          value: '2',
          description: 'Default'
        }
      }, {
        item: {
          value: '3',
          description: 'No change'
        }
      }]
    }, {
      data: 'Room Size',
      shortcut: 'RS',
      description: 'Defines the room size',
      info: {},
      bitoffs: '12',
      bitsize: '4',
      enum: [{
        item: {
          value: '0',
          description: '< 25 m²'
        }
      }, {
        item: {
          value: '1',
          description: '25...50 m²'
        }
      }, {
        item: {
          value: '2',
          description: '50...75 m²'
        }
      }, {
        item: {
          value: '3',
          description: '75...100 m²'
        }
      }, {
        item: {
          value: '4',
          description: '100...125 m²'
        }
      }, {
        item: {
          value: '5',
          description: '125...150 m²'
        }
      }, {
        item: {
          value: '6',
          description: '150...175 m²'
        }
      }, {
        item: {
          value: '7',
          description: '175...200 m²'
        }
      }, {
        item: {
          value: '8',
          description: '200...225 m²'
        }
      }, {
        item: {
          value: '9',
          description: '225...250 m²'
        }
      }, {
        item: {
          value: '10',
          description: '250...275 m²'
        }
      }, {
        item: {
          value: '11',
          description: '275...300 m²'
        }
      }, {
        item: {
          value: '12',
          description: '300...325 m²'
        }
      }, {
        item: {
          value: '13',
          description: '325...350 m²'
        }
      }, {
        item: {
          value: '14',
          description: '> 350 m²'
        }
      }, {
        item: {
          value: '15',
          description: 'No change'
        }
      }]
    }, {
      data: 'Fan Speed *',
      shortcut: 'FS',
      description: 'Sets the fan speed',
      info: {},
      bitoffs: '24',
      bitsize: '8',
      enum: [{
        item: {
          min: '0',
          max: '100',
          description: '0...100%'
        }
      }, {
        item: {
          min: '101',
          max: '252',
          description: 'Reserved'
        }
      }, {
        item: {
          value: '253',
          description: 'Auto'
        }
      }, {
        item: {
          value: '254',
          description: 'Default'
        }
      }, {
        item: {
          value: '255',
          description: 'No change'
        }
      }]
    }]
  }, {
    title: 'Telegram Definition : ‘Fan Status Message’',
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '7'
    }, {
      reserved: {},
      bitoffs: '16',
      bitsize: '8'
    }, {
      data: 'Message Type',
      shortcut: 'MT',
      description: 'Defines the message type',
      info: {},
      bitoffs: '7',
      bitsize: '1',
      enum: {
        item: {
          value: '1',
          description: 'Fan status'
        }
      }
    }, {
      data: 'Humidity Control Status',
      shortcut: 'HCS',
      description: 'States if the humidity control is active',
      info: {},
      bitoffs: '8',
      bitsize: '2',
      enum: [{
        item: {
          value: '0',
          description: 'Disabled'
        }
      }, {
        item: {
          value: '1',
          description: 'Enabled'
        }
      }, {
        item: {
          value: '2',
          description: 'Reserved'
        }
      }, {
        item: {
          value: '3',
          description: 'Not supported'
        }
      }]
    }, {
      data: 'Room Size Reference',
      shortcut: 'RSR',
      description: 'States if the provided room size has to be considered',
      info: {},
      bitoffs: '10',
      bitsize: '2',
      enum: [{
        item: {
          value: '0',
          description: 'Used'
        }
      }, {
        item: {
          value: '1',
          description: 'Not used'
        }
      }, {
        item: {
          value: '2',
          description: 'Reserved'
        }
      }, {
        item: {
          value: '3',
          description: 'Not supported'
        }
      }]
    }, {
      data: 'Room Size Status',
      shortcut: 'RSS',
      description: 'Room size status',
      info: {},
      bitoffs: '12',
      bitsize: '4',
      enum: [{
        item: {
          value: '0',
          description: '< 25 m²'
        }
      }, {
        item: {
          value: '1',
          description: '25...50 m²'
        }
      }, {
        item: {
          value: '2',
          description: '50...75 m²'
        }
      }, {
        item: {
          value: '3',
          description: '75...100 m²'
        }
      }, {
        item: {
          value: '4',
          description: '100...125 m²'
        }
      }, {
        item: {
          value: '5',
          description: '125...150 m²'
        }
      }, {
        item: {
          value: '6',
          description: '150...175 m²'
        }
      }, {
        item: {
          value: '7',
          description: '175...200 m²'
        }
      }, {
        item: {
          value: '8',
          description: '200...225 m²'
        }
      }, {
        item: {
          value: '9',
          description: '225...250 m²'
        }
      }, {
        item: {
          value: '10',
          description: '250...275 m²'
        }
      }, {
        item: {
          value: '11',
          description: '275...300 m²'
        }
      }, {
        item: {
          value: '12',
          description: '300...325 m²'
        }
      }, {
        item: {
          value: '13',
          description: '325...350 m²'
        }
      }, {
        item: {
          value: '14',
          description: '> 350 m²'
        }
      }, {
        item: {
          value: '15',
          description: 'Not supported'
        }
      }]
    }, {
      data: 'Fan Speed Status',
      shortcut: 'FSS',
      description: 'Fan speed',
      info: {},
      bitoffs: '24',
      bitsize: '8',
      enum: [{
        item: {
          min: '0',
          max: '100',
          description: '0...100%'
        }
      }, {
        item: {
          min: '101',
          max: '254',
          description: 'Reserved'
        }
      }, {
        item: {
          value: '255',
          description: 'Not supported'
        }
      }]
    }]
  }],
  originalIndex: 196,
  eep: 'd2-20-02',
  rorg_title: 'VLD Telegram',
  rorg_number: '0xD2',
  func_title: 'Fan Control',
  func_number: '0x20',
  submitter: [
    'Maico Elektroapparate-Fabrik GmbH'
  ]
}
