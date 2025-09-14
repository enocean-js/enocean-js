import fs from "fs";
import path from "path";
import os from "os";

class Logger {
  constructor(logFilePath) {
    this.stream = fs.createWriteStream(logFilePath, { flags: "a" });
    //this.messageStream = fs.createWriteStream(logFilePath, { flags: "a" });
  }
  getLogger(context) {
    return {
      log: (...args) => {
        this.stream.write(`[${context}] ${args.join(" ")}\n`);
      },
      // other log levels...
    };
  }
}

// Singleton instance
const logFilePath = path.join(os.homedir(), `.enocean-js/system.log`);
const loggerInstance = new Logger(logFilePath);

export default loggerInstance;
