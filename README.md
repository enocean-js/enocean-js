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

This is the monorepo for all things enocean in javascript. It is home to a library of tools to work with enocean telegrams in javascript.
some of the features are:

* a general encoder/decoder for all EEPs that runs in node.js and the browser allowing you to go from binary representation to JSON back and forth. i call it the transcoder.
* a serialport ESP3Parser
* a common command interface for managing your USB device
* a transformer to turn ESP3 packets into concrete types with all their interfaces.

you can install and use these tools separately or in a complete package. so either `npm install enocean-js` or `npm install @enocean-js/some-tool`.
You can find all the installable modules [at the enocean-js npm organisation](https://www.npmjs.com/settings/enocean-js/packages)


You will also find some full blown apps here:

* [node-red-contrib-enocean](packages/node-red-contrib-enocean)
* [enocean-ip-gateway (very early alpha)](packages/enocean-ip-gateway)
* [dolphin view like tool based on electron (not started yet)](packages/octopus-view)

Some work has started on creating an EEP Description Language (EEPDL) based on JSON. I started creating a [json-schema](https://github.com/enocean-js/enocean-js/tree/master/docs/schema) for it. It will be used for [documentation](resources/enocean-specification/Enocean%20Equipment%20Profiles) as well as beeing an integral part of the transcoder.
I will also publish the json descritions of all the EEPs for other implementers. For this to be useful, the describing language must be well defined.

## slack

join the conversation

[![join the conversation on slack](https://cdn.brandfolder.io/5H442O3W/as/pl546j-7le8zk-5guop3/Slack_RGB.png?height=64)](https://join.slack.com/t/enocean-js/shared_invite/enQtNTE0MzU2OTE1ODc2LTgzYTdhNDJkZWE3ZDk1MzVmYzk0NzcwZGVkMjNiMzg3MTU2MGNlNjEwYWVjNWNjYTcwZTNiOTdkZjk0NmYyOTU)

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

## documentation

the documentation is still lacking, sorry... the only thing i can offer for now is the description of the [content of enocean telegrams (EEP specification)](https://enocean-js.github.io/enocean-js/?eep=a5-02-01). It's not yet fully functional :-(
