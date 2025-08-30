[![Build Status](https://travis-ci.org/Borewit/t-readable.svg?branch=master)](https://travis-ci.org/Borewit/t-readable)
[![NPM version](https://badge.fury.io/js/t-readable.svg)](https://npmjs.org/package/t-readable)
[![npm downloads](http://img.shields.io/npm/dm/t-readable.svg)](https://npmcharts.com/compare/t-readable?start=1200&interval=30)

# t-readable
Split one [_readable stream_](https://nodejs.org/api/stream.html#stream_readable_streams) into multiple [_readable streams_](https://nodejs.org/api/stream.html#stream_readable_streams).

## Installation

Using [npm](https://www.npmjs.com/get-npm):
```sh
npm install t-readable
```
or [yarn](https://yarnpkg.com/):
```sh
yan add t-readable
```

## Usage

```js
const { tee } = require('t-readable');
const got = require('got');

const url = 'https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg';

/**
 * Counts the number of bytes in the givent stream
 * @param readable {stream.Readable} - Readable stream
 * @return {Promise<number>} - Number of bytes until the end of stream is reached
 */
async function countBytes(readable) {
  let bytesRead = 0;

  return new Promise((resolve, reject) => {
    readable.on('data', chunk => {
      bytesRead += chunk.length;
    });
    readable.on('end', () => {
      resolve(bytesRead);
    });
    readable.on('error', error => {
      reject(error);
    });
  });
}

(async () => {
  const stream = got.stream(url); // stream is an instance of class stream.Readable

  const teedStreams = tee(stream);
  
  // Count the number of bytes received in each teed stream
  const counts = await Promise.all(teedStreams.map(readable => countBytes(readable)));
  console.log('Counts: ' + counts.join(', ')); // Counts: 27661, 27661
})();
```

