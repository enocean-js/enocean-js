export const CO_RD_NUMSECUREDEVICES = {
  name: 'CO_RD_NUMSECUREDEVICES',
  commandCode: 0x1d,
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
