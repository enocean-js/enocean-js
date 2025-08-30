export const DESC_CO_WR_SLEEP = {
  name: 'CO_WR_SLEEP',
  commandCode: 1,
  responseDefinition: {},
  fields: [
    {
      name: 'period',
      location: 'data',
      offset: 1,
      length: 4,
      retFunc: x => {
        return x.getValue(8, 24)
      }
    }
  ]
}
