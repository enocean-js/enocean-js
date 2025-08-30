export const CO_RD_REPEATER = {
  name: 'CO_RD_REPEATER ',
  commandCode: 0x0a,
  responsDefinition: {
    0: [
      {
        name: 'mode',
        location: 'data',
        offset: 1,
        length: 1,
        retFunc: x => {
          const vals = {
            0: 'OFF',
            1: 'ON all',
            2: 'ON filtered'
          }
          return vals[x]
        }
      }, {
        name: 'level',
        location: 'data',
        offset: 2,
        length: 1,
        retFunc: x => `level-${x}`
      }]
  }
}
