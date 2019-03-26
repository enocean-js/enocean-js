export const DESC_CO_GET_FREQUENCY_INFO = {
  name: 'DESC_CO_GET_FREQUENCY_INFO',
  commandCode: 25,
  fields: [],
  responseDefinition: {
    0: [
      {
        name: 'frequency',
        location: 'data',
        offset: 1,
        length: 2,
        retFunc: x => {
          const FRQ = {
            0x00: '315Mhz',
            0x01: '868.3Mhz',
            0x02: '902.875Mhz',
            0x03: '925 Mhz',
            0x04: '928 Mhz',
            0x20: '2.4 Gh'
          }
          return FRQ[x]
        }
      }, {
        name: 'protocol',
        location: 'data',
        offset: 2,
        length: 2,
        retFunc: x => {
          const PROTO = {
            0x00: 'ERP1',
            0x01: 'ERP2',
            0x10: '802.15.4',
            0x20: 'Bluetooth',
            0x30: 'Long Range'
          }
          return PROTO[x]
        }
      }
    ]
  }
}
