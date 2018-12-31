export const DESC_CO_RD_SYS_LOG = {
  name: 'CO_RD_SYS_LOG',
  commandCode: 4,
  fields: [],
  responseDefinition: {
    0: [
      {
        name: 'returnCode',
        value: 'RET_OK'
      }, {
        name: 'apiLogCounter',
        location: 'data',
        retFunc: x => {
          x.shift()
          return x
        }
      }, {
        name: 'appLogCounter',
        location: 'optionalData',
        retFunc: x => x
      }
    ]
  }
}
