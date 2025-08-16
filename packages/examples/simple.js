import { SerialPort } from "serialport";
import * as Enocean from "@enocean-js/enocean-js";

const pretty = Enocean.pretty;
const ESP3Parser = Enocean.ESP3Parser;

const port = new SerialPort({ path: "/dev/ttyUSB0", baudRate: 57600 });
const parser = new ESP3Parser();
port.pipe(parser);

parser.on("data", pretty.logESP3);
