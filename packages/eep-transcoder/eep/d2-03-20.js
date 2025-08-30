export const d20320 = {
  number: '0x20',
  title: 'Beacon with Vibration Detection',
  status: 'released',
  description: '\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Description</span>\n              <br/>\n              This profile is defined for the use in beacon devices.\n              Such devices transmit if the telegram was triggered by a vibration or the timer.\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Data exchange</span>\n              <br/>Direction: unidirectional\n              <br/>Addressing: broadcast\n              <br/>Communication trigger: event- & time-triggered\n              <br/>Communication interval: -\n              <br/>Trigger event: Vibration (movement), timer\n              <br/>Tx delay: -\n              <br/>Rx timeout: -\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Teach-in</span>\n              <br/>Teach-in method: N/A\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Security</span>\n              <br/>Encryption supported: no\n              <br/>Security level format: -\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Appendix</span>\n              <br/>\n              This beacon device can send a radio telegram at a prescribed timing.\n              The receiver can detect the beacon device with this transmission.\n              This device, when attached to a human body, can also be made into a\n              wide variety of beacon-based systems, which keep people within the\n              safe area, or keep them out of the danger zone.\n              <br/><br/>\n              This device can replace a battery with a vibration power generator.\n              The beacon device harvests power from human walking motion and\n              activates the radio transmitter circuit; it does not require\n              batteries of any kind, enabling maintenance-free operation in many\n              applications.\n              <br/><br/>\n              The product to be immediately released comes with no switches, and\n              the future product, to follow soon, will be equipped with pushbuttons\n              for wider application possibilities.',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: '1',
      bitsize: '7'
    }, {
      data: 'Energy Supply',
      shortcut: 'ES',
      description: 'Defines the energy source for the transmission',
      info: {},
      bitoffs: '0',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Battery supply'
        }, {
          value: '1',
          description: 'Vibration generator supply'
        }]
      }
    }]
  }],
  originalIndex: 164,
  eep: 'd2-03-20',
  rorg_title: 'VLD Telegram',
  rorg_number: '0xD2',
  func_title: 'Light, Switching + Blind Control',
  func_number: '0x03',
  submitter: [
    'Star Micronics Co., LTD.'
  ]
}
