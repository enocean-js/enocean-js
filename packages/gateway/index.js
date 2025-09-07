#! /usr/bin/env node
import { EnoceanGateway } from "./server.js";

let server = new EnoceanGateway();
server.start();
