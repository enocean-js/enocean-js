<img src="resources/images/enocean-js-color.svg" width="100"/>

# enocean-js

[![GitHub](https://img.shields.io/github/license/enocean-js/enocean-js.svg)](https://github.com/enocean-js/enocean-js/blob/master/LICENSE.md)

[![Greenkeeper badge](https://badges.greenkeeper.io/enocean-js/enocean-js.svg)](https://greenkeeper.io/)

[![](https://travis-ci.org/enocean-js/enocean-js.svg?branch=master)](https://travis-ci.org/enocean-js/enocean-js)
![Code Climate coverage](https://img.shields.io/codeclimate/coverage/enocean-js/enocean-js.svg)
![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/enocean-js/enocean-js.svg)
![Code Climate technical debt](https://img.shields.io/codeclimate/tech-debt/enocean-js/enocean-js.svg)

[![Total alerts](https://img.shields.io/lgtm/alerts/g/enocean-js/enocean-js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/enocean-js/enocean-js/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/enocean-js/enocean-js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/enocean-js/enocean-js/context:javascript)

![npm](https://img.shields.io/npm/v/enocean-js.svg)

![npm](https://img.shields.io/npm/dt/enocean-js.svg)

starting with **enocean-js@0.0.1-beta.8** there is now an installable package. you can start using and testing it!

## install

    npm i -S enocean-js
    
## simple examle

    nmp i -S enocean-js serialport

and then...

    const SerialPort = require('serialport')
    const Enocean = require('enocean-js')
    const pretty = Enocean.pretty
    const ESP3Parser = Enocean.ESP3Parser

    const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
    const parser = new ESP3Parser()
    port.pipe(parser)

    parser.on('data', pretty.logESP3)
