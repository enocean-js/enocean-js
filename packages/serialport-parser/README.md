# ESP3 Serialport Parser

A robust, high-performance Node.js stream parser for EnOcean ESP3 telegrams.

## Features

- Parses ESP3 telegrams from noisy or fragmented byte streams
- Recovers gracefully from random data and malformed packets
- Emits valid telegrams as `Uint8Array` objects
- Handles edge cases and high-throughput scenarios

## Usage

```js
import { ESP3Parser } from "./serialport-parser.js";
const parser = new ESP3Parser();
parser.on("data", (packet) => {
  // Handle parsed ESP3 telegram
});
```

## License

Licensed under MIT.
See header in source files for details.

---

This package is part of the [enocean-js](https://github.com/enocean-js/enocean-js) project.
