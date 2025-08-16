#!/usr/bin/env node
const SerialportSender = require('@enocean-js/serialport-sender').SerialportSender
const ESP3Parser = require('@enocean-js/serialport-parser').ESP3Parser
const SerialPort = require('serialport')
// const fs = require('fs')
let httpPort = 4242
let serialPort = '/dev/ttyUSB0'

for (let i = 2; i < process.argv.length; i++) {
  let next
  switch (process.argv[i]) {
    case '-p':
    case '--port':
      next = process.argv[i + 1]
      if (!isNaN(next)) {
        httpPort = next
      } else {
        throw new Error('port must be a number')
      }
      break
    case '-s':
    case '--serialport':
      // TODO: sanity checks
      serialPort = process.argv[i + 1]
      break
  }
}

const port = new SerialPort(serialPort, { baudRate: 57600 })
port.on('open', () => { console.log(`${serialPort} open`) })
port.on('error', () => { port.close(); throw new Error(`could not open ${serialPort}`) })
const parser = new ESP3Parser()
port.pipe(parser)
const sender = SerialportSender({ port: port, parser: new ESP3Parser() })

const http = require('http').Server()
const io = require('socket.io')(http)

io.on('connection', function (socket) {
  socket.on('send', async function (tel) {
    try {
      const res = await sender.send(tel)
      socket.emit('response', res.toString())
    } catch (err) {
      console.log('err')
      socket.emit('error', err)
    }
  })
})

http.listen(httpPort, function () {
  console.log('listening on *:' + httpPort)
})

setInterval(() => { }, 10)

parser.on('data', data => {
  io.emit('data', data.toString())
})
