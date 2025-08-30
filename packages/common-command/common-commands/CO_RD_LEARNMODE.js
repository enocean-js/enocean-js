export const CO_RD_LEARNMODE = {
  name: 'CO_RD_LEARNMODE',
  commandCode: 0x17,
  responsDefinition: {
    0: [
      {
        name: 'enabled',
        location: 'data',
        offset: 1,
        length: 1,
        retFunc: x => x === 1
      }, {
        name: 'channel',
        location: 'optionalData',
        offset: 0,
        length: 1,
        retFunc: x => x
      }
    ]
  }
}
