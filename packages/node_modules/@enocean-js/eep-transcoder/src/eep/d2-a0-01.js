export const d2a001 = {
  number: '0x01',
  title: 'Valve Control',
  status: 'released',
  description: '\n              <br/><br/>\n              Description:<br/>\n              Radio operated valve control with feedback message.\n              Valve is controlled through the air interface to be opened or closed.\n              The valve reports the actual status after finishing the determined operation.\n              <br/><br/>\n              <span style="border-bottom:2px groove #000000;">Data exchange</span>\n              <br/>\n              Direction: bidirectional<br/>\n              Addressing: addressed (inbound) and broadcast (outbound)<br/>\n              Communication trigger: event- & time-triggered<br/>\n              Trigger event: position of valve has changed<br/>\n              Teach-in method: UTE\n              <br/><br/>\n              DIRECTION-1 = Outbound (water valve to the controller)\n              <br/>\n              Description: Valve reports its status. Report is sent after operation was executed or as a heartbeat.\n              <br/><br/>\n              DIRECTION-2 = Inbound (controller to the water valve)\n              <br/>\n              Description: Operational command to the valve.\n              After this request a feedback response will be transmitted,\n              once the operation is finished.\n              <br/>\n              A “no change”-command will also be followed by a feedback response.\n              Therefore, it can be used as a status request.',
  case: [{
    direction: '1',
    condition: {
      direction: '1'
    },
    datafield: [{
      data: 'Feedback',
      shortcut: 'FDB',
      description: 'Return',
      info: 'Feedback',
      bitoffs: '6',
      bitsize: '2',
      enum: {
        item: [{
          value: '0b00',
          description: 'Not defined'
        }, {
          value: '0b01',
          description: 'Closed'
        }, {
          value: '0b10',
          description: 'Opened'
        }, {
          value: '0b11',
          description: 'Not defined'
        }]
      }
    }, {
      reserved: {},
      bitoffs: '0',
      bitsize: '6'
    }]
  }, {
    direction: '2',
    condition: {
      direction: '2'
    },
    datafield: [{
      data: 'Request',
      shortcut: 'REQ',
      description: 'Request to operate the valve',
      info: 'Request',
      bitoffs: '6',
      bitsize: '2',
      enum: {
        item: [{
          value: '0b00',
          description: 'No change (request of feedback)'
        }, {
          value: '0b01',
          description: 'Request to close valve'
        }, {
          value: '0b10',
          description: 'Request to open valve'
        }, {
          value: '0b11',
          description: 'Request to close valve'
        }]
      }
    }, {
      reserved: {},
      bitoffs: '0',
      bitsize: '6'
    }]
  }],
  originalIndex: 213,
  eep: 'd2-a0-01',
  rorg_title: 'VLD Telegram',
  rorg_number: '0xD2',
  func_title: 'Standard Valve',
  func_number: '0xA0',
  submitter: [
    'Afriso',
    'EnOcean'
  ]
}
