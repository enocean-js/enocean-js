export const CO_RD_DUTYCYCLE_LIMIT = {
  name: 'CO_RD_DUTYCYCLE_LIMIT',
  commandCode: 0x23,
  responsDefinition: {
    0: [
      {
        name: 'load',
        location: 'data',
        offset: 1,
        length: 1,
        retFunc: x => x
      }, {
        name: 'slots',
        location: 'data',
        offset: 2,
        length: 1,
        retFunc: x => x
      }, {
        name: 'slotPeriod',
        location: 'data',
        offset: 3,
        length: 2,
        retFunc: x => x[0] * 256 + x[1]
      }, {
        name: 'slotLeft',
        location: 'data',
        offset: 5,
        length: 2,
        retFunc: x => x[0] * 256 + x[1]
      }, {
        name: 'loadAfter',
        location: 'data',
        offset: 7,
        length: 1,
        retFunc: x => x
      }
    ]
  }
}
