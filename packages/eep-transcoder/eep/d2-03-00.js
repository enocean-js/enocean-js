export const d20300 = {
  number: '0x00',
  title: 'Type 0x00',
  status: 'released',
  description: '\n              <br/>\n              <br/>\n                <b>EEP Properties:</b>\n                <br/>DATA EXCHANGE\n                <br/>Direction: unidirectional\n                <br/>Addressing: broadcast\n                <br/>Communication trigger: event-triggered\n                <br/>Communication interval: N/A\n                <br/>Trigger event: N/A\n                <br/>Tx delay: N/A\n                <br/>Rx timeout : N/A\n                <br/>\n                <br/>TEACH-IN\n                <br/>Teach-in method: Universal teach-in (UTE) + Secure Teach-in (for secure communication)\n                <br/>\n                <br/>SECURITY\n                <br/>Encryption supported: yes\n                <br/>\n                <br/>\n                <br/>\n                <b>EEP Family Table:</b>\n                <br/><br/>\n            <table>\n              <tr>\n                <th>Supported function</th>\n                <th>Type 00</th>\n              </tr>\n              <tr>\n                <td>2 Rocker Switch</td>\n                <td style="background-color:#FFFFFF">X</td>\n              </tr>\n            </table>',
  case: [{
    description: 'The encrypted telegram has the R-ORG 0x30. The payload (4 bits) is encrypted.\n              That telegram can be repeated. After decryption and the authentication of the CMAC,\n              the telegram turns into a non-encrypted EnOcean telegram with the R-ORG 0x32.\n              The payload will be expanded to 8 bits (4 MSB set to zero) and can then be\n              interpreted as described in the telegram definition table.\n                <br/>\n                <br/>The decrypted telegram may not be repeated as the information is not secure anymore.\n              The following table provides information about the conversion between the profiles\n              D2-03-00 and F6-02-01:\n                <br/>\n                <br/>\n                <table>\n                  <tr>\n                    <th>D2-03-00 DATA</th>\n                    <th>F6-02-01 DATA</th>\n                    <th>F6-02-01 STATUS</th>\n                  </tr>\n                  <tr>\n                    <td>0...4</td>\n                    <td style="background-color:#F1FFB7">-</td>\n                    <td style="background-color:#F1FFB7">-</td>\n                  </tr>\n                  <tr>\n                    <td>5</td>\n                    <td style="background-color:#F1FFB7">0x17</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>6</td>\n                    <td style="background-color:#F1FFB7">0x70</td>\n                    <td style="background-color:#F1FFB7">0x20</td>\n                  </tr>\n                  <tr>\n                    <td>7</td>\n                    <td style="background-color:#F1FFB7">0x37</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>8</td>\n                    <td style="background-color:#F1FFB7">0x10</td>\n                    <td style="background-color:#F1FFB7">0x20</td>\n                  </tr>\n                  <tr>\n                    <td>9</td>\n                    <td style="background-color:#F1FFB7">0x15</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>10</td>\n                    <td style="background-color:#F1FFB7">0x35</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>11</td>\n                    <td style="background-color:#F1FFB7">0x50</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>12</td>\n                    <td style="background-color:#F1FFB7">0x70</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>13</td>\n                    <td style="background-color:#F1FFB7">0x10</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>14</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>15</td>\n                    <td style="background-color:#F1FFB7">bxxx0xxxx</td>\n                    <td style="background-color:#F1FFB7">0x20</td>\n                  </tr>\n                </table>\n                <br/>\n                <br/>\n                <br/>',
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '4'
    }, {
      data: 'Rocker Information',
      shortcut: 'RI2',
      description: 'Information about pressed rockers (similar to RPS profiles)',
      info: {},
      bitoffs: '4',
      bitsize: '4',
      enum: {
        item: [{
          min: '0',
          max: '4',
          description: 'Reserved'
        }, {
          value: '5',
          description: 'Button A1 + B0 pressed, energy bow pressed'
        }, {
          value: '6',
          description: '3 or 4 buttons pressed, energy bow pressed'
        }, {
          value: '7',
          description: 'Button A0 + B0 pressed, energy bow pressed'
        }, {
          value: '8',
          description: 'No buttons pressed, energy bow pressed'
        }, {
          value: '9',
          description: 'Button A1 + B1 pressed, energy bow pressed'
        }, {
          value: '10',
          description: 'Button A0 + B1 pressed, energy bow pressed'
        }, {
          value: '11',
          description: 'Button B1 pressed, energy bow pressed'
        }, {
          value: '12',
          description: 'Button B0 pressed, energy bow pressed'
        }, {
          value: '13',
          description: 'Button A1 pressed, energy bow pressed'
        }, {
          value: '14',
          description: 'Button A0 pressed, energy bow pressed'
        }, {
          value: '15',
          description: 'Energy bow released'
        }]
      }
    }]
  }],
  originalIndex: 162,
  eep: 'd2-03-00',
  rorg_title: 'VLD Telegram',
  rorg_number: '0xD2',
  func_title: 'Light, Switching + Blind Control',
  func_number: '0x03',
  submitter: [
    'EnOcean GmbH'
  ]
}
