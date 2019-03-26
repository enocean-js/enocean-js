// const SerialportSender = require('@enocean-js/serialport-sender').SerialportSender
const ESP3Parser = require('@enocean-js/serialport-parser').ESP3Parser
const Pretty = require('@enocean-js/pretty-printer').pretty
const SerialPort = require('serialport')
var serialPort = '/dev/ttyUSB0'
const port = new SerialPort(serialPort, { baudRate: 57600 })
port.on('open', () => { console.log(`${serialPort} open`) })
port.on('error', () => { port.close(); throw new Error(`could not open ${serialPort}`) })
const parser = new ESP3Parser()
port.pipe(parser)
console.log(Pretty)
var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.send(`
    <html>
    <body>
    <script>
    fetch("/stream").then(response => response.body.getReader()).then(reader=>read(reader))
    async function read(reader){
      var res = await reader.read()
      document.write(
        Array.from(res.value).map(item=>String.fromCharCode(item)).join("")
      )
      if(res.done===false){
        read(reader)
      }
    }
    </script>
    </body>
    </html>
    `)
})

app.get('/stream', function (req, res) {
  parser.on('data', data => {
    Pretty.logESP3(data)
    res.write(JSON.stringify(data) + '\r\n\r\n')
  })
  req.on("close",x=>console.log("connection closed"))
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
