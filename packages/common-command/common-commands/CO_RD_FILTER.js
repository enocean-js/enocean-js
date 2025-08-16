export const CO_RD_FILTER = {
  name: 'CO_RD_FILTER',
  commandCode: 0x0f,
  responsDefinition: {
    0: [
      {
        name: 'filters',
        location: 'data',
        retFunc: x => {
          const filters = []
          for (let i = 0; i < x.length - 1; i += 5) {
            const value = x.slice(i + 2, i + 6).toString('hex')
            const type = x[i + 1]
            filters.push({ type, value })
          }
          return filters
        }
      }
    ]
  }
}
