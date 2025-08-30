export const CO_WR_REMAN_CODE = {
  name: 'CO_WR_REMAN_CODE',
  commandCode: 0x2e,
  responsDefinition: {
    0: [
      {
        name: 'count',
        location: 'data',
        offset: 1,
        length: 1,
        retFunc: x => x
      }
    ]
  }
}
