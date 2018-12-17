export const CO_RD_MEM_ADDRESS = {
  name: 'CO_RD_MEM_ADDRESS',
  commandCode: 0x14,
  responsDefinition: {
    0: [
      {
        name: 'type',
        location: 'data',
        offset: 1,
        length: 1,
        retFunc: x => {
          return x
        }
      }, {
        name: 'address',
        location: 'data',
        offset: 2,
        length: 4,
        retFunc: x => parseInt(x.toString('hex'), 16)
      }, {
        name: 'length',
        location: 'data',
        offset: 6,
        length: 4,
        retFunc: x => parseInt(x.toString('hex'), 16)
      }
    ]
  }
}
