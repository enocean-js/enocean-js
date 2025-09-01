var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../byte-array/byte-array.js
var ByteArray = class _ByteArray extends Array {
  set(arr, offset = 0) {
    const tmp = _ByteArray.from(arr);
    if (tmp.length === 0) return;
    this.splice(offset, tmp.length, ...tmp);
  }
  getValue(bitOffset, bitLength) {
    if (bitLength === 0) return 0;
    return parseInt(this.toString(2).substr(bitOffset, bitLength), 2);
  }
  setValue(value, offset, bitLength) {
    const bits = value.toString(2).padStart(bitLength, "0");
    for (let i = 0; i < bits.length; i++) {
      this.setSingleBit(offset + i, parseInt(bits[i]));
    }
    return this;
  }
  setSingleBit(offset, value) {
    const byte = (offset - offset % 8) / 8;
    const mask = 1 << 7 - parseInt(offset % 8);
    value === 1 ? this[byte] |= mask : this[byte] &= ~mask;
    return this;
  }
  getSingleBit(offset) {
    const byte = (offset - offset % 8) / 8;
    const mask = 1 << 7 - parseInt(offset % 8);
    if ((this[byte] & mask) !== 0) {
      return 1;
    } else {
      return 0;
    }
  }
  toString(radix = 16) {
    switch (radix) {
      case "bin":
      case 2:
        return this.map((item) => item.toString(2).padStart(8, "0")).join("");
      case "dec":
      case 10:
        return this.map((item) => item.toString(10).padStart(3, "0")).join("");
      case "hex":
      case 16:
        return this.map((item) => item.toString(16).padStart(2, "0")).join("");
    }
  }
};
ByteArray.from = function(...args) {
  const tmp = [];
  args.forEach((item) => {
    if (Number.isInteger(item) && item <= 255) {
      tmp.push(item);
    }
    if (Number.isInteger(item) && item > 255) {
      const t3 = ByteArray.from(item.toString(16));
      t3.forEach((x) => {
        tmp.push(x);
      });
    }
    if (typeof item === "string") {
      if (!/^[0-9abcdef]*$/.test(item)) {
        item.split("").forEach((x) => {
          tmp.push(x.charCodeAt(0));
        });
      } else {
        if (item.length % 2 !== 0) {
          item = `0${item}`;
        }
        (item.match(/.{1,2}/g) || []).map((item2) => parseInt(item2, 16)).forEach((x) => {
          tmp.push(x);
        });
      }
    }
    if (Array.isArray(item)) {
      const t2 = ByteArray.from(...item);
      t2.forEach((x) => {
        tmp.push(x);
      });
    }
  });
  if (tmp.length === 1) {
    const res = new ByteArray();
    res[0] = tmp[0];
    return res;
  } else {
    return new ByteArray(...tmp);
  }
};

// ../crc8/crc8.js
var u8CRC8Table = [
  0,
  7,
  14,
  9,
  28,
  27,
  18,
  21,
  56,
  63,
  54,
  49,
  36,
  35,
  42,
  45,
  112,
  119,
  126,
  121,
  108,
  107,
  98,
  101,
  72,
  79,
  70,
  65,
  84,
  83,
  90,
  93,
  224,
  231,
  238,
  233,
  252,
  251,
  242,
  245,
  216,
  223,
  214,
  209,
  196,
  195,
  202,
  205,
  144,
  151,
  158,
  153,
  140,
  139,
  130,
  133,
  168,
  175,
  166,
  161,
  180,
  179,
  186,
  189,
  199,
  192,
  201,
  206,
  219,
  220,
  213,
  210,
  255,
  248,
  241,
  246,
  227,
  228,
  237,
  234,
  183,
  176,
  185,
  190,
  171,
  172,
  165,
  162,
  143,
  136,
  129,
  134,
  147,
  148,
  157,
  154,
  39,
  32,
  41,
  46,
  59,
  60,
  53,
  50,
  31,
  24,
  17,
  22,
  3,
  4,
  13,
  10,
  87,
  80,
  89,
  94,
  75,
  76,
  69,
  66,
  111,
  104,
  97,
  102,
  115,
  116,
  125,
  122,
  137,
  142,
  135,
  128,
  149,
  146,
  155,
  156,
  177,
  182,
  191,
  184,
  173,
  170,
  163,
  164,
  249,
  254,
  247,
  240,
  229,
  226,
  235,
  236,
  193,
  198,
  207,
  200,
  221,
  218,
  211,
  212,
  105,
  110,
  103,
  96,
  117,
  114,
  123,
  124,
  81,
  86,
  95,
  88,
  77,
  74,
  67,
  68,
  25,
  30,
  23,
  16,
  5,
  2,
  11,
  12,
  33,
  38,
  47,
  40,
  61,
  58,
  51,
  52,
  78,
  73,
  64,
  71,
  82,
  85,
  92,
  91,
  118,
  113,
  120,
  127,
  106,
  109,
  100,
  99,
  62,
  57,
  48,
  55,
  34,
  37,
  44,
  43,
  6,
  1,
  8,
  15,
  26,
  29,
  20,
  19,
  174,
  169,
  160,
  167,
  178,
  181,
  188,
  187,
  150,
  145,
  152,
  159,
  138,
  141,
  132,
  131,
  222,
  217,
  208,
  215,
  194,
  197,
  204,
  203,
  230,
  225,
  232,
  239,
  250,
  253,
  244,
  243
];
function getCRC8(buffer) {
  let crc8 = 0;
  for (let i = 0; i < buffer.length; i++) {
    crc8 = u8CRC8Table[crc8 ^ buffer[i]];
  }
  return crc8;
}
function toCRC8(accumulator, currentItem) {
  return u8CRC8Table[accumulator ^ currentItem];
}

// ../esp3-packet/esp3-packet.js
var ESP3Packet = class _ESP3Packet {
  constructor(input) {
    this._raw = ByteArray.from(input);
  }
  push(...value) {
    this._raw.push(...value);
  }
  shift() {
    this._raw.shift();
  }
  slice(...args) {
    return this._raw.slice(...args);
  }
  findIndex(func) {
    return this._raw.findIndex(func);
  }
  get length() {
    return this._raw.length;
  }
  get dataLength() {
    return this._raw[1] * 256 + this._raw[2];
  }
  get optionalLength() {
    return this._raw[3];
  }
  get packetType() {
    return this._raw[4];
  }
  set packetType(value) {
    this._raw[4] = value;
  }
  get header() {
    return this._raw.slice(1, 5);
  }
  get data() {
    return this._raw.slice(6, 6 + this.dataLength);
  }
  set data(value) {
    value = ByteArray.from(value);
    const opt = this.optionalData;
    this._raw.splice(6, this.dataLength, ...value);
    this._raw.splice(6 + value.length, this.optionalLength, ...opt);
    this._raw.length = 7 + value.length + this.optionalLength;
    this._raw.setValue(value.length, 8, 16);
  }
  get optionalData() {
    return this._raw.slice(
      6 + this.dataLength,
      6 + this.dataLength + this.optionalLength
    );
  }
  set optionalData(value) {
    value = ByteArray.from(value);
    this._raw.splice(6 + this.dataLength, value.length, ...value);
    this._raw.length = 7 + this.dataLength + value.length;
    this._raw[3] = value.length;
  }
  get body() {
    return this._raw.slice(6, 6 + this.dataLength + this.optionalLength);
  }
  get crc8Data() {
    return this._raw[6 + this.dataLength + this.optionalLength];
  }
  get crc8Header() {
    return this._raw[5];
  }
  isHeaderOK() {
    return this.header.reduce(toCRC8, 0) === this.crc8Header;
  }
  isBodyOK() {
    return this.body.reduce(toCRC8, 0) === this.crc8Data;
  }
  isPacketOK() {
    return this.isHeaderOK() && this.isBodyOK();
  }
  fixPacket() {
    this._raw[5] = this.header.reduce(toCRC8, 0);
    this._raw[6 + this.dataLength + this.optionalLength] = this.body.reduce(
      toCRC8,
      0
    );
  }
  toString(encoding) {
    return this._raw.toString(encoding);
  }
  toJSON() {
    return {
      syncByte: 85,
      header: {
        dataLength: this.dataLength,
        optionalLength: this.optionalLength,
        packetType: this.packetType
      },
      crc8Header: this._raw[5],
      data: this.data,
      optionalData: this.optionalData,
      crc8Data: this._raw[6 + this.dataLength + this.optionalLength]
    };
  }
  static from(input) {
    let packet;
    if (input && Object.prototype.hasOwnProperty.call(input, "data")) {
      packet = new _ESP3Packet("5500010001000000");
      packet.data = input.data;
      packet.optionalData = input.optionalData || [];
      packet.packetType = input.packetType || 1;
      packet.fixPacket();
    } else {
      packet = new _ESP3Packet(input);
    }
    return packet;
  }
  static fieldExtractor(res, field) {
    if (field.location) {
      if (field.length) {
        const offset = field.offset || 0;
        if (field.length === 1) {
          res[field.name] = field.retFunc(this[field.location][offset]);
        } else {
          res[field.name] = field.retFunc(
            this[field.location].slice(offset, offset + field.length)
          );
        }
      } else {
        res[field.name] = field.retFunc(this[field.location]);
      }
    } else {
      res[field.name] = field.value;
    }
    return res;
  }
};

// ../eep-transcoder/eep.js
var eep_exports = {};
__export(eep_exports, {
  a50201: () => a50201,
  a50202: () => a50202,
  a50203: () => a50203,
  a50204: () => a50204,
  a50205: () => a50205,
  a50206: () => a50206,
  a50207: () => a50207,
  a50208: () => a50208,
  a50209: () => a50209,
  a5020a: () => a5020a,
  a5020b: () => a5020b,
  a50210: () => a50210,
  a50211: () => a50211,
  a50212: () => a50212,
  a50213: () => a50213,
  a50214: () => a50214,
  a50215: () => a50215,
  a50216: () => a50216,
  a50217: () => a50217,
  a50218: () => a50218,
  a50219: () => a50219,
  a5021a: () => a5021a,
  a5021b: () => a5021b,
  a50220: () => a50220,
  a50230: () => a50230,
  a50401: () => a50401,
  a50402: () => a50402,
  a50403: () => a50403,
  a50501: () => a50501,
  a50601: () => a50601,
  a50602: () => a50602,
  a50603: () => a50603,
  a50604: () => a50604,
  a50605: () => a50605,
  a50701: () => a50701,
  a50702: () => a50702,
  a50703: () => a50703,
  a50801: () => a50801,
  a50802: () => a50802,
  a50803: () => a50803,
  a50902: () => a50902,
  a50904: () => a50904,
  a50905: () => a50905,
  a50906: () => a50906,
  a50907: () => a50907,
  a50908: () => a50908,
  a50909: () => a50909,
  a5090a: () => a5090a,
  a5090b: () => a5090b,
  a51001: () => a51001,
  a51002: () => a51002,
  a51003: () => a51003,
  a51004: () => a51004,
  a51005: () => a51005,
  a51006: () => a51006,
  a51007: () => a51007,
  a51008: () => a51008,
  a51009: () => a51009,
  a5100a: () => a5100a,
  a5100b: () => a5100b,
  a5100c: () => a5100c,
  a5100d: () => a5100d,
  a51010: () => a51010,
  a51011: () => a51011,
  a51012: () => a51012,
  a51013: () => a51013,
  a51014: () => a51014,
  a51015: () => a51015,
  a51016: () => a51016,
  a51017: () => a51017,
  a51018: () => a51018,
  a51019: () => a51019,
  a5101a: () => a5101a,
  a5101b: () => a5101b,
  a5101c: () => a5101c,
  a5101d: () => a5101d,
  a5101e: () => a5101e,
  a5101f: () => a5101f,
  a51020: () => a51020,
  a51021: () => a51021,
  a51022: () => a51022,
  a51023: () => a51023,
  a51101: () => a51101,
  a51102: () => a51102,
  a51103: () => a51103,
  a51104: () => a51104,
  a51105: () => a51105,
  a51200: () => a51200,
  a51201: () => a51201,
  a51202: () => a51202,
  a51203: () => a51203,
  a51204: () => a51204,
  a51205: () => a51205,
  a51210: () => a51210,
  a51301: () => a51301,
  a51302: () => a51302,
  a51303: () => a51303,
  a51304: () => a51304,
  a51305: () => a51305,
  a51306: () => a51306,
  a51307: () => a51307,
  a51308: () => a51308,
  a51310: () => a51310,
  a51401: () => a51401,
  a51402: () => a51402,
  a51403: () => a51403,
  a51404: () => a51404,
  a51405: () => a51405,
  a51406: () => a51406,
  a5140a: () => a5140a,
  a52001: () => a52001,
  a52002: () => a52002,
  a52003: () => a52003,
  a52004: () => a52004,
  a52010: () => a52010,
  a52011: () => a52011,
  a52012: () => a52012,
  a53001: () => a53001,
  a53002: () => a53002,
  a53003: () => a53003,
  a53004: () => a53004,
  a53005: () => a53005,
  a53701: () => a53701,
  a53808: () => a53808,
  a53809: () => a53809,
  a53f00: () => a53f00,
  a53f7f: () => a53f7f,
  d20001: () => d20001,
  d20100: () => d20100,
  d20101: () => d20101,
  d20102: () => d20102,
  d20103: () => d20103,
  d20104: () => d20104,
  d20105: () => d20105,
  d20106: () => d20106,
  d20107: () => d20107,
  d20108: () => d20108,
  d20109: () => d20109,
  d2010a: () => d2010a,
  d2010b: () => d2010b,
  d2010c: () => d2010c,
  d2010d: () => d2010d,
  d2010e: () => d2010e,
  d2010f: () => d2010f,
  d20110: () => d20110,
  d20111: () => d20111,
  d20112: () => d20112,
  d20200: () => d20200,
  d20201: () => d20201,
  d20202: () => d20202,
  d20300: () => d20300,
  d20310: () => d20310,
  d20320: () => d20320,
  d20400: () => d20400,
  d20401: () => d20401,
  d20402: () => d20402,
  d20403: () => d20403,
  d20404: () => d20404,
  d20405: () => d20405,
  d20406: () => d20406,
  d20407: () => d20407,
  d20408: () => d20408,
  d20409: () => d20409,
  d20410: () => d20410,
  d2041a: () => d2041a,
  d2041b: () => d2041b,
  d2041c: () => d2041c,
  d2041d: () => d2041d,
  d2041e: () => d2041e,
  d20500: () => d20500,
  d20601: () => d20601,
  d21000: () => d21000,
  d21001: () => d21001,
  d21002: () => d21002,
  d21101: () => d21101,
  d21102: () => d21102,
  d21103: () => d21103,
  d21104: () => d21104,
  d21105: () => d21105,
  d21106: () => d21106,
  d21107: () => d21107,
  d21108: () => d21108,
  d21430: () => d21430,
  d21440: () => d21440,
  d22000: () => d22000,
  d22001: () => d22001,
  d22002: () => d22002,
  d23000: () => d23000,
  d23001: () => d23001,
  d23002: () => d23002,
  d23003: () => d23003,
  d23004: () => d23004,
  d23005: () => d23005,
  d23006: () => d23006,
  d23100: () => d23100,
  d23101: () => d23101,
  d23200: () => d23200,
  d23201: () => d23201,
  d23202: () => d23202,
  d24000: () => d24000,
  d24001: () => d24001,
  d25000: () => d25000,
  d25001: () => d25001,
  d2a001: () => d2a001,
  d50001: () => d50001,
  f60101: () => f60101,
  f60201: () => f60201,
  f60202: () => f60202,
  f60203: () => f60203,
  f60204: () => f60204,
  f60301: () => f60301,
  f60302: () => f60302,
  f60401: () => f60401,
  f60402: () => f60402,
  f60501: () => f60501,
  f61000: () => f61000,
  f61001: () => f61001
});

// ../eep-transcoder/eep/a5-02-01.js
var a50201 = {
  number: "0x01",
  title: "Temperature Sensor Range -40\xB0C to 0\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -40...0\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "-40",
        max: "0"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 13,
  eep: "a5-02-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-02.js
var a50202 = {
  number: "0x02",
  title: "Temperature Sensor Range -30\xB0C to +10\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -30... +10\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "-30",
        max: "+10"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 14,
  eep: "a5-02-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-03.js
var a50203 = {
  number: "0x03",
  title: "Temperature Sensor Range -20\xB0C to +20\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -20... +20\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "-20",
        max: "+20"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 15,
  eep: "a5-02-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-04.js
var a50204 = {
  number: "0x04",
  title: "Temperature Sensor Range -10\xB0C to +30\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -10... +30\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "-10",
        max: "+30"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 16,
  eep: "a5-02-04",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-05.js
var a50205 = {
  number: "0x05",
  title: "Temperature Sensor Range 0\xB0C to +40\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) 0... +40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 17,
  eep: "a5-02-05",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-06.js
var a50206 = {
  number: "0x06",
  title: "Temperature Sensor Range +10\xB0C to +50\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) 10... +50\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+10",
        max: "+50"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 18,
  eep: "a5-02-06",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-07.js
var a50207 = {
  number: "0x07",
  title: "Temperature Sensor Range +20\xB0C to +60\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) 20... +60\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+20",
        max: "+60"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 19,
  eep: "a5-02-07",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-08.js
var a50208 = {
  number: "0x08",
  title: "Temperature Sensor Range +30\xB0C to +70\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) 20... +60\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+30",
        max: "+70"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 20,
  eep: "a5-02-08",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-09.js
var a50209 = {
  number: "0x09",
  title: "Temperature Sensor Range +40\xB0C to +80\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) 40... +80\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+40",
        max: "+80"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 21,
  eep: "a5-02-09",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-0a.js
var a5020a = {
  number: "0x0A",
  title: "Temperature Sensor Range +50\xB0C to +90\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) 50... +90\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+50",
        max: "+90"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 22,
  eep: "a5-02-0a",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-0b.js
var a5020b = {
  number: "0x0B",
  title: "Temperature Sensor Range +60\xB0C to +100\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) 60... +100\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+60",
        max: "+100"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 23,
  eep: "a5-02-0b",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-10.js
var a50210 = {
  number: "0x10",
  title: "Temperature Sensor Range -60\xB0C to +20\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -60... +20\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "-60",
        max: "+20"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 24,
  eep: "a5-02-10",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-11.js
var a50211 = {
  number: "0x11",
  title: "Temperature Sensor Range -50\xB0C to +30\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "16"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -50... +30\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "-50",
        max: "+30"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 25,
  eep: "a5-02-11",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-12.js
var a50212 = {
  number: "0x12",
  title: "Temperature Sensor Range -40\xB0C to +40\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "16"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -40... +40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "-40",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 26,
  eep: "a5-02-12",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-13.js
var a50213 = {
  number: "0x13",
  title: "Temperature Sensor Range -30\xB0C to +50\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "16"
    }, {
      reserved: {},
      description: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      description: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -30... +50\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "-30",
        max: "+50"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 27,
  eep: "a5-02-13",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-14.js
var a50214 = {
  number: "0x14",
  title: "Temperature Sensor Range -20\xB0C to +60\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -20... +60\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "-20",
        max: "+60"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 28,
  eep: "a5-02-14",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-15.js
var a50215 = {
  number: "0x15",
  title: "Temperature Sensor Range -10\xB0C to +70\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -10... +70\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "-10",
        max: "+70"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 29,
  eep: "a5-02-15",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-16.js
var a50216 = {
  number: "0x16",
  title: "Temperature Sensor Range 0\xB0C to +80\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) 0... +80\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+80"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 30,
  eep: "a5-02-16",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-17.js
var a50217 = {
  number: "0x17",
  title: "Temperature Sensor Range +10\xB0C to +90\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) +10\xB0... +90\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+10",
        max: "+90"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 31,
  eep: "a5-02-17",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-18.js
var a50218 = {
  number: "0x18",
  title: "Temperature Sensor Range +20\xB0C to +100\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) +20\xB0... +100\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+20",
        max: "+100"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 32,
  eep: "a5-02-18",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-19.js
var a50219 = {
  number: "0x19",
  title: "Temperature Sensor Range +30\xB0C to +110\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) +30\xB0... +110\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+30",
        max: "+110"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 33,
  eep: "a5-02-19",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-1a.js
var a5021a = {
  number: "0x1A",
  title: "Temperature Sensor Range +40\xB0C to +120\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) +40\xB0... +120\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+40",
        max: "+120"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 34,
  eep: "a5-02-1a",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-1b.js
var a5021b = {
  number: "0x1B",
  title: "Temperature Sensor Range +50\xB0C to +130\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "16",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) +50\xB0... +130\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "+50",
        max: "+130"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 35,
  eep: "a5-02-1b",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-20.js
var a50220 = {
  number: "0x20",
  title: "10 Bit Temperature Sensor Range -10\xB0C to +41.2\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "14",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1+DB_2.0-1 Temperature (10 bit) -10...+41.2\xB0C, linear n=1023...0",
      bitoffs: "14",
      bitsize: "10",
      range: {
        min: "1023",
        max: "0"
      },
      scale: {
        min: "-10",
        max: "+41.2"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 36,
  eep: "a5-02-20",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-02-30.js
var a50230 = {
  number: "0x30",
  title: "10 Bit Temperature Sensor Range -40\xB0C to +62.3\xB0C",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "14",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "4",
      scale: ""
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "29",
      bitsize: "3",
      scale: ""
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1+DB_2.0-1 Temperature (10 bit) -40...+62.3\xB0C, linear n=1023...0",
      bitoffs: "14",
      bitsize: "10",
      range: {
        min: "1023",
        max: "0"
      },
      scale: {
        min: "-40",
        max: "+62.3"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 37,
  eep: "a5-02-30",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-04-01.js
var a50401 = {
  number: "0x01",
  title: "Range 0\xB0C to +40\xB0C and 0% to 100%",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "31",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: "DB_2: Rel. Humidity 0...100%, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) 0...40\xB0C, linear n=0...250",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "T-Sensor",
      shortcut: "TSN",
      description: "Availability of the Temperature Sensor",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not available"
        }, {
          value: "1",
          description: "available"
        }]
      }
    }]
  }],
  originalIndex: 38,
  eep: "a5-04-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature and Humidity Sensor",
  func_number: "0x04",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-04-02.js
var a50402 = {
  number: "0x02",
  title: "Range -20\xB0C to +60\xB0C and 0% to 100%",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "31",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: "DB_2: Rel. Humidity 0...100%, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1 Temperature (8 bit) -20...+60\xB0C, linear n=0...250",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "-20",
        max: "+60"
      },
      unit: "\xB0C"
    }, {
      data: "T-Sensor",
      shortcut: "TSN",
      description: "Availability of the Temperature Sensor",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not available"
        }, {
          value: "1",
          description: "available"
        }]
      }
    }]
  }],
  originalIndex: 39,
  eep: "a5-04-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature and Humidity Sensor",
  func_number: "0x04",
  submitter: [
    "Eltako"
  ]
};

// ../eep-transcoder/eep/a5-04-03.js
var a50403 = {
  number: "0x03",
  title: "Range -20\xB0C to +60\xB0C 10bit-measurement and 0% to 100%",
  status: "released",
  description: '<span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: 20 seconds \u2013 1 hour (one time configuration)\n            <br/>Trigger event: threshold/delta for observed value, heartbeat\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: -\n            <br/>Security level format: -',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "6"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: "DB_3: Rel. Humidity 0...100%, linear n=0...250",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "Temperature (10 bit) -20...60\xB0C, linear n=0...1023",
      bitoffs: "14",
      bitsize: "10",
      range: {
        min: "0",
        max: "1023"
      },
      scale: {
        min: "-20",
        max: "+60"
      },
      unit: "\xB0C"
    }, {
      data: "Telegram Type",
      shortcut: "TTP",
      description: "Telegram Type",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Heartbeat"
        }, {
          value: "1",
          description: "Event triggered"
        }]
      }
    }]
  }],
  originalIndex: 40,
  eep: "a5-04-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature and Humidity Sensor",
  func_number: "0x04",
  submitter: [
    "ITEC"
  ]
};

// ../eep-transcoder/eep/a5-05-01.js
var a50501 = {
  number: "0x01",
  title: "Range 500 to 1150 hPa",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: 20 seconds \u2013 1 hour (one time configuration)\n            <br/>Trigger event: threshold/delta for observed value, heartbeat\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: -\n            <br/>Security level format: -',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "6"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "12"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Barometer",
      shortcut: "BAR",
      description: "Barometer (linear)",
      info: "Barometer 500...1150 hPa, linear n=0...1023",
      bitoffs: "6",
      bitsize: "10",
      range: {
        min: "0",
        max: "1023"
      },
      scale: {
        min: "500",
        max: "1150"
      },
      unit: "hPa"
    }, {
      data: "Telegram Type",
      shortcut: "TTP",
      description: "Telegram Type",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Heartbeat"
        }, {
          value: "1",
          description: "Event triggered"
        }]
      }
    }]
  }],
  originalIndex: 41,
  eep: "a5-05-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Barometric Sensor",
  func_number: "0x05",
  submitter: [
    "ITEC"
  ]
};

// ../eep-transcoder/eep/a5-06-01.js
var a50601 = {
  number: "0x01",
  title: "Range 300lx to 60.000lx",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage (linear)",
      info: "DB_3: Supply voltage 0\u20265.1V, linear n=0\u2026255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "5.1"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL2",
      description: "Illumination (linear)",
      info: "DB_2: Illumination 300\u202630.000 lx, linear n=0\u2026255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "300",
        max: "30000"
      },
      unit: "lx"
    }, {
      data: "Illumination",
      shortcut: "ILL1",
      description: "Illumination (linear)",
      info: "DB_1: Illumination 600\u202660.000 lx, linear n=0\u2026255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "600",
        max: "60000"
      },
      unit: "lx"
    }, {
      data: "Range select",
      shortcut: "RS",
      description: "Range",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Range acc. to DB_1 (ILL1)"
        }, {
          value: "1",
          description: "Range acc. to DB_2 (ILL2)"
        }]
      }
    }]
  }],
  originalIndex: 42,
  eep: "a5-06-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Light Sensor",
  func_number: "0x06",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-06-02.js
var a50602 = {
  number: "0x02",
  title: "Range 0lx to 1.020lx",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage (linear)",
      info: "DB_3: Supply voltage 0\u20265.1V, linear n=0\u2026255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "5.1"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL2",
      description: "Illumination (linear)",
      info: "DB_2: Illumination 0\u2026510 lx, linear n=0\u2026255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "510"
      },
      unit: "lx"
    }, {
      data: "Illumination",
      shortcut: "ILL1",
      description: "Illumination (linear)",
      info: "DB_1: Illumination 0\u20261.024 lx, linear n=0\u2026255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "1020"
      },
      unit: "lx"
    }, {
      data: "Range select",
      shortcut: "RS",
      description: "Range",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Range acc. to DB_1 (ILL1)"
        }, {
          value: "1",
          description: "Range acc. to DB_2 (ILL2)"
        }]
      }
    }]
  }],
  originalIndex: 43,
  eep: "a5-06-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Light Sensor",
  func_number: "0x06",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-06-03.js
var a50603 = {
  number: "0x03",
  title: "10-bit measurement (1-Lux resolution) with range 0lx to 1000lx",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "18",
      bitsize: "10"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage (linear)",
      info: "DB_3: Supply voltage 0\u20265.1V, linear n=0\u2026255 <br/> 251\u2026255: reserved for error code",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear)",
      info: "DB2 = 8 MSB, DB1 = 2 LSB <br/> 1001: over range, 1002...1024: reserved",
      bitoffs: "8",
      bitsize: "10",
      range: {
        min: "0",
        max: "1000"
      },
      scale: {
        min: "0",
        max: "1000"
      },
      unit: "lx"
    }]
  }],
  originalIndex: 44,
  eep: "a5-06-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Light Sensor",
  func_number: "0x06",
  submitter: [
    "Lutuo Technology"
  ]
};

// ../eep-transcoder/eep/a5-06-04.js
var a50604 = {
  number: "0x04",
  title: "Curtain Wall Brightness Sensor",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>This EEP is intended for use with wireless daylight sensors, who\n            communicate exterior light levels back to a blind controller.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: time-triggered and upon lux sensor reading\n            change of more than a few percent\n            <br/>Communication interval: A telegram is transmitted every 1 minute\n            in \u201Cday mode\u201D and every 1 hour in \u201Cnight mode\u201D. If the measured light\n            is below a certain threshold for several minutes the sensor goes to\n            night mode.\n            <br/>Trigger event: Heartbeat, change of lux reading\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TEMP",
      description: "Ambient Temperature",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "-20",
        max: "+60"
      },
      unit: "\xB0C"
    }, {
      data: "Illuminance",
      shortcut: "ILL",
      description: "Illuminance (linear)",
      bitoffs: "8",
      bitsize: "16",
      range: {
        min: "0",
        max: "65535"
      },
      scale: {
        min: "0",
        max: "65535"
      },
      unit: "lx"
    }, {
      data: "Energy Storage",
      shortcut: "SV",
      description: "Energy Storage",
      bitoffs: "24",
      bitsize: "4",
      range: {
        min: "0",
        max: "15"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature Availability",
      shortcut: "TMPAV",
      description: "Valid temperature data available on DB3",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Temperature data is unavailable"
        }, {
          value: "1",
          description: "Temperature data is available"
        }]
      }
    }, {
      data: "Energy Storage Availability",
      shortcut: "ENAV",
      description: "Valid energy storage data available on DB0",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Energy storage data is unavailable"
        }, {
          value: "1",
          description: "Energy storage data is available"
        }]
      }
    }]
  }],
  originalIndex: 45,
  eep: "a5-06-04",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Light Sensor",
  func_number: "0x06",
  submitter: [
    "Echoflex Solutions"
  ]
};

// ../eep-transcoder/eep/a5-06-05.js
var a50605 = {
  number: "0x05",
  title: "Range 0lx to 10.200lx",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: 20 seconds \u2013 1 hour (one time configuration)\n            <br/>Trigger event: threshold/delta for observed value, heartbeat\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage (linear)",
      info: "DB_3: Supply voltage 0\u20265.1V, linear n=0\u2026255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "5.1"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL2",
      description: "Illumination (linear)",
      info: "DB_2: Illumination 0\u20265100 lx, linear n=0\u2026255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "5100"
      },
      unit: "lx"
    }, {
      data: "Illumination",
      shortcut: "ILL1",
      description: "Illumination (linear)",
      info: "DB_1: Illumination 0\u202610.200 lx, linear n=0\u2026255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "10200"
      },
      unit: "lx"
    }, {
      data: "Range select",
      shortcut: "RS",
      description: "Range",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Range acc. to DB_1 (ILL1)"
        }, {
          value: "1",
          description: "Range acc. to DB_2 (ILL2)"
        }]
      }
    }]
  }],
  originalIndex: 46,
  eep: "a5-06-05",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Light Sensor",
  func_number: "0x06",
  submitter: [
    "ITEC"
  ]
};

// ../eep-transcoder/eep/a5-07-01.js
var a50701 = {
  number: "0x01",
  title: "Occupancy with Supply voltage monitor",
  status: "released",
  description: "<br/><br/>\n            The transmission of \u201CPIR off\u201D telegrams is optional.",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage (OPTIONAL)",
      shortcut: "SVC",
      description: "Supply voltage / super cap. (linear);<br/>\n            251 \u2013 255 reserved for error code",
      info: "DB_3: Supply voltage 0\u20265.0V, linear n=0\u2026250",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      data: "PIR Status",
      shortcut: "PIRS",
      description: "PIR Status",
      info: "PIR Status",
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "127",
          description: "PIR off"
        }, {
          min: "128",
          max: "255",
          description: "PIR on"
        }]
      }
    }, {
      data: "Supply voltage availability",
      shortcut: "SVA",
      description: "Supply voltage availability at DB_3",
      info: "Supply voltage availability at DB_3",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Supply voltage is not supported"
        }, {
          value: "1",
          description: "Supply voltage is supported"
        }]
      }
    }]
  }],
  originalIndex: 47,
  eep: "a5-07-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Occupancy Sensor",
  func_number: "0x07",
  submitter: [
    "Lutuo Technology"
  ]
};

// ../eep-transcoder/eep/a5-07-02.js
var a50702 = {
  number: "0x02",
  title: "Occupancy with Supply voltage monitor",
  status: "released",
  description: "<br/><br/>\n  The transmission of \u201CPIR off\u201D telegrams is optional.",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage (REQUIRED)",
      shortcut: "SVC",
      description: "Supply voltage / super cap. (linear);<br/>\n      251 \u2013 255 reserved for error code",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      data: "PIR Status",
      shortcut: "PIRS",
      description: "PIR Status",
      info: "PIR Status",
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Uncertain of occupancy status"
        }, {
          value: "1",
          description: "Motion detected"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "16"
    }, {
      reserved: {},
      bitoffs: "25",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }]
  }],
  originalIndex: 48,
  eep: "a5-07-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Occupancy Sensor",
  func_number: "0x07",
  submitter: [
    "Lutuo Technology"
  ]
};

// ../eep-transcoder/eep/a5-07-03.js
var a50703 = {
  number: "0x03",
  title: "Occupancy with Supply voltage monitor and 10-bit illumination measurement",
  status: "released",
  description: "<br/><br/>\n  The transmission of \u201CPIR off\u201D telegrams is optional.",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage (REQUIRED)",
      shortcut: "SVC",
      description: "Supply voltage (linear);\n        <br/>251 \u2013 255 reserved for error code",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear);\n        <br/>DB2 = 8 MSB, DB1 = 2 LSB <br/>1001: over range, <br/>1002...1024: reserved",
      info: {},
      bitoffs: "8",
      bitsize: "10",
      range: {
        min: "0",
        max: "1000"
      },
      scale: {
        min: "0",
        max: "1000"
      },
      unit: "lx"
    }, {
      data: "PIR Status",
      shortcut: "PIRS",
      description: "PIR Status",
      info: "PIR Status",
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Motion detected"
        }, {
          value: "0",
          description: "Uncertain of occupancy status"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "25",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "18",
      bitsize: "6"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }]
  }],
  originalIndex: 49,
  eep: "a5-07-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Occupancy Sensor",
  func_number: "0x07",
  submitter: [
    "Lutuo Technology"
  ]
};

// ../eep-transcoder/eep/a5-08-01.js
var a50801 = {
  number: "0x01",
  title: "Range 0lx to 510lx, 0\xB0C to +51\xB0C and Occupancy Button",
  status: "released",
  description: "E.g. for ceiling suspended sensor.",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage (linear)",
      info: "DB_3: Supply voltage 0\u20265.1V, linear n=0\u2026255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "5.1"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear)",
      info: "DB_2: Illumination 0...510lx, linear n=0...255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "510"
      },
      unit: "lx"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...51\xB0C, linear n=0...255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+51"
      },
      unit: "\xB0C"
    }, {
      data: "PIR Status",
      shortcut: "PIRS",
      description: "PIR Status",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "PIR on"
        }, {
          value: "1",
          description: "PIR off"
        }]
      }
    }, {
      data: "Occupancy Button",
      shortcut: "OCC",
      description: "...",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }]
  }],
  originalIndex: 50,
  eep: "a5-08-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Light, Temperature and Occupancy Sensor",
  func_number: "0x08",
  submitter: []
};

// ../eep-transcoder/eep/a5-08-02.js
var a50802 = {
  number: "0x02",
  title: "Range 0lx to 1020lx, 0\xB0C to +51\xB0C and Occupancy Button",
  status: "released",
  description: "E.g. for wall mounted sensor.",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage (linear)",
      info: "DB_3: Supply voltage 0\u20265.1V, linear n=\u2026255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "5.1"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear)",
      info: "DB_2: Illumination 0...1020lx, linear n=0...255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "1020"
      },
      unit: "lx"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...51\xB0C, linear n=0...255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+51"
      },
      unit: "\xB0C"
    }, {
      data: "PIR Status",
      shortcut: "PIRS",
      description: "PIR Status",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "PIR on"
        }, {
          value: "1",
          description: "PIR off"
        }]
      }
    }, {
      data: "Occupancy Button",
      shortcut: "OCC",
      description: "...",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }]
  }],
  originalIndex: 51,
  eep: "a5-08-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Light, Temperature and Occupancy Sensor",
  func_number: "0x08",
  submitter: []
};

// ../eep-transcoder/eep/a5-08-03.js
var a50803 = {
  number: "0x03",
  title: "Range 0lx to 1530lx, -30\xB0C to +50\xB0C and Occupancy Button",
  status: "released",
  description: "E.g. for outdoor sensor.",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage (linear)",
      info: "DB_3: Supply voltage 0\u20265.1V, linear n=0\u2026255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "5.1"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear)",
      info: "DB_2: Illumination 0...1530lx, linear n=0...255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "1530"
      },
      unit: "lx"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: -30...50\xB0C, linear n=0...255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "-30",
        max: "+50"
      },
      unit: "\xB0C"
    }, {
      data: "PIR Status",
      shortcut: "PIRS",
      description: "PIR Status",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "PIR on"
        }, {
          value: "1",
          description: "PIR off"
        }]
      }
    }, {
      data: "Occupancy Button",
      shortcut: "OCC",
      description: "..",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }]
  }],
  originalIndex: 52,
  eep: "a5-08-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Light, Temperature and Occupancy Sensor",
  func_number: "0x08",
  submitter: []
};

// ../eep-transcoder/eep/a5-09-02.js
var a50902 = {
  number: "0x02",
  title: "CO-Sensor 0 ppm to 1020 ppm",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "31",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage (linear)",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "5.1"
      },
      unit: "V"
    }, {
      data: "Concentration",
      shortcut: "Conc",
      description: "Gas concentration",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "1020"
      },
      unit: "ppm"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+51"
      },
      unit: "\xB0C"
    }, {
      data: "T-Sensor",
      shortcut: "TSN",
      description: "..",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Temperature Sensor not available"
        }, {
          value: "1",
          description: "Temperature Sensor available"
        }]
      }
    }]
  }],
  originalIndex: 53,
  eep: "a5-09-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Gas Sensor",
  func_number: "0x09",
  submitter: [
    "Unitronic AG"
  ]
};

// ../eep-transcoder/eep/a5-09-04.js
var a50904 = {
  number: "0x04",
  title: "CO2 Sensor",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "31",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear), 0.5 % = 1 bit",
      info: "DB_3: Humidity 0\u2026100%, linear n=0\u2026200 (0,5 % = 1 bit)",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "200"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Concentration",
      shortcut: "Conc",
      description: "Concentration (linear), increment = 10 ppm",
      info: "DB_2: Concentration 0\u20262550 ppm, linear n=0\u2026255 (increment = 10 ppm)",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "2550"
      },
      unit: "ppm"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear), increment = 0.2 \xB0C",
      info: "DB_1: Temperature 0\u202651.0 \xB0C, linear n=0\u2026255 (increment = 0.2\xB0C)",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+51.0"
      },
      unit: "\xB0C"
    }, {
      data: "H-Sensor",
      shortcut: "HSN",
      description: "..",
      info: {},
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Humidity Sensor not available"
        }, {
          value: "1",
          description: "Humidity Sensor available"
        }]
      }
    }, {
      data: "T-Sensor",
      shortcut: "TSN",
      description: "..",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Temperature Sensor not available"
        }, {
          value: "1",
          description: "Temperature Sensor available"
        }]
      }
    }]
  }],
  originalIndex: 54,
  eep: "a5-09-04",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Gas Sensor",
  func_number: "0x09",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-09-05.js
var a50905 = {
  number: "0x05",
  title: "VOC Sensor",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      data: "VOC",
      shortcut: "Conc",
      description: "VOC Concentration",
      info: {},
      bitoffs: "0",
      bitsize: "16",
      range: {
        min: "0",
        max: "65535"
      },
      scale: {
        min: "0",
        max: "65535"
      },
      unit: "ppb"
    }, {
      data: "VOC ID",
      shortcut: "VOC_ID",
      description: "VOC identification",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: [{
          value: "0",
          description: "VOCT (total)"
        }, {
          value: "1",
          description: "Formaldehyde"
        }, {
          value: "2",
          description: "Benzene"
        }, {
          value: "3",
          description: "Styrene"
        }, {
          value: "4",
          description: "Toluene"
        }, {
          value: "5",
          description: "Tetrachloroethylene"
        }, {
          value: "6",
          description: "Xylene"
        }, {
          value: "7",
          description: "n-Hexane"
        }, {
          value: "8",
          description: "n-Octane"
        }, {
          value: "9",
          description: "Cyclopentane"
        }, {
          value: "10",
          description: "Methanol"
        }, {
          value: "11",
          description: "Ethanol"
        }, {
          value: "12",
          description: "1-Pentanol"
        }, {
          value: "13",
          description: "Acetone"
        }, {
          value: "14",
          description: "ethylene Oxide"
        }, {
          value: "15",
          description: "Acetaldehyde ue"
        }, {
          value: "16",
          description: "Acetic Acid"
        }, {
          value: "17",
          description: "Propionice Acid"
        }, {
          value: "18",
          description: "Valeric Acid"
        }, {
          value: "19",
          description: "Butyric Acid"
        }, {
          value: "20",
          description: "Ammoniac"
        }, {
          value: "22",
          description: "Hydrogen Sulfide"
        }, {
          value: "23",
          description: "Dimethylsulfide"
        }, {
          value: "24",
          description: "2-Butanol (butyl Alcohol)"
        }, {
          value: "25",
          description: "2-Methylpropanol"
        }, {
          value: "26",
          description: "Diethyl ether"
        }, {
          value: "255",
          description: "ozone"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "Scale Multiplier",
      shortcut: "SCM",
      description: "Scale Multiplier",
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "0.01"
        }, {
          value: "1",
          description: "0.1"
        }, {
          value: "2",
          description: "1"
        }, {
          value: "3",
          description: "10"
        }]
      }
    }]
  }],
  originalIndex: 55,
  eep: "a5-09-05",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Gas Sensor",
  func_number: "0x09",
  submitter: [
    "NanoSense"
  ]
};

// ../eep-transcoder/eep/a5-09-06.js
var a50906 = {
  number: "0x06",
  title: "Radon",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      data: "Radon",
      shortcut: "Act",
      description: "Radon activity (regulation is an average of 100 Bq/m3/24h)",
      info: {},
      bitoffs: "0",
      bitsize: "10",
      range: {
        min: "0",
        max: "1023"
      },
      scale: {
        min: "0",
        max: "1023"
      },
      unit: "Bq/m3"
    }, {
      reserved: {},
      bitoffs: "10",
      bitsize: "18"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }]
  }],
  originalIndex: 56,
  eep: "a5-09-06",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Gas Sensor",
  func_number: "0x09",
  submitter: [
    "NanoSense"
  ]
};

// ../eep-transcoder/eep/a5-09-07.js
var a50907 = {
  number: "0x07",
  title: "Particles",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      data: "Particles_10",
      shortcut: "PM10",
      description: "Dust less than 10 \xB5m (PM10)",
      info: {},
      bitoffs: "0",
      bitsize: "9",
      range: {
        min: "0",
        max: "511"
      },
      scale: {
        min: "0",
        max: "511"
      },
      unit: "\xB5g/m3"
    }, {
      data: "Particles_2.5",
      shortcut: "PM2.5",
      description: "Dust less than 2.5 \xB5m (PM2.5)",
      info: {},
      bitoffs: "9",
      bitsize: "9",
      range: {
        min: "0",
        max: "511"
      },
      scale: {
        min: "0",
        max: "511"
      },
      unit: "\xB5g/m3"
    }, {
      data: "Particles_1",
      shortcut: "PM1",
      description: "Dust less than 1 \xB5m (PM1)",
      info: {},
      bitoffs: "18",
      bitsize: "9",
      range: {
        min: "0",
        max: "511"
      },
      scale: {
        min: "0",
        max: "511"
      },
      unit: "\xB5g/m3"
    }, {
      reserved: {},
      bitoffs: "27",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "PM10 active",
      shortcut: "PM10a",
      description: {},
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "PM10 not active"
        }, {
          value: "1",
          description: "PM10 active"
        }]
      }
    }, {
      data: "PM2.5 active",
      shortcut: "PM2.5a",
      description: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "PM2.5 not active"
        }, {
          value: "1",
          description: "PM2.5 active"
        }]
      }
    }, {
      data: "PM1 active",
      shortcut: "PM1a",
      description: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "PM1 not active"
        }, {
          value: "1",
          description: "PM1 active"
        }]
      }
    }]
  }],
  originalIndex: 57,
  eep: "a5-09-07",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Gas Sensor",
  func_number: "0x09",
  submitter: [
    "NanoSense"
  ]
};

// ../eep-transcoder/eep/a5-09-08.js
var a50908 = {
  number: "0x08",
  title: "Pure CO2 Sensor",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>Pure CO2 sensor with 8 bit resolution and 0 \u2013 2000ppm.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Trigger event: change of value over threshold, heartbeat\n            <br/>Teach-in method: 4BS teach-in 2',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "16"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "CO2",
      shortcut: "CO2",
      description: "CO2 measurement",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "2000"
      },
      unit: "ppm"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }]
  }],
  originalIndex: 58,
  eep: "a5-09-08",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Gas Sensor",
  func_number: "0x09",
  submitter: [
    "Afriso",
    "EnOcean"
  ]
};

// ../eep-transcoder/eep/a5-09-09.js
var a50909 = {
  number: "0x09",
  title: "Pure CO2 Sensor with Power Failure Detection",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>Pure CO2 sensor with 8 bit resolution and 0 \u2013 2000ppm.\n            <br/>1 digital Input \u2013 Power failure detection.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Trigger event: change of value over threshold, heartbeat, change of digital Input\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Remark</span>\n            <br/>Power failure detection expresses that the device was cut from power\n            source (unplugged / general power failure) and the device will probably\n            stop functioning very soon. In this case the measured value CO2 is\n            the last valid value.',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "16"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "30",
      bitsize: "2"
    }, {
      data: "CO2",
      shortcut: "CO2",
      description: "CO2 measurement",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "2000"
      },
      unit: "ppm"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Power Failure detection",
      shortcut: "PFD",
      description: "Indicates if power supply has a failure / is not available",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Power failure not detected"
        }, {
          value: "1",
          description: "Power failure detected"
        }]
      }
    }]
  }],
  originalIndex: 59,
  eep: "a5-09-09",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Gas Sensor",
  func_number: "0x09",
  submitter: [
    "Afriso",
    "EnOcean"
  ]
};

// ../eep-transcoder/eep/a5-09-0a.js
var a5090a = {
  number: "0x0A",
  title: "Hydrogen Gas Sensor",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>\n            Hydrogen Gas Sensor with 16 bit resolution and 0-2000 ppm\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: -\n            <br/>Trigger event: change in gas concentration and temp\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: yes\n            <br/>Security level format: PSK, RLC, AES128',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "Concentration",
      shortcut: "Conc",
      description: "Gas concentration",
      info: {},
      bitoffs: "0",
      bitsize: "16",
      range: {
        min: "0",
        max: "65535"
      },
      scale: {
        min: "0",
        max: "65535"
      },
      unit: "ppm"
    }, {
      data: "Temperature",
      shortcut: "TEMP",
      description: "Temperature (linear)",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "-20",
        max: "+60"
      },
      unit: "\xB0C"
    }, {
      data: "Supply voltage",
      shortcut: "SV",
      description: "Supply voltage / super cap.",
      info: {},
      bitoffs: "24",
      bitsize: "4",
      range: {
        min: "0",
        max: "15"
      },
      scale: {
        min: "2.0",
        max: "5.0"
      },
      unit: "V"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temp sensor availability",
      shortcut: "TSA",
      description: "Temp sensor availability at TMP",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Temp sensor is not supported"
        }, {
          value: "1",
          description: "Temp sensor is supported"
        }]
      }
    }, {
      data: "Supply voltage availability",
      shortcut: "SVA",
      description: "Supply voltage availability at SV",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Supply voltage is not supported"
        }, {
          value: "1",
          description: "Supply voltage is supported"
        }]
      }
    }]
  }],
  originalIndex: 60,
  eep: "a5-09-0a",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Gas Sensor",
  func_number: "0x09",
  submitter: [
    "SiMICS"
  ]
};

// ../eep-transcoder/eep/a5-09-0b.js
var a5090b = {
  number: "0x0B",
  title: "Radioactivity Sensor",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>Radioactivity Sensor\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: -\n            <br/>Trigger event: change in radioactivity level\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: yes\n            <br/>Security level format: PSK, RLC, AES128',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "4",
      bitsize: "4"
    }, {
      data: "Supply voltage",
      shortcut: "SV",
      description: "Supply voltage / super cap.",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      range: {
        min: "0",
        max: "15"
      },
      scale: {
        min: "2.0",
        max: "5.0"
      },
      unit: "V"
    }, {
      data: "Radioactivity",
      shortcut: "Ract",
      description: "Radiation level",
      info: {},
      bitoffs: "8",
      bitsize: "16",
      range: {
        min: "0",
        max: "65535"
      },
      scale: {
        min: "0",
        max: "6553"
      },
      unit: "According to"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Scale Multiplier",
      shortcut: "SCM",
      description: "Scale Multiplier",
      bitoffs: "24",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "0.001"
        }, {
          value: "1",
          description: "0.01"
        }, {
          value: "2",
          description: "0.1"
        }, {
          value: "3",
          description: "1"
        }, {
          value: "4",
          description: "10"
        }, {
          value: "5",
          description: "100"
        }, {
          value: "6",
          description: "1000"
        }, {
          value: "7",
          description: "10000"
        }, {
          value: "8",
          description: "100000"
        }]
      }
    }, {
      data: "Value unit",
      shortcut: "VUNIT",
      description: "The unit of the radiation level",
      bitoffs: "29",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "\u03BCSv/h"
        }, {
          value: "1",
          description: "cpm"
        }, {
          value: "2",
          description: "Bq/L"
        }, {
          value: "3",
          description: "Bq/kg"
        }]
      }
    }, {
      data: "Supply voltage availability",
      shortcut: "SVA",
      description: "Supply voltage availability at SV",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Supply voltage is not supported"
        }, {
          value: "1",
          description: "Supply voltage is supported"
        }]
      }
    }]
  }],
  originalIndex: 61,
  eep: "a5-09-0b",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Gas Sensor",
  func_number: "0x09",
  submitter: [
    "SiMICS"
  ]
};

// ../eep-transcoder/eep/a5-10-01.js
var a51001 = {
  number: "0x01",
  title: "Temperature Sensor, Set Point, Fan Speed and Occupancy Control",
  description: "",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Turn-switch for fan speed",
      shortcut: "FAN",
      description: "Turn-switch for fan speed",
      info: "DB_3: Turn-switch for fan speed",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: [{
          min: "210",
          max: "255",
          description: "Stage Auto"
        }, {
          min: "190",
          max: "209",
          description: "Stage 0"
        }, {
          min: "165",
          max: "189",
          description: "Stage 1"
        }, {
          min: "145",
          max: "164",
          description: "Stage 2"
        }, {
          min: "0",
          max: "144",
          description: "Stage 3"
        }]
      }
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (linear)     Min.- ... Max+",
      info: "DB_2: Set point Min. - \u2026 Max. +, linear n=0...255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy button",
      info: "Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Button released"
        }, {
          value: "0",
          description: "Button pressed"
        }]
      }
    }]
  }],
  originalIndex: 62,
  eep: "a5-10-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  submitter: [
    "Kieback + Peter GmbH"
  ]
};

// ../eep-transcoder/eep/a5-10-02.js
var a51002 = {
  number: "0x02",
  title: "Temperature Sensor, Set Point, Fan Speed and Day/Night Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Turn-switch for fan speed",
      shortcut: "FAN",
      description: "Turn-switch for fan speed",
      info: "DB_3: Turn-switch for fan speed",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: [{
          min: "210",
          max: "255",
          description: "Stage Auto"
        }, {
          min: "190",
          max: "209",
          description: "Stage 0"
        }, {
          min: "165",
          max: "189",
          description: "Stage 1"
        }, {
          min: "145",
          max: "164",
          description: "Stage 2"
        }, {
          min: "0",
          max: "144",
          description: "Stage 3"
        }]
      }
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (linear)   Min.- ... Max+",
      info: "DB_2: Set point Min. - \u2026 Max. +, linear n=0...255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Slide switch 0/I",
      shortcut: "SLSW",
      description: "Slide switch or Slide switch Day/Night",
      info: "...",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Position I / Night / Off"
        }, {
          value: "1",
          description: "Position O / Day / On"
        }]
      }
    }]
  }],
  originalIndex: 63,
  eep: "a5-10-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-03.js
var a51003 = {
  number: "0x03",
  title: "Temperature Sensor, Set Point Control",
  status: "released",
  case: [
    {
      datafield: [
        {
          reserved: {},
          bitoffs: "0",
          bitsize: "8"
        },
        {
          reserved: {},
          bitoffs: "24",
          bitsize: "4"
        },
        {
          reserved: {},
          bitoffs: "29",
          bitsize: "3"
        },
        {
          data: "Set point",
          shortcut: "SP",
          description: "Set point (linear)   Min.- ... Max+",
          info: "DB_2: Set point Min. - \u2026 Max. +, linear n=0...255",
          bitoffs: "8",
          bitsize: "8",
          range: {
            min: "0",
            max: "255"
          },
          scale: {
            min: "0",
            max: "255"
          },
          unit: "N/A"
        },
        {
          data: "Temperature",
          shortcut: "TMP",
          description: "Temperature (linear)",
          info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
          bitoffs: "16",
          bitsize: "8",
          range: {
            min: "255",
            max: "0"
          },
          scale: {
            min: "0",
            max: "+40"
          },
          unit: "\xB0C"
        }
      ]
    }
  ],
  originalIndex: 64,
  eep: "a5-10-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-04.js
var a51004 = {
  number: "0x04",
  title: "Temperature Sensor, Set Point and Fan Speed Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Turn-switch for fan speed",
      shortcut: "FAN",
      description: "..",
      info: "DB_3: Turn-switch for fan speed",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: [{
          min: "210",
          max: "255",
          description: "Stage Auto"
        }, {
          min: "190",
          max: "209",
          description: "Stage 0"
        }, {
          min: "165",
          max: "189",
          description: "Stage 1"
        }, {
          min: "145",
          max: "164",
          description: "Stage 2"
        }, {
          min: "0",
          max: "144",
          description: "Stage 3"
        }]
      }
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (linear)   Min.- ... Max+",
      info: "DB_2: Set point Min. - \u2026 Max. +, linear n=0...255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 65,
  eep: "a5-10-04",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-05.js
var a51005 = {
  number: "0x05",
  title: "Temperature Sensor, Set Point and Occupancy Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (linear)   Min.- ... Max+",
      info: "DB_2: Set point Min. - \u2026 Max. +, linear n=0...255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy button",
      info: "Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Button released"
        }, {
          value: "0",
          description: "Button pressed"
        }]
      }
    }]
  }],
  originalIndex: 66,
  eep: "a5-10-05",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-06.js
var a51006 = {
  number: "0x06",
  title: "Temperature Sensor, Set Point and Day/Night Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (linear)   Min.- ... Max+",
      info: "DB_2: Set point Min. - \u2026 Max. +, linear n=0...255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Slide switch 0/I",
      shortcut: "SLSW",
      description: "Slide switch or Slide switch Day/Night",
      info: "...",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Position I / Night / Off"
        }, {
          value: "1",
          description: "Position O / Day / On"
        }]
      }
    }]
  }],
  originalIndex: 67,
  eep: "a5-10-06",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-07.js
var a51007 = {
  number: "0x07",
  title: "Temperature Sensor, Fan Speed Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Turn-switch for fan speed",
      shortcut: "FAN",
      description: "..",
      info: "DB_3: Turn-switch for fan speed",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: [{
          min: "210",
          max: "255",
          description: "Stage Auto"
        }, {
          min: "190",
          max: "209",
          description: "Stage 0"
        }, {
          min: "165",
          max: "189",
          description: "Stage 1"
        }, {
          min: "145",
          max: "164",
          description: "Stage 2"
        }, {
          min: "0",
          max: "144",
          description: "Stage 3"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 68,
  eep: "a5-10-07",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-08.js
var a51008 = {
  number: "0x08",
  title: "Temperature Sensor, Fan Speed and Occupancy Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Turn-switch for fan speed",
      shortcut: "FAN",
      description: "..",
      info: "DB_3: Turn-switch for fan speed",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: [{
          min: "210",
          max: "255",
          description: "Stage Auto"
        }, {
          min: "190",
          max: "209",
          description: "Stage 0"
        }, {
          min: "165",
          max: "189",
          description: "Stage 1"
        }, {
          min: "145",
          max: "164",
          description: "Stage 2"
        }, {
          min: "0",
          max: "144",
          description: "Stage 3"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy button",
      info: "Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Button released"
        }, {
          value: "0",
          description: "Button pressed"
        }]
      }
    }]
  }],
  originalIndex: 69,
  eep: "a5-10-08",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-09.js
var a51009 = {
  number: "0x09",
  title: "Temperature Sensor, Fan Speed and Day/Night Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Turn-switch for fan speed",
      shortcut: "FAN",
      description: "..",
      info: "DB_3: Turn-switch for fan speed",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: [{
          min: "210",
          max: "255",
          description: "Stage Auto"
        }, {
          min: "190",
          max: "209",
          description: "Stage 0"
        }, {
          min: "165",
          max: "189",
          description: "Stage 1"
        }, {
          min: "145",
          max: "164",
          description: "Stage 2"
        }, {
          min: "0",
          max: "144",
          description: "Stage 3"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Slide switch 0/I",
      shortcut: "SLSW",
      description: "Slide switch or Slide switch Day/Night",
      info: "...",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Position I / Night / Off"
        }, {
          value: "1",
          description: "Position O / Day / On"
        }]
      }
    }]
  }],
  originalIndex: 70,
  eep: "a5-10-09",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-0a.js
var a5100a = {
  number: "0x0A",
  title: "Temperature Sensor, Set Point Adjust and Single Input Contact",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (linear)   Min.- ... Max+",
      info: "DB_2: Set point Min. - \u2026 Max. +, linear n=0...255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Contact State",
      shortcut: "CTST",
      description: "Contact state",
      info: "Contact state",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "closed"
        }, {
          value: "1",
          description: "open"
        }]
      }
    }]
  }],
  originalIndex: 71,
  eep: "a5-10-0a",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-0b.js
var a5100b = {
  number: "0x0B",
  title: "Temperature Sensor and Single Input Contact",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "16"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Contact State",
      shortcut: "CTST",
      description: "Contact state",
      info: "Contact state",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "closed"
        }, {
          value: "1",
          description: "open"
        }]
      }
    }]
  }],
  originalIndex: 72,
  eep: "a5-10-0b",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-0c.js
var a5100c = {
  number: "0x0C",
  title: "Temperature Sensor and Occupancy Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "16"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy button",
      info: "Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Button released"
        }, {
          value: "0",
          description: "Button pressed"
        }]
      }
    }]
  }],
  originalIndex: 73,
  eep: "a5-10-0c",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-0d.js
var a5100d = {
  number: "0x0D",
  title: "Temperature Sensor and Day/Night Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "16"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Slide switch",
      shortcut: "SLSW",
      description: "Slide switch  0/I or Slide switch Day/Night",
      info: "...",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Position I / Night / Off"
        }, {
          value: "1",
          description: "Position O / Day / On"
        }]
      }
    }]
  }],
  originalIndex: 74,
  eep: "a5-10-0d",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-10.js
var a51010 = {
  number: "0x10",
  title: "Temperature and Humidity Sensor, Set Point and Occupancy Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (linear)   Min.- ... Max+",
      info: "DB_3: Set point Min. - \u2026 Max. +, linear n=0...255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: "DB_2: Rel. Humidity 0...100%, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy button",
      info: "Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Button released"
        }, {
          value: "0",
          description: "Button pressed"
        }]
      }
    }]
  }],
  originalIndex: 75,
  eep: "a5-10-10",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-11.js
var a51011 = {
  number: "0x11",
  title: "Temperature and Humidity Sensor, Set Point and Day/Night Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (linear)   Min.- ... Max+",
      info: "DB_3: Set point Min. - \u2026 Max. +, linear n=0...255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: "DB_2: Rel. Humidity 0...100%, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Slide switch",
      shortcut: "SLSW",
      description: "Slide switch 0/I or Slide switch Day/Night",
      info: "...",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Position I / Night / Off"
        }, {
          value: "1",
          description: "Position O / Day / On"
        }]
      }
    }]
  }],
  originalIndex: 76,
  eep: "a5-10-11",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-12.js
var a51012 = {
  number: "0x12",
  title: "Temperature and Humidity Sensor and Set Point",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (linear)   Min.- ... Max+",
      info: "DB_3: Set point Min. - \u2026 Max. +, linear n=0...255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: "DB_2: Rel. Humidity 0...100%, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 77,
  eep: "a5-10-12",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-13.js
var a51013 = {
  number: "0x13",
  title: "Temperature and Humidity Sensor, Occupancy Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: "DB_2: Rel. Humidity 0...100%, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy button",
      info: "Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Button released"
        }, {
          value: "0",
          description: "Button pressed"
        }]
      }
    }]
  }],
  originalIndex: 78,
  eep: "a5-10-13",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-14.js
var a51014 = {
  number: "0x14",
  title: "Temperature and Humidity Sensor, Day/Night Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: "DB_2: Rel. Humidity 0...100%, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=255...0",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Slide switch",
      shortcut: "SLSW",
      description: "Slide switch 0/I or Slide switch Day/Night",
      info: "...",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Position I / Night / Off"
        }, {
          value: "1",
          description: "Position O / Day / On"
        }]
      }
    }]
  }],
  originalIndex: 79,
  eep: "a5-10-14",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-15.js
var a51015 = {
  number: "0x15",
  title: "10 Bit Temperature Sensor, 6 bit Set Point Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature 10 bit (linear)",
      info: "DB_1.0(LSB) to DB_2.1(MSB) Temperature (10 bit) -10...41.2\xB0C, linear n=1023...0",
      bitoffs: "14",
      bitsize: "10",
      range: {
        min: "1023",
        max: "0"
      },
      scale: {
        min: "-10",
        max: "+41.2"
      },
      unit: "\xB0C"
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (6 bit, linear)   Min.- ... Max+",
      info: "DB_2.2-7 Set point (6 bit) Min. - ? Max. +, linear n=0...63",
      bitoffs: "8",
      bitsize: "6",
      range: {
        min: "0",
        max: "63"
      },
      scale: {
        min: "0",
        max: "63"
      },
      unit: "N/A"
    }]
  }],
  originalIndex: 80,
  eep: "a5-10-15",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-16.js
var a51016 = {
  number: "0x16",
  title: "10 Bit Temperature Sensor, 6 bit Set Point Control;Occupancy Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature 10 bit (linear)",
      info: "DB_1.0(LSB) to DB_2.1(MSB) Temperature (10 bit) -10...41.2\xB0C, linear n=1023...0",
      bitoffs: "14",
      bitsize: "10",
      range: {
        min: "1023",
        max: "0"
      },
      scale: {
        min: "-10",
        max: "+41.2"
      },
      unit: "\xB0C"
    }, {
      data: "Set point",
      shortcut: "SP",
      description: "Set point (linear)   Min.- ... Max+",
      info: "DB_2.2-7 Set point (6 bit) Min. - ? Max. +, linear n=0...63",
      bitoffs: "8",
      bitsize: "6",
      range: {
        min: "0",
        max: "63"
      },
      scale: {
        min: "0",
        max: "63"
      },
      unit: "N/A"
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy button",
      info: "Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Button released"
        }, {
          value: "0",
          description: "Button pressed"
        }]
      }
    }]
  }],
  originalIndex: 81,
  eep: "a5-10-16",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-17.js
var a51017 = {
  number: "0x17",
  title: "10 Bit Temperature Sensor, Occupancy Control",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "14"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature 10 bit (linear)",
      info: "DB_1.0(LSB) to DB_2.1(MSB) Temperature (10 bit) -10...41.2\xB0C, linear n=1023...0",
      bitoffs: "14",
      bitsize: "10",
      range: {
        min: "1023",
        max: "0"
      },
      scale: {
        min: "-10",
        max: "+41.2"
      },
      unit: "\xB0C"
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy button",
      info: "Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Button released"
        }, {
          value: "0",
          description: "Button pressed"
        }]
      }
    }]
  }],
  originalIndex: 82,
  eep: "a5-10-17",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-18.js
var a51018 = {
  number: "0x18",
  title: "Illumination, Temperature Set Point, Temperature Sensor, Fan Speed and Occupancy Control",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      data: "Fan Speed",
      shortcut: "FAN",
      description: "Fan Speed",
      info: "Fan Speed",
      bitoffs: "25",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Speed 0"
        }, {
          value: "2",
          description: "Speed 1"
        }, {
          value: "3",
          description: "Speed 2"
        }, {
          value: "4",
          description: "Speed 3"
        }, {
          value: "5",
          description: "Speed 4"
        }, {
          value: "6",
          description: "Speed 5"
        }, {
          value: "7",
          description: "Off"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear), 251: Over range, 252-255: reserved",
      info: "DB_3: Illumination 0 \u2013 1000 Lux, Linear 0-250,251 - over range, 252-255 reserved",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "1000"
      },
      unit: "lx"
    }, {
      data: "Temp Setpoint",
      shortcut: "TMPSP",
      description: "Temperature Set point (linear)",
      info: "DB_2: Temp Setpoint 0...40\xB0C, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "250",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=0...250",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "250",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Occupancy enable/disable",
      shortcut: "OED",
      description: "Occupancy enable/disable; if occupancy is disabled ignore DB0.0 (occu. button)",
      info: "DB_0.BIT_1: Occ enable/disable",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Occupancy enabled"
        }, {
          value: "1",
          description: "Occupancy disabled"
        }]
      }
    }, {
      data: "Occupancy button",
      shortcut: "OB",
      description: "...",
      info: "DB_0.BIT_0: Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }]
  }],
  originalIndex: 83,
  eep: "a5-10-18",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-19.js
var a51019 = {
  number: "0x19",
  title: "Humidity, Temperature Set Point, Temperature Sensor, Fan Speed and Occupancy Control",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: "DB_3: Rel. Humidity 0...100%, linear n=0...250",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temp Setpoint",
      shortcut: "TMP Sp",
      description: "Temperature Set point (linear)",
      info: "DB_2: Temp Setpoint 0...40\xB0C, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "250",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=0...250",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "250",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Fan speed",
      shortcut: "FAN",
      description: "Fan Speed",
      info: "DB_0.BIT_5_ BIT_4: Fan speed",
      bitoffs: "25",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Speed 0"
        }, {
          value: "2",
          description: "Speed 1"
        }, {
          value: "3",
          description: "Speed 2"
        }, {
          value: "4",
          description: "Speed 3"
        }, {
          value: "5",
          description: "Speed 4"
        }, {
          value: "6",
          description: "Speed 5"
        }, {
          value: "7",
          description: "Off"
        }]
      }
    }, {
      data: "Occupancy enable/disable",
      shortcut: "OED",
      description: {},
      info: "DB_0.BIT_1: Occ enable/disable",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Occupancy enabled"
        }, {
          value: "1",
          description: "Occupancy disabled"
        }]
      }
    }, {
      data: "Occupancy button",
      shortcut: "OB",
      description: {},
      info: "DB_0.BIT_0: Occupancy button",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }]
  }],
  originalIndex: 84,
  eep: "a5-10-19",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-1a.js
var a5101a = {
  number: "0x1A",
  title: "Supply voltage monitor, Temperature Set Point, Temperature Sensor, Fan Speed and Occupancy Control",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply Voltage",
      shortcut: "SV",
      description: "0 ... 5.0 V linear (super cap); 251-255 reserved for error code",
      info: "DB_3: Supply Voltage (super cap).",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5"
      },
      unit: "V"
    }, {
      data: "Temp Setpoint",
      shortcut: "TMP Sp",
      description: "Temperature Set Point (linear)",
      info: "DB_2: Temp Setpoint 0...40\xB0C, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "250",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=0...250",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "250",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Fan speed",
      shortcut: "FAN",
      description: "Fan Speed",
      info: "DB_0.BIT_5_ BIT_4: Fan speed",
      bitoffs: "25",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Speed 0"
        }, {
          value: "2",
          description: "Speed 1"
        }, {
          value: "3",
          description: "Speed 2"
        }, {
          value: "4",
          description: "Speed 3"
        }, {
          value: "5",
          description: "Speed 4"
        }, {
          value: "6",
          description: "Speed 5"
        }, {
          value: "7",
          description: "Off"
        }]
      }
    }, {
      data: "Occupancy enable/disable",
      shortcut: "OED",
      description: {},
      info: "DB_0.BIT_1: Occ enable/disable",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Occupancy enabled"
        }, {
          value: "1",
          description: "Occupancy disabled"
        }]
      }
    }, {
      data: "Occupancy button",
      shortcut: "OB",
      description: {},
      info: "DB_0.BIT_0: Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }]
  }],
  originalIndex: 85,
  eep: "a5-10-1a",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-1b.js
var a5101b = {
  number: "0x1B",
  title: "Supply Voltage Monitor, Illumination, Temperature Sensor, Fan Speed and Occupancy Control",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply Voltage",
      shortcut: "SV",
      description: "(super cap)\n 251 \u2013 255 reserved for error code",
      info: "DB_3: Supply Voltage (super cap).",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear), 251: Over range, 252-255: reserved",
      info: "DB_2: Illumination 0 \u2013 1000 Lux, Linear 0-250,\n              251 - over range, 252-255 reserved",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "1000"
      },
      unit: "lx"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=0...250",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "250",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Fan speed",
      shortcut: "FAN",
      description: "Fan Speed",
      info: "DB_0.BIT_5_ BIT_4: Fan speed",
      bitoffs: "25",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Speed 0"
        }, {
          value: "2",
          description: "Speed 1"
        }, {
          value: "3",
          description: "Speed 2"
        }, {
          value: "4",
          description: "Speed 3"
        }, {
          value: "5",
          description: "Speed 4"
        }, {
          value: "6",
          description: "Speed 5"
        }, {
          value: "7",
          description: "Off"
        }]
      }
    }, {
      data: "Occupancy enable/disable",
      shortcut: "OED",
      description: {},
      info: "DB_0.BIT_1: Occ enable/disable",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Occupancy enabled"
        }, {
          value: "1",
          description: "Occupancy disabled"
        }]
      }
    }, {
      data: "Occupancy button",
      shortcut: "OB",
      description: {},
      info: "DB_0.BIT_0: Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }]
  }],
  originalIndex: 86,
  eep: "a5-10-1b",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-1c.js
var a5101c = {
  number: "0x1C",
  title: "Illumination, Illumination Set Point, Temperature Sensor, Fan Speed and Occupancy Control",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear), 251: Over range, 252-255: reserved",
      info: "DB_3: Illumination 0 \u2013 1000 Lux, Linear 0-250,251 - over range, 252-255 reserved",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "1000"
      },
      unit: "lx"
    }, {
      data: "Illumination Set Point",
      shortcut: "ILLSP",
      description: {},
      info: "DB_2: Illumination Setpoint 0 \u2013 1000 Lux, Linear 0-250,",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "1000"
      },
      unit: "lx"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=0...250",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "250",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Fan speed",
      shortcut: "FAN",
      description: {},
      info: "DB_0.BIT_5_ BIT_4: Fan speed",
      bitoffs: "25",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Speed 0"
        }, {
          value: "2",
          description: "Speed 1"
        }, {
          value: "3",
          description: "Speed 2"
        }, {
          value: "4",
          description: "Speed 3"
        }, {
          value: "5",
          description: "Speed 4"
        }, {
          value: "6",
          description: "Speed 5"
        }, {
          value: "7",
          description: "Off"
        }]
      }
    }, {
      data: "Occupancy enable/disable",
      shortcut: "OED",
      description: {},
      info: "DB_0.BIT_1: Occ enable/disable",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Occupancy enabled"
        }, {
          value: "1",
          description: "Occupancy disabled"
        }]
      }
    }, {
      data: "Occupancy button",
      shortcut: "OB",
      description: {},
      info: "DB_0.BIT_0: Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }]
  }],
  originalIndex: 87,
  eep: "a5-10-1c",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-1d.js
var a5101d = {
  number: "0x1D",
  title: "Humidity, Humidity Set Point, Temperature Sensor, Fan Speed and Occupancy Control",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: "DB_3: Rel. Humidity 0...100%, linear n=0...250",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Humidity Set Point",
      shortcut: "HUMSP",
      description: "Humidity Set Point (linear)",
      info: "DB_2: Humidity Set Point 0...100%, linear n=0...250",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=0...250",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "250",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Fan speed",
      shortcut: "FAN",
      description: "Fan Speed",
      info: "DB_0.BIT_5_ BIT_4: Fan speed",
      bitoffs: "25",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Speed 0"
        }, {
          value: "2",
          description: "Speed 1"
        }, {
          value: "3",
          description: "Speed 2"
        }, {
          value: "4",
          description: "Speed 3"
        }, {
          value: "5",
          description: "Speed 4"
        }, {
          value: "6",
          description: "Speed 5"
        }, {
          value: "7",
          description: "Off"
        }]
      }
    }, {
      data: "Occupancy enable/disable",
      shortcut: "OED",
      description: {},
      info: "DB_0.BIT_1: Occ enable/disable",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Occupancy enabled"
        }, {
          value: "1",
          description: "Occupancy disabled"
        }]
      }
    }, {
      data: "Occupancy button",
      shortcut: "OB",
      description: {},
      info: "DB_0.BIT_0: Occupancy button",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }]
  }],
  originalIndex: 88,
  eep: "a5-10-1d",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-1e.js
var a5101e = {
  number: "0x1E",
  title: "see A5-10-1B",
  ref: "a5-10-1b",
  originalIndex: 89,
  eep: "a5-10-1e",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-10-1f.js
var a5101f = {
  number: "0x1F",
  title: "Temperature Sensor, Set Point, Fan Speed, Occupancy and Unoccupancy Control",
  description: "",
  case: [{
    datafield: [{
      data: "Turn-switch for fan speed",
      shortcut: "FAN",
      description: "Turn-switch for fan speed",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: [{
          min: "210",
          max: "255",
          description: "Stage auto"
        }, {
          min: "190",
          max: "209",
          description: "Stage 0"
        }, {
          min: "165",
          max: "189",
          description: "Stage 1"
        }, {
          min: "145",
          max: "164",
          description: "Stage 2"
        }, {
          min: "0",
          max: "144",
          description: "Stage 3"
        }]
      }
    }, {
      data: "Set Point",
      shortcut: "SP",
      description: "Set point (linear) Min.- ... Max+",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      data: "Temperature flag",
      shortcut: "TMP_F",
      description: "Temperature flag",
      bitoffs: "25",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Temperature present"
        }, {
          value: "0",
          description: "Temperature absent"
        }]
      }
    }, {
      data: "Set point flag",
      shortcut: "SP_F",
      description: "Set point flag",
      bitoffs: "26",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Set point present"
        }, {
          value: "0",
          description: "Set point absent"
        }]
      }
    }, {
      data: "Fan speed flag",
      shortcut: "FAN_F",
      description: "Fan speed flag",
      bitoffs: "27",
      bitsize: "1",
      enum: {
        item: [{
          value: "1",
          description: "Fan speed present"
        }, {
          value: "0",
          description: "Fan speed absent"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Unoccupancy",
      shortcut: "UNOCC",
      description: "Unoccupancy button",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy button",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Button pressed"
        }, {
          value: "1",
          description: "Button released"
        }]
      }
    }]
  }],
  originalIndex: 90,
  eep: "a5-10-1f",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  submitter: [
    "Distech Controls"
  ]
};

// ../eep-transcoder/eep/a5-10-20.js
var a51020 = {
  number: "0x20",
  title: "Temperature and Set Point with Special Heating States",
  description: '\n              <br/><br/>\n              Description:<br/>\n              Set Point for Heating Control, Temperature, User Activity.\n              <br/><br/>\n              This EEP defines a Room Operating Panel that contains a sensor for\n              temperature measurement. The set point selector knob determines the\n              desired room temperature with the ability to set special set point\n              modes for heating control.\n              User activity and the sensor\u2019s battery state are indicated in the telegram.\n              <br/><br/>\n              <span style="border-bottom:2px groove #000000;">Data exchange</span>\n              <br/>\n              Direction: unidirectional<br/>\n              Addressing: broadcast<br/>\n              Communication trigger: event- & time-triggered<br/>\n              Communication intervall: 1200 s<br/>\n              Trigger event: change of any input signal<br/>\n              Tx delay: n/a<br/>\n              Rx timeout: 0 ms (minimum time between two received messages)<br/>\n              Teach-in method: 4BS teach-in 2 / Universal teach-in<br/>\n              Security Encryption supported: no<br/>\n              Security level format: -',
  case: [{
    datafield: [{
      data: "Set Point",
      shortcut: "SP",
      description: "Set point (linear) Min.- ... Max+",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      data: "Set point mode",
      shortcut: "SPM",
      description: "Selection of heating mode",
      bitoffs: "25",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Room temperature defined by SP"
        }, {
          value: "1",
          description: "Frost protection"
        }, {
          value: "2",
          description: "Automatic control (e.g. defined by time program)"
        }, {
          value: "3",
          description: "Reserved"
        }]
      }
    }, {
      data: "Battery state",
      shortcut: "BATT",
      description: "Battery change needed",
      bitoffs: "27",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Battery ok"
        }, {
          value: "1",
          description: "Battery low"
        }]
      }
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "User activity",
      shortcut: "ACT",
      description: "User intervention action on device",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No user action"
        }, {
          value: "1",
          description: "User interaction"
        }]
      }
    }]
  }],
  originalIndex: 91,
  eep: "a5-10-20",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  submitter: [
    "MSR-Solutions GmbH, Wangen i.Allg."
  ]
};

// ../eep-transcoder/eep/a5-10-21.js
var a51021 = {
  number: "0x21",
  title: "Temperature, Humidity and Set Point with Special Heating States",
  description: '\n            <br/>\n            <br/>Description:\n            <br/>Set Point for Heating Control, Temperature, Humidity, User Activity.\n            <br/>\n            <br/>\n            This EEP defines a Room Operating Panel that contains sensors for temperature and\n            humidity. The set point selector knob determines the desired room temperature with\n            the ability to set special set point modes for heating control.\n            User activity and the sensor\u2019s battery state are indicated in the telegram.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication intervall: 1200 s\n            <br/>Trigger event: change of any input signal\n            <br/>Tx delay: n/a\n            <br/>Rx timeout: 0 ms (minimum time between two received messages)\n            <br/>Teach-in method: 4BS teach-in 2 / Universal teach-in\n            <br/>Security Encryption required: no\n            <br/>Security level format: -',
  case: [{
    datafield: [{
      data: "Set Point",
      shortcut: "SP",
      description: "Set point (linear) Min.- ... Max+",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. humidity (linear)",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      data: "Set point mode",
      shortcut: "SPM",
      description: "Selection of heating mode",
      bitoffs: "25",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Room temperature defined by SP"
        }, {
          value: "1",
          description: "Frost protection"
        }, {
          value: "2",
          description: "Automatic control<br/>(e.g. defined by time program)"
        }, {
          value: "3",
          description: "Reserved"
        }]
      }
    }, {
      data: "Battery state",
      shortcut: "BATT",
      description: "Battery change needed",
      bitoffs: "27",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Battery ok"
        }, {
          value: "1",
          description: "Battery low"
        }]
      }
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "User activity",
      shortcut: "ACT",
      description: "User intervention action on device",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No user action"
        }, {
          value: "1",
          description: "User interaction"
        }]
      }
    }]
  }],
  originalIndex: 92,
  eep: "a5-10-21",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  submitter: [
    "MSR-Solutions GmbH, Wangen i.Allg."
  ]
};

// ../eep-transcoder/eep/a5-10-22.js
var a51022 = {
  number: "0x22",
  title: "Temperature, Setpoint, Humidity and Fan Speed",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: time-triggered (configurable at the device) & event-triggered\n            <br/>Trigger event: setpoint change, fan speed change\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Product Description</span>\n            <br/>\n            The device represented by this EEP is a \u201CRoom Operating Panel with Display\u201D.\n            It is powered by solar cell.<br/>\n            <br/>\n            It is equipped with the following features:<br/>\n            - Temperature Sensor<br/>\n            - Humidity Sensor<br/>\n            - Temperature Setpoint Adjustment<br/>\n            - Fanspeed Adjustment<br/>\n            <br/>\n            For pairing the unidirectional \u201C4BS Teach-In Variation 2\u201D method is used.<br/>\n            <br/>\n            The device transmits the actual sensor values periodically (Default: 1000s)\n            or on an event like \u201CTemperature Setpoint Adjustment\u201D or \u201CFanspeed Adjustment\u201D.<br/>\n            <br/>\n            Temperature Sensor, Humidity Sensor:<br/>\n            The environmental sensors are updated periodically (adjustable, default: 100s)\n            and, if there is a change, the updated values will be send immediately.<br/>',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "27",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "Relative Setpoint",
      shortcut: "SP",
      description: "Setpoint (linear) Min.- ... Max+",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Fanspeed",
      shortcut: "FAN",
      description: "Fanspeed",
      bitoffs: "24",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Speed 0 / OFF"
        }, {
          value: "2",
          description: "Speed 1"
        }, {
          value: "3",
          description: "Speed 2"
        }, {
          value: "4",
          description: "Speed 3"
        }, {
          value: "5 ... 7",
          description: "Reserved"
        }]
      }
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }]
  }],
  originalIndex: 93,
  eep: "a5-10-22",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  submitter: [
    "Thermokon Sensortechnik GmbH"
  ]
};

// ../eep-transcoder/eep/a5-10-23.js
var a51023 = {
  number: "0x23",
  title: "Temperature, Setpoint, Humidity, Fan Speed and Occupancy",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: time-triggered (configurable at the device) & event-triggered\n            <br/>Trigger event: setpoint change, fan speed change, change of occupancy-state\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Product Description</span>\n            <br/>The device represented by this EEP is a \u201CRoom Operating Panel with Display\u201D.\n            It is powered by solar cell.\n            <br/>\n            <br/>It is equipped with the following features:\n            <br/>- Temperature Sensor\n            <br/>- Humidity Sensor\n            <br/>- Setpoint Adjustment\n            <br/>- Fanspeed Adjustment\n            <br/>- Occupancy-State Adjustment\n            <br/>\n            <br/>For pairing the unidirectional \u201C4BS Teach-In Variation 2\u201D method is used.\n            <br/>\n            <br/>The device transmits the actual sensor values periodically (Default: 1000s)\n            or on an event like \u201CSetpoint Adjustment\u201D or \u201CFanspeed Adjustment\u201D.\n            <br/>\n            <br/>Temperature Sensor, Humidity Sensor:\n            <br/>The environmental sensors are updated periodically (adjustable, default: 100s)\n            and, if there is a change, the updated values will be send directly.\n            <br/>',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "27",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "Relative Setpoint",
      shortcut: "SP",
      description: "Setpoint (linear) Min.- ... Max+",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear)",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Fanspeed",
      shortcut: "FAN",
      description: "Fanspeed",
      bitoffs: "24",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Speed 0 / OFF"
        }, {
          value: "2",
          description: "Speed 1"
        }, {
          value: "3",
          description: "Speed 2"
        }, {
          value: "4",
          description: "Speed 3"
        }, {
          value: "5 ... 7",
          description: "Reserved"
        }]
      }
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Unoccupied"
        }, {
          value: "1",
          description: "Occupied"
        }]
      }
    }]
  }],
  originalIndex: 94,
  eep: "a5-10-23",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Room Operating Panel",
  func_number: "0x10",
  submitter: [
    "Thermokon Sensortechnik GmbH"
  ]
};

// ../eep-transcoder/eep/a5-11-01.js
var a51101 = {
  number: "0x01",
  title: "Lighting Controller",
  status: "released",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear)",
      info: "DB_3 Illumination 0 \u2026 510lx, linear n=0\u2026255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "510"
      },
      unit: "lx"
    }, {
      data: "Illumination Set Point",
      shortcut: "ISP",
      description: "Illumination Set Point (Min. ... Max.) (linear)",
      info: "DB_2 Illumination Set Point Min. \u2026 Max., linear n=0\u2026255",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Dimming Output Level",
      shortcut: "DIM",
      description: "Dimming Output Level (Min. ... Max.) (linear)",
      info: "DB_1: Dimming Output Level Min. \u2026 Max., linear n=0\u2026255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Repeater",
      shortcut: "REP",
      description: "Repeater",
      info: "Repeater",
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "disabled"
        }, {
          value: "1",
          description: "enabled"
        }]
      }
    }, {
      data: "Power Relay Timer",
      shortcut: "PRT",
      description: "Power Relay Timer",
      info: "Power Relay Timer",
      bitoffs: "25",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "disabled"
        }, {
          value: "1",
          description: "enabled"
        }]
      }
    }, {
      data: "Daylight Harvesting",
      shortcut: "DHV",
      description: "Daylight Harvesting",
      info: "Daylight Harvesting",
      bitoffs: "26",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "disabled"
        }, {
          value: "1",
          description: "enabled"
        }]
      }
    }, {
      data: "Dimming",
      shortcut: "EDIM",
      description: "Dimming",
      info: "Dimming",
      bitoffs: "27",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "switching load"
        }, {
          value: "1",
          description: "dimming load"
        }]
      }
    }, {
      data: "Magnet Contact",
      shortcut: "MGC",
      description: "Magnet Contact",
      info: "Magnet Contact",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "open"
        }, {
          value: "1",
          description: "closed"
        }]
      }
    }, {
      data: "Occupancy",
      shortcut: "OCC",
      description: "Occupancy",
      info: "Occupancy",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "unoccupied"
        }, {
          value: "1",
          description: "occupied"
        }]
      }
    }, {
      data: "Power Relay",
      shortcut: "PWR",
      description: "Power Relay",
      info: "Power Relay",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "off"
        }, {
          value: "1",
          description: "on"
        }]
      }
    }]
  }],
  originalIndex: 95,
  eep: "a5-11-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Controller Status",
  func_number: "0x11",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-11-02.js
var a51102 = {
  number: "0x02",
  title: "Temperature Controller Output",
  description: "",
  status: {},
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Control Variable",
      shortcut: "CVAR",
      description: "Actual value of controller",
      info: "DB_3: Control variable 0\u2026 100 % 0...255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "FanStage",
      shortcut: "FAN",
      description: "Actual value of fan",
      info: "DB_2: FanStage 0,1,2,3, 0xFF not available",
      bitoffs: "8",
      bitsize: "8",
      enum: {
        item: [{
          value: "0",
          description: "Stage 0 Manual"
        }, {
          value: "1",
          description: "Stage 1 Manual"
        }, {
          value: "2",
          description: "Stage 2 Manual"
        }, {
          value: "3",
          description: "Stage 3 Manual"
        }, {
          value: "16",
          description: "Stage 0 Automatic"
        }, {
          value: "17",
          description: "Stage 1 Automatic"
        }, {
          value: "18",
          description: "Stage 2 Automatic"
        }, {
          value: "19",
          description: "Stage 3 Automatic"
        }, {
          value: "255",
          description: "Not Available"
        }]
      }
    }, {
      data: "Actual Setpoint",
      shortcut: "ASP",
      description: "Occupied:<br/>Basic setpoint occupied + Setpoint shift + Sensor offset\n            <br/><br/>StandBy:<br/>Basic setpoint standBy + Setpoint shift\n            <br/><br/>Unoccupied:<br/>Basic setpoint unoccupied + setpoint shift",
      info: "DB_1: Actual Set point 0\u2026 51.2 \xB0C 0\u2026255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+51.2"
      },
      unit: "\xB0C"
    }, {
      data: "Alarm",
      shortcut: "ALR",
      description: "In case of internal error alarm is set",
      info: "Alarm",
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No alarm"
        }, {
          value: "1",
          description: "Alarm"
        }]
      }
    }, {
      data: "Controller mode",
      shortcut: "CTM",
      description: "Actual state of controller",
      info: {},
      bitoffs: "25",
      bitsize: "2",
      enum: {
        item: [{
          value: "1",
          description: "Heating"
        }, {
          value: "2",
          description: "Cooling"
        }, {
          value: "3",
          description: "Off"
        }]
      }
    }, {
      data: "Controller state",
      shortcut: "CST",
      description: "Automatic control, or is controlled from another device",
      info: "Controller state",
      bitoffs: "27",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Automatic"
        }, {
          value: "1",
          description: "Override"
        }]
      }
    }, {
      data: "Energy hold-off",
      shortcut: "ERH",
      description: "Stop control if window is opened",
      info: "Energy holdoff",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Normal"
        }, {
          value: "1",
          description: "Energy hold-off/ Dew point"
        }]
      }
    }, {
      data: "Room occupancy",
      shortcut: "RO",
      description: "Actual room occupancy",
      info: "Room occupancy",
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Occupied"
        }, {
          value: "1",
          description: "Unoccupied"
        }, {
          value: "2",
          description: "StandBy"
        }, {
          value: "3",
          description: "Frost"
        }]
      }
    }]
  }],
  originalIndex: 96,
  eep: "a5-11-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Controller Status",
  func_number: "0x11",
  submitter: [
    "Thermokon Sensortechnik GmbH"
  ]
};

// ../eep-transcoder/eep/a5-11-03.js
var a51103 = {
  number: "0x03",
  title: "Blind Status",
  status: "released",
  description: "<br/><br/>\n          This controller status is specific for blinds, awning and shutter\n          modules. All modules can use this 4BS telegram to send all information about\n          the status, the position and errors of the module, if these data are available.",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Blind/shutter pos.",
      shortcut: "BSP",
      description: {},
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Angle sign",
      shortcut: "AS",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Positive sign"
        }, {
          value: "1",
          description: "Negative sign"
        }]
      }
    }, {
      data: "Angle",
      shortcut: "AN",
      description: 'Angle in 2\xB0 steps<br/>\n              (e.g. 0 = 0\xB0, 90 = 180\xB0)<br/><br/>\n              (EEP 2.6.5:<br/>\n              valid range\n              <span style="text-decoration:line-through;color:red">0 \u2026 180</span> ->\n              <span style="font-weight:bold;color:green">0 \u2026 90</span><br/>\n              scale\n              <span style="text-decoration:line-through;color:red">0 \u2026 360</span> ->\n              <span style="font-weight:bold;color:green">0 \u2026 180</span>)<br/>',
      info: {},
      bitoffs: "9",
      bitsize: "7",
      range: {
        min: "0",
        max: "90"
      },
      scale: {
        min: "0",
        max: "180"
      },
      unit: "\xB0"
    }, {
      data: "Position value flag",
      shortcut: "PVF",
      description: {},
      info: {},
      bitoffs: "16",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No Position value available"
        }, {
          value: "1",
          description: "Position value available"
        }]
      }
    }, {
      data: "Angle value flag",
      shortcut: "AVF",
      description: {},
      info: {},
      bitoffs: "17",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No Angle value available"
        }, {
          value: "1",
          description: "Angle value available"
        }]
      }
    }, {
      data: "Error state",
      shortcut: "ES",
      description: {},
      info: {},
      bitoffs: "18",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "No error present"
        }, {
          value: "1",
          description: "End-positions are not configured"
        }, {
          value: "2",
          description: "Internal failure"
        }, {
          value: "3",
          description: "Not used"
        }]
      }
    }, {
      data: "End-position",
      shortcut: "EP",
      description: {},
      info: {},
      bitoffs: "20",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "No End-position available"
        }, {
          value: "1",
          description: "No End-position reached"
        }, {
          value: "2",
          description: "Blind fully open"
        }, {
          value: "3",
          description: "Blind fully closed"
        }]
      }
    }, {
      data: "Status",
      shortcut: "ST",
      description: {},
      info: {},
      bitoffs: "22",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "No Status available"
        }, {
          value: "1",
          description: "Blind is stopped"
        }, {
          value: "2",
          description: "Blind opens"
        }, {
          value: "3",
          description: "Blind closes"
        }]
      }
    }, {
      data: "Service Mode",
      shortcut: "SM",
      description: {},
      info: {},
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Normal mode"
        }, {
          value: "1",
          description: "Service mode is activated (For example for maintenance)"
        }]
      }
    }, {
      data: "Mode of the position",
      shortcut: "MOTP",
      description: {},
      info: {},
      bitoffs: "25",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Normal mode:<br/>0% Blind fully open / 100% Blind fully close"
        }, {
          value: "1",
          description: "Inverse mode:<br/>100% Blind fully open / 0% Blind fully close"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "26",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }]
  }],
  originalIndex: 97,
  eep: "a5-11-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Controller Status",
  func_number: "0x11",
  submitter: [
    "PEHA",
    "infratec"
  ]
};

// ../eep-transcoder/eep/a5-11-04.js
var a51104 = {
  number: "0x04",
  title: "Extended Lighting Status",
  status: "released",
  description: "<br/><br/>\n          This status is an extended answer of new lighting-controllers.\n          All modules can use this 4BS telegram to send all information about the status\n          and errors of the module, if these data are available.",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Parameter 1",
      shortcut: "P1",
      description: {},
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          description: "Mode 0: Dimm-Value (0 .. 255)\n                <br/>\n                Mode 1: R - Red (0 .. 255)\n                <br/>\n                Mode 2: Energy metering value (MSB 15 .. 8)\n                <br/>\n                Mode 3: Not used"
        }
      }
    }, {
      data: "Parameter 2",
      shortcut: "P2",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "8",
      enum: {
        item: {
          description: "Mode 0: Lamp operating hours (MSB 15 .. 8)\n                <br/>\n                Mode 1: G - Green (0 .. 255)\n                <br/>\n                Mode 2: Energy metering value (7 .. 0 LSB)\n                <br/>\n                Mode 3: Not used"
        }
      }
    }, {
      data: "Parameter 3",
      shortcut: "P3",
      description: {},
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: {
          description: "Mode 0: Lamp operating hours (7 .. 0 LSB)\n                <br/>\n                Mode 1: B - Blue (0 .. 255)\n                <br/>\n                Mode 2: Unit for energy values:<br/>\n                Enum:<br/>\n                0 = mW<br/>\n                1 = W<br/>\n                2 = kW<br/>\n                3 = MW<br/>\n                4 = Wh<br/>\n                5 = kWh<br/>\n                6 = MWh<br/>\n                7 = GWh<br/>\n                8 = mA<br/>\n                9 = 1/10 A<br/>\n                10 = mV<br/>\n                11 = 1/10 V<br/>\n                12 .. 15 Not used<br/>\n                <br/>\n                Mode 3: Not used"
        }
      }
    }, {
      data: "Service Mode",
      shortcut: "SM",
      description: {},
      info: {},
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Normal mode"
        }, {
          value: "1",
          description: "Service mode is activated.<br/>\n                  (For example for maintenance)"
        }]
      }
    }, {
      data: "Operating hours flag",
      shortcut: "OHF",
      description: "For Mode 0",
      info: {},
      bitoffs: "25",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No lamp operating hours available"
        }, {
          value: "1",
          description: "Lamp operating hours available"
        }]
      }
    }, {
      data: "Error state",
      shortcut: "ES",
      description: {},
      info: {},
      bitoffs: "26",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "No error present"
        }, {
          value: "1",
          description: "Lamp-failure"
        }, {
          value: "2",
          description: "Internal failure"
        }, {
          value: "3",
          description: "Failure on the external periphery"
        }]
      }
    }, {
      data: "Parameter Mode",
      shortcut: "PM",
      description: {},
      info: {},
      bitoffs: "29",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "8 Bit Dimmer Value and Lamp operating hours"
        }, {
          value: "1",
          description: "RGB Value"
        }, {
          value: "2",
          description: "Energy metering value"
        }, {
          value: "3",
          description: "Not used"
        }]
      }
    }, {
      data: "Status",
      shortcut: "ST",
      description: {},
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Lighting off"
        }, {
          value: "1",
          description: "Lighting on"
        }]
      }
    }]
  }],
  originalIndex: 98,
  eep: "a5-11-04",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Controller Status",
  func_number: "0x11",
  submitter: [
    "PEHA",
    "infratec"
  ]
};

// ../eep-transcoder/eep/a5-11-05.js
var a51105 = {
  number: "0x05",
  title: "Dual-Channel Switch Actuator",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>\n            This EEP is used for sending the latest relay status (including current\n            working mode) of a dual-channel switch actuator. The telegram is sent\n            when the relay status changes or a gateway request is received.\n            Each time the gateway is powered on, it will send a request telegram to\n            request that the actuator reports its latest relay status, while in\n            normal working state, it won\u2019t send any telegram to the actuator and\n            only receive the relay status from the actuator.\n            <br/>\n            <br/>\n            1) Gateway first power on:\n            <br/>\n            <img>graphics/A5-11-05_V01.png</img>\n            <br/>\n            2) When the actuator receives a switch telegram and its status changes:\n            <br/>\n            <img>graphics/A5-11-05_V02.png</img>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: bi-directional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event & request\n            <br/>Communication interval: -\n            <br/>Trigger event: change of relay status\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/><span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/><span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -\n            <br/>\n            <br/>\n            <br/><span style="border-bottom:2px groove #000000;">Appendix</span>\n            <br/>\n            Operation mode description:\n            <br/>\n            <br/><b>Mode 1:</b>\n            <br/>One switch controls one dual-channel actuator. Each rock controls\n            one channel.\n            <br/>I: power ON, O: power OFF\n            <br/>\n            <img>graphics/A5-11-05_V04.png</img>\n            <br/>\n            <br/><b>Mode 2:</b>\n            <br/>In this mode, actuator can be controlled by both switch and\n            occupancy sensor, also can be set \u201CAuto\u201D control by occupancy sensor\n            or \u201CManual\u201D control by switch through button \u201CA\u201D or \u201CM\u201D.\n            Each channel can be controlled independently.\n            <br/>\n            <img>graphics/A5-11-05_V05.png</img>\n            <br/>\n            <br/><b>Mode 3:</b>\n            <br/>A bit like mode 1, but single rocker button controls two channels\n            one time.\n            <br/>\n            <img>graphics/A5-11-05_V06.png</img>\n            <br/>\n            <br/><b>Mode 4:</b>\n            <br/>One dual-rock switch button can control two dual-channel actuators\n            as 4 channel lighting in all. We can control one channel only through\n            trigger the rock angle.\n            <br/>\n            <img>graphics/A5-11-05_V07.png</img>\n            <br/>\n            <br/>\n            DIRECTION-1 = Gateway request telegram; from gateway to actuator\n            <br/>\n            DIRECTION-2 = Actuator status report; from actuator to gateway',
  case: [{
    direction: "1",
    condition: {
      direction: "1"
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "28"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines if the telegram is a request or contains data",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: {
          value: "0",
          description: "Request"
        }
      }
    }]
  }, {
    direction: "2",
    condition: {
      direction: "2"
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "25"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Working Mode",
      shortcut: "WM",
      description: "Actuators current working mode",
      info: {},
      bitoffs: "25",
      bitsize: "3",
      enum: [{
        item: {
          value: "0b001",
          description: "mode 1"
        }
      }, {
        item: {
          value: "0b010",
          description: "mode 2"
        }
      }, {
        item: {
          value: "0b011",
          description: "mode 3"
        }
      }, {
        item: {
          value: "0b100",
          description: "mode 4"
        }
      }]
    }, {
      data: "Relay Status",
      shortcut: "RS",
      description: "Actuators current relay status\n              <br/>Bit 0.1: CH1\n              <br/>Bit 0.2: CH2",
      info: {},
      bitoffs: "29",
      bitsize: "2",
      enum: [{
        item: {
          value: "0b00",
          description: "CH1 off, CH2 off"
        }
      }, {
        item: {
          value: "0b01",
          description: "CH1 on, CH2 off"
        }
      }, {
        item: {
          value: "0b10",
          description: "CH1 off, CH2 on"
        }
      }, {
        item: {
          value: "0b11",
          description: "CH1 on, CH2 on"
        }
      }]
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines if the telegram is a request or contains data",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: {
          value: "1",
          description: "Status Report"
        }
      }
    }]
  }],
  originalIndex: 99,
  eep: "a5-11-05",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Controller Status",
  func_number: "0x11",
  submitter: [
    "Nanjing Putian Telecommunications CO., Ltd.,"
  ]
};

// ../eep-transcoder/eep/a5-12-00.js
var a51200 = {
  number: "0x00",
  title: "Counter",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Meter reading",
      shortcut: "MR",
      description: "Current value or cumulative counter value",
      bitoffs: "0",
      bitsize: "24",
      range: {
        min: "0",
        max: "16777215"
      },
      scale: {
        ref: "DIV"
      },
      unit: {
        ref: "DT"
      }
    }, {
      data: "Measurement channel",
      shortcut: "CH",
      description: {},
      bitoffs: "24",
      bitsize: "4",
      range: {
        min: "0",
        max: "15"
      },
      scale: {
        min: "0",
        max: "15"
      },
      unit: "1"
    }, {
      data: "Data type (unit)",
      shortcut: "DT",
      description: "Current value or cumulative counter value",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Cumulative value",
          scale: "0",
          unit: "1"
        }, {
          value: "1",
          description: "Current value",
          scale: "1",
          unit: "1/s"
        }]
      }
    }, {
      data: "Divisor (scale)",
      shortcut: "DIV",
      description: "Divisor for counter value",
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "x/1",
          scale: {
            min: "0",
            max: "16777215"
          }
        }, {
          value: "1",
          description: "x/10",
          scale: {
            min: "0",
            max: "1677721.5"
          }
        }, {
          value: "2",
          description: "x/100",
          scale: {
            min: "0",
            max: "167772.15"
          }
        }, {
          value: "3",
          description: "x/1000",
          scale: {
            min: "0",
            max: "16777.215"
          }
        }]
      }
    }]
  }],
  originalIndex: 100,
  eep: "a5-12-00",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Automated Meter Reading (AMR)",
  func_number: "0x12",
  submitter: [
    "EnOcean GmbH"
  ]
};

// ../eep-transcoder/eep/a5-12-01.js
var a51201 = {
  number: "0x01",
  title: "Electricity",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Meter reading",
      shortcut: "MR",
      description: "current value in W or cumulative value in kWh",
      bitoffs: "0",
      bitsize: "24",
      range: {
        min: "0",
        max: "16777215"
      },
      scale: {
        ref: "DIV"
      },
      unit: {
        ref: "DT"
      }
    }, {
      data: "Tariff info",
      shortcut: "TI",
      description: {},
      bitoffs: "24",
      bitsize: "4",
      range: {
        min: "0",
        max: "15"
      },
      scale: {
        min: "0",
        max: "15"
      },
      unit: "1"
    }, {
      data: "Data type (unit)",
      shortcut: "DT",
      description: "Current value or cumulative value",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Cumulative value",
          scale: "0",
          unit: "kWh"
        }, {
          value: "1",
          description: "Current value",
          scale: "1",
          unit: "W"
        }]
      }
    }, {
      data: "Divisor (scale)",
      shortcut: "DIV",
      description: "Divisor for value",
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "x/1",
          scale: {
            min: "0",
            max: "16777215"
          }
        }, {
          value: "1",
          description: "x/10",
          scale: {
            min: "0",
            max: "1677721.5"
          }
        }, {
          value: "2",
          description: "x/100",
          scale: {
            min: "0",
            max: "167772.15"
          }
        }, {
          value: "3",
          description: "x/1000",
          scale: {
            min: "0",
            max: "16777.215"
          }
        }]
      }
    }]
  }],
  originalIndex: 101,
  eep: "a5-12-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Automated Meter Reading (AMR)",
  func_number: "0x12",
  submitter: [
    "EnOcean GmbH"
  ]
};

// ../eep-transcoder/eep/a5-12-02.js
var a51202 = {
  number: "0x02",
  title: "Gas",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "meter reading",
      shortcut: "MR",
      description: "Cumulative value in m\xB3\n              or\n              Current value in liter/s",
      bitoffs: "0",
      bitsize: "24",
      range: {
        min: "0",
        max: "16777215"
      },
      scale: {
        ref: "DIV"
      },
      unit: {
        ref: "DT"
      }
    }, {
      data: "Tariff info",
      shortcut: "TI",
      description: {},
      bitoffs: "24",
      bitsize: "4",
      range: {
        min: "0",
        max: "15"
      },
      scale: {
        min: "0",
        max: "15"
      },
      unit: "1"
    }, {
      data: "data type (unit)",
      shortcut: "DT",
      description: "Current value or cumulative value",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Cumulative value",
          scale: "0",
          unit: "m\xB3"
        }, {
          value: "1",
          description: "Current value",
          scale: "1",
          unit: "liter/s"
        }]
      }
    }, {
      data: "divisor (scale)",
      shortcut: "DIV",
      description: "Divisor for value",
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "x/1",
          scale: {
            min: "0",
            max: "16777215"
          }
        }, {
          value: "1",
          description: "x/10",
          scale: {
            min: "0",
            max: "1677721.5"
          }
        }, {
          value: "2",
          description: "x/100",
          scale: {
            min: "0",
            max: "167772.15"
          }
        }, {
          value: "3",
          description: "x/1000",
          scale: {
            min: "0",
            max: "16777.215"
          }
        }]
      }
    }]
  }],
  originalIndex: 102,
  eep: "a5-12-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Automated Meter Reading (AMR)",
  func_number: "0x12",
  submitter: [
    "EnOcean GmbH"
  ]
};

// ../eep-transcoder/eep/a5-12-03.js
var a51203 = {
  number: "0x03",
  title: "Water",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Meter reading",
      shortcut: "MR",
      description: "Cumulative value in m\xB3\n              or\n              Current value in liter/s",
      bitoffs: "0",
      bitsize: "24",
      range: {
        min: "0",
        max: "16777215"
      },
      scale: {
        ref: "DIV"
      },
      unit: {
        ref: "DT"
      }
    }, {
      data: "Tariff info",
      shortcut: "TI",
      description: {},
      bitoffs: "24",
      bitsize: "4",
      range: {
        min: "0",
        max: "15"
      },
      scale: {
        min: "0",
        max: "15"
      },
      unit: "1"
    }, {
      data: "Data type (unit)",
      shortcut: "DT",
      description: "Current value or cumulative value",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Cumulative value",
          scale: "0",
          unit: "m\xB3"
        }, {
          value: "1",
          description: "Current value",
          scale: "1",
          unit: "Liter/s"
        }]
      }
    }, {
      data: "Divisor (scale)",
      shortcut: "DIV",
      description: "Divisor for value",
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "x/1",
          scale: {
            min: "0",
            max: "16777215"
          }
        }, {
          value: "1",
          description: "x/10",
          scale: {
            min: "0",
            max: "1677721.5"
          }
        }, {
          value: "2",
          description: "x/100",
          scale: {
            min: "0",
            max: "167772.15"
          }
        }, {
          value: "3",
          description: "x/1000",
          scale: {
            min: "0",
            max: "16777.215"
          }
        }]
      }
    }]
  }],
  originalIndex: 103,
  eep: "a5-12-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Automated Meter Reading (AMR)",
  func_number: "0x12",
  submitter: [
    "EnOcean GmbH"
  ]
};

// ../eep-transcoder/eep/a5-12-04.js
var a51204 = {
  number: "0x04",
  title: "Temperature and Load Sensor",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>Temp and Load Sensor aimed for fridge and other application.\n            <br/>E.g. milk carton puts on this sensor in fridge. The sensor sends a signal\n            of temp and remaining amount of milk (in gram).\n            Since this sensor is battery-powered, battery level information is\n            transmitted with Temp and Load information, too.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: -\n            <br/>Trigger event: load changed\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: yes\n            <br/>Security level format: RLC + AES128',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "14",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Meter reading",
      shortcut: "MR",
      description: "Current value in gram",
      info: {},
      bitoffs: "0",
      bitsize: "14",
      range: {
        min: "0",
        max: "16383"
      },
      scale: {
        min: "0",
        max: "16383"
      },
      unit: "gram"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "-40",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Battery Level",
      shortcut: "BL",
      description: "Battery level",
      info: {},
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "100-75%"
        }, {
          value: "1",
          description: "75-50%"
        }, {
          value: "2",
          description: "50-25%"
        }, {
          value: "3",
          description: "25-0%"
        }]
      }
    }]
  }],
  originalIndex: 104,
  eep: "a5-12-04",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Automated Meter Reading (AMR)",
  func_number: "0x12",
  submitter: [
    "SIMICS",
    "NTT East"
  ]
};

// ../eep-transcoder/eep/a5-12-05.js
var a51205 = {
  number: "0x05",
  title: "Temperature and Container Sensor",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>Temp and Container Sensor aimed for fridge and other application.\n            <br/>E.g. eggs or egg carton puts on the Container Sensor in fridge.\n            The sensor sends a signal of temp and remaining of eggs. Since this sensor\n            is battery-powered, battery level information is transmitted with other information, too.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: -\n            <br/>Trigger event: load changed\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: yes\n            <br/>Security level format: RLC + AES128\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Appendix</span>\n            <br/>Location 0 - 9 are assigned as follows:\n            <br/>\n            <img>graphics/A5-12-05.png</img>',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "10",
      bitsize: "6"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Position Sensor 0",
      shortcut: "PS0",
      description: "Location 0",
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not possessed"
        }, {
          value: "1",
          description: "possessed"
        }]
      }
    }, {
      data: "Position Sensor 1",
      shortcut: "PS1",
      description: "Location 1",
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not possessed"
        }, {
          value: "1",
          description: "possessed"
        }]
      }
    }, {
      data: "Position Sensor 2",
      shortcut: "PS2",
      description: "Location 2",
      bitoffs: "2",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not possessed"
        }, {
          value: "1",
          description: "possessed"
        }]
      }
    }, {
      data: "Position Sensor 3",
      shortcut: "PS3",
      description: "Location 3",
      bitoffs: "3",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not possessed"
        }, {
          value: "1",
          description: "possessed"
        }]
      }
    }, {
      data: "Position Sensor 4",
      shortcut: "PS4",
      description: "Location 4",
      bitoffs: "4",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not possessed"
        }, {
          value: "1",
          description: "possessed"
        }]
      }
    }, {
      data: "Position Sensor 5",
      shortcut: "PS5",
      description: "Location 5",
      bitoffs: "5",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not possessed"
        }, {
          value: "1",
          description: "possessed"
        }]
      }
    }, {
      data: "Position Sensor 6",
      shortcut: "PS6",
      description: "Location 6",
      bitoffs: "6",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not possessed"
        }, {
          value: "1",
          description: "possessed"
        }]
      }
    }, {
      data: "Position Sensor 7",
      shortcut: "PS7",
      description: "Location 7",
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not possessed"
        }, {
          value: "1",
          description: "possessed"
        }]
      }
    }, {
      data: "Position Sensor 8",
      shortcut: "PS8",
      description: "Location 8",
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not possessed"
        }, {
          value: "1",
          description: "possessed"
        }]
      }
    }, {
      data: "Position Sensor 9",
      shortcut: "PS9",
      description: "Location 9",
      bitoffs: "9",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not possessed"
        }, {
          value: "1",
          description: "possessed"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "-40",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Battery Level",
      shortcut: "BL",
      description: "Battery level",
      info: {},
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "100-75%"
        }, {
          value: "1",
          description: "75-50%"
        }, {
          value: "2",
          description: "50-25%"
        }, {
          value: "3",
          description: "25-0%"
        }]
      }
    }]
  }],
  originalIndex: 105,
  eep: "a5-12-05",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Automated Meter Reading (AMR)",
  func_number: "0x12",
  submitter: [
    "SIMICS",
    "NTT East"
  ]
};

// ../eep-transcoder/eep/a5-12-10.js
var a51210 = {
  number: "0x10",
  title: "Current meter 16 channels",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>\n            This profile is used for up to 16 channels current meters.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: can be defined by user\n            <br/>Trigger event: 10 or 20 % delta for observed value\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Recommendation</span>\n            <br/>Channels not used should not be transmitted.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Appendix</span>\n            <br/>\n            Our new product is a 12 channels current meter. It is able to measure,\n            using a maximum of 12 current transformers, the current (mA) or\n            cumulative current (mAh) of all of his channels.\n            It is however not sending data for not configured channels\n            (e.g. channels 12 to 15).\n            The meter is sending values every 5 or 10 seconds, and in order to\n            improve accuracy, a current fluctuation of more than 10 or 20 % will\n            trigger a new transmission of the corresponding channel.\n            <br/>\n            <img>graphics/A5-12-10.png</img>',
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Meter reading",
      shortcut: "MR",
      description: "Current value in mA or\n              cumulative value in A.h",
      bitoffs: "0",
      bitsize: "24",
      range: {
        min: "0",
        max: "16777215"
      },
      scale: {
        ref: "DIV"
      },
      unit: {
        ref: "DT"
      }
    }, {
      data: "Measurement channel",
      shortcut: "CH",
      description: "Channel no.",
      bitoffs: "24",
      bitsize: "4",
      range: {
        min: "0",
        max: "15"
      },
      scale: {
        min: "0",
        max: "15"
      },
      unit: {}
    }, {
      data: "Data type (unit)",
      shortcut: "DT",
      description: "Current value or cumulative value",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Cumulative value",
          scale: "0",
          unit: "A.h"
        }, {
          value: "1",
          description: "Current value",
          scale: "1",
          unit: "mA"
        }]
      }
    }, {
      data: "Divisor (scale)",
      shortcut: "DIV",
      description: "Divisor for value",
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "x/1",
          scale: {
            min: "0",
            max: "16777215"
          }
        }, {
          value: "1",
          description: "x/10",
          scale: {
            min: "0",
            max: "1677721.5"
          }
        }, {
          value: "2",
          description: "x/100",
          scale: {
            min: "0",
            max: "167772.15"
          }
        }, {
          value: "3",
          description: "x/1000",
          scale: {
            min: "0",
            max: "16777.215"
          }
        }]
      }
    }]
  }],
  originalIndex: 106,
  eep: "a5-12-10",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Automated Meter Reading (AMR)",
  func_number: "0x12",
  submitter: [
    "Ewattch"
  ]
};

// ../eep-transcoder/eep/a5-13-01.js
var a51301 = {
  number: "0x01",
  title: "Weather Station",
  status: "released",
  description: "A receiver that accepts EEP A5-13-01 at teach-in automatically needs to accept telegrams from\n            the same ID that comply to the definitions of EEP A5-13-02 thru EEP A5-13-06. Different\n            telegrams received from that ID need to be distinguished by their 4 bit identifiers.",
  case: [
    {
      title: "0x01 Weather station",
      description: "",
      status: "released",
      condition: {
        datafield: {
          bitoffs: "24",
          bitsize: "4",
          value: "0x01"
        }
      },
      datafield: [{
        data: "LRN Bit",
        shortcut: "LRNB",
        description: "LRN Bit",
        bitoffs: "28",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "Teach-in telegram"
          }, {
            value: "1",
            description: "Data telegram"
          }]
        }
      }, {
        data: "Dawn sensor",
        shortcut: "DWS",
        description: "Dawn sensor",
        info: "DB_3 Dawn sensor 0 \u2026 999lx, linear n=0\u2026255",
        bitoffs: "0",
        bitsize: "8",
        range: {
          min: "0",
          max: "255"
        },
        scale: {
          min: "0",
          max: "999"
        },
        unit: "lx"
      }, {
        data: "Temperature",
        shortcut: "TMP",
        description: "Outdoor Temp",
        info: "DB_2: Outdoor Temp. -40\xB0C ... +80\xB0C, linear n=0\u2026255",
        bitoffs: "8",
        bitsize: "8",
        range: {
          min: "0",
          max: "255"
        },
        scale: {
          min: "-40",
          max: "+80"
        },
        unit: "\xB0C"
      }, {
        data: "Wind speed",
        shortcut: "WND",
        description: "Wind speed",
        info: "DB_1: Wind speed 0 ... 70m/s, linear n=0\u2026255",
        bitoffs: "16",
        bitsize: "8",
        range: {
          min: "0",
          max: "255"
        },
        scale: {
          min: "0",
          max: "70"
        },
        unit: "m/s"
      }, {
        data: "Identifier",
        shortcut: "ID",
        description: "Identifier",
        info: "DB_0.BIT_7 \u2026 4: Identifier",
        bitoffs: "24",
        bitsize: "4",
        enum: {
          item: {
            value: "0x1",
            description: {}
          }
        }
      }, {
        data: "Day / Night",
        shortcut: "D/N",
        description: "Day / Night",
        info: "DB_0.BIT_2: Day / Night",
        bitoffs: "29",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "Day"
          }, {
            value: "1",
            description: "Night"
          }]
        }
      }, {
        data: "Rain Indication",
        shortcut: "RAN",
        description: "Rain Indication",
        info: "DB_0.BIT_1: Rain Indication",
        bitoffs: "30",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "No Rain"
          }, {
            value: "1",
            description: "Rain"
          }]
        }
      }, {
        reserved: {},
        data: {},
        shortcut: {},
        description: {},
        info: {},
        bitoffs: "31",
        bitsize: "1"
      }]
    },
    {
      title: "0x02 Sun Intensity",
      description: "",
      status: "released",
      condition: {
        datafield: {
          bitoffs: "24",
          bitsize: "4",
          value: "0x02"
        }
      },
      datafield: [{
        data: "LRN Bit",
        shortcut: "LRNB",
        description: "LRN Bit",
        bitoffs: "28",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "Teach-in telegram"
          }, {
            value: "1",
            description: "Data telegram"
          }]
        }
      }, {
        data: "Sun \u2013 West",
        shortcut: "SNW",
        description: "Sun - West,linear",
        info: "DB_3: Sun \u2013 West 1klx \u2026 150klx, linear n=0\u2026255",
        bitoffs: "0",
        bitsize: "8",
        range: {
          min: "0",
          max: "255"
        },
        scale: {
          min: "0",
          max: "150"
        },
        unit: "klx"
      }, {
        data: "Sun \u2013 South",
        shortcut: "SNS",
        description: "Sun - South,linear",
        info: "DB_2: Sun \u2013 West 1klx \u2026 150klx, linear n=0\u2026255",
        bitoffs: "8",
        bitsize: "8",
        range: {
          min: "0",
          max: "255"
        },
        scale: {
          min: "0",
          max: "150"
        },
        unit: "klx"
      }, {
        data: "Sun \u2013 East",
        shortcut: "SNE",
        description: "Sun - East,linear",
        info: "DB_1: Sun \u2013 East 1klx \u2026 150klx, linear n=0\u2026255",
        bitoffs: "16",
        bitsize: "8",
        range: {
          min: "0",
          max: "255"
        },
        scale: {
          min: "0",
          max: "150"
        },
        unit: "klx"
      }, {
        data: "Identifier",
        shortcut: "ID",
        description: "Identifier",
        info: "DB_0.BIT_7 \u2026 4: Identifier",
        bitoffs: "24",
        bitsize: "4",
        enum: {
          item: {
            value: "0x2",
            description: {}
          }
        }
      }, {
        data: "Hemisphere",
        shortcut: "HEM",
        description: "0 = north / 1 = south, then swith Sun south to Sun North when in southern hemisphere",
        info: {},
        bitoffs: "29",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "North"
          }, {
            value: "1",
            description: "South"
          }]
        }
      }, {
        reserved: {},
        data: {},
        shortcut: {},
        description: "Not Used",
        info: {},
        bitoffs: "30",
        bitsize: "2"
      }]
    },
    {
      title: "0x03 Date Exchange",
      description: "",
      status: "released",
      condition: {
        datafield: {
          bitoffs: "24",
          bitsize: "4",
          value: "0x03"
        }
      },
      datafield: [{
        reserved: {},
        bitoffs: "0",
        bitsize: "3"
      }, {
        reserved: {},
        bitoffs: "8",
        bitsize: "4"
      }, {
        reserved: {},
        bitoffs: "16",
        bitsize: "1"
      }, {
        reserved: {},
        bitoffs: "29",
        bitsize: "2"
      }, {
        data: "LRN Bit",
        shortcut: "LRNB",
        description: "LRN Bit",
        bitoffs: "28",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "Teach-in telegram"
          }, {
            value: "1",
            description: "Data telegram"
          }]
        }
      }, {
        data: "Day",
        shortcut: "DY",
        description: "Day",
        info: "DB_3.BIT_4 \u2026 0: Day n=1 \u2026 31",
        bitoffs: "3",
        bitsize: "5",
        range: {
          min: "1",
          max: "31"
        },
        scale: {
          min: "1",
          max: "31"
        },
        unit: "N/A"
      }, {
        data: "Month",
        shortcut: "MTH",
        description: "Month (1->January)",
        info: "DB_2.BIT_3 \u2026 0: Month n=1 \u2026 12 1->January",
        bitoffs: "12",
        bitsize: "4",
        range: {
          min: "1",
          max: "12"
        },
        scale: {
          min: "1",
          max: "12"
        },
        unit: "N/A"
      }, {
        data: "Year",
        shortcut: "YR",
        description: "Year (0->Year 2000)",
        info: "DB_1.BIT_6 \u2026 0: Year n=0 \u2026 99",
        bitoffs: "17",
        bitsize: "7",
        range: {
          min: "0",
          max: "99"
        },
        scale: {
          min: "2000",
          max: "2099"
        },
        unit: "N/A"
      }, {
        data: "Identifier",
        shortcut: "ID",
        description: "Identifier",
        info: "DB_0.BIT_7 \u2026 4: Identifier",
        bitoffs: "24",
        bitsize: "4",
        enum: {
          item: {
            value: "0x3",
            description: {}
          }
        }
      }, {
        data: "Source",
        shortcut: "SRC",
        description: "Source",
        info: "DB_0.BIT_0: Source",
        bitoffs: "31",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "Real Time Clock"
          }, {
            value: "1",
            description: "GPS or equivalent (e.g. DCF77, WWV)"
          }]
        }
      }]
    },
    {
      title: "0x04 Time and Day Exchange",
      description: "",
      status: "released",
      condition: {
        datafield: {
          bitoffs: "24",
          bitsize: "4",
          value: "0x04"
        }
      },
      datafield: [{
        reserved: {},
        bitoffs: "8",
        bitsize: "2"
      }, {
        reserved: {},
        bitoffs: "16",
        bitsize: "2"
      }, {
        data: "LRN Bit",
        shortcut: "LRNB",
        description: "LRN Bit",
        bitoffs: "28",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "Teach-in telegram"
          }, {
            value: "1",
            description: "Data telegram"
          }]
        }
      }, {
        data: "Weekday",
        shortcut: "WDY",
        description: "Weekday (1 -> Monday)",
        info: "DB_3.BIT_7 \u2026 5: Weekday n=1 \u2026 7 1 -> Monday",
        bitoffs: "0",
        bitsize: "3",
        enum: {
          item: [{
            value: "1",
            description: "Monday"
          }, {
            value: "2",
            description: "Tuesday"
          }, {
            value: "3",
            description: "Wednesday"
          }, {
            value: "4",
            description: "Thursday"
          }, {
            value: "5",
            description: "Friday"
          }, {
            value: "6",
            description: "Saturday"
          }, {
            value: "7",
            description: "Sunday"
          }]
        }
      }, {
        data: "Hour",
        shortcut: "HR",
        description: "Hour",
        info: "DB_3.BIT_4 \u2026 0: Hour n=0 \u2026 23",
        bitoffs: "3",
        bitsize: "5",
        range: {
          min: "0",
          max: "23"
        },
        scale: {
          min: "0",
          max: "23"
        },
        unit: "N/A"
      }, {
        data: "Minute",
        shortcut: "MIN",
        description: "Minute",
        info: "DB_2.BIT_5 \u2026 0: Minute n=0 \u2026 59",
        bitoffs: "10",
        bitsize: "6",
        range: {
          min: "0",
          max: "59"
        },
        scale: {
          min: "0",
          max: "59"
        },
        unit: "N/A"
      }, {
        data: "Second",
        shortcut: "SEC",
        description: "Second",
        info: "DB_1.BIT_5 \u2026 0: Year n=0 \u2026 59",
        bitoffs: "18",
        bitsize: "6",
        range: {
          min: "0",
          max: "59"
        },
        scale: {
          min: "0",
          max: "59"
        },
        unit: "N/A"
      }, {
        data: "Identifier",
        shortcut: "ID",
        description: "Identifier",
        info: "DB_0.BIT_7 \u2026 4: Identifier",
        bitoffs: "24",
        bitsize: "4",
        enum: {
          item: {
            value: "0x4",
            description: {}
          }
        }
      }, {
        data: "Time Format",
        shortcut: "TMF",
        description: "Time Format",
        info: "DB_0.BIT_2: Time Format",
        bitoffs: "29",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "24 hours"
          }, {
            value: "1",
            description: "12 hours"
          }]
        }
      }, {
        data: "AM/PM",
        shortcut: "A/PM",
        description: "AM or PM",
        info: "DB_0.BIT_1: AM/PM",
        bitoffs: "30",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "AM"
          }, {
            value: "1",
            description: "PM"
          }]
        }
      }, {
        data: "Source",
        shortcut: "SRC",
        description: "Source",
        info: "DB_0.BIT_0: Source",
        bitoffs: "31",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "Real Time Clock"
          }, {
            value: "1",
            description: "GPS or equivalent (e.g. DCF77, WWV)"
          }]
        }
      }]
    },
    {
      title: "0x05 Direction Exchange",
      description: "",
      status: "released",
      condition: {
        datafield: {
          bitoffs: "24",
          bitsize: "4",
          value: "0x05"
        }
      },
      datafield: [{
        reserved: {},
        bitoffs: "29",
        bitsize: "3"
      }, {
        reserved: {},
        bitoffs: "8",
        bitsize: "7"
      }, {
        data: "LRN Bit",
        shortcut: "LRNB",
        description: "LRN Bit",
        bitoffs: "28",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "Teach-in telegram"
          }, {
            value: "1",
            description: "Data telegram"
          }]
        }
      }, {
        data: "Elevation",
        shortcut: "ELV",
        description: "Elevation (0\xB0 -> horizon)",
        info: "DB_3 Elevation -90\xB0 \u2026 +90\xB0, linear n=0\u2026180 0\xB0 ->Horizon",
        bitoffs: "0",
        bitsize: "8",
        range: {
          min: "0",
          max: "180"
        },
        scale: {
          min: "-90",
          max: "+90"
        },
        unit: "\xB0"
      }, {
        data: "Azimut",
        shortcut: "AZM",
        description: "Azimuth (0\xB0 -> True north; clockwise)",
        info: "DB_2.BIT_0: Azimut (MSB) 0\xB0 \u2026 359\xB0, linear n=0\u2026359 0\xB0 -> True north\n                DB_1: Azimut (LSB)",
        bitoffs: "15",
        bitsize: "9",
        range: {
          min: "0",
          max: "359"
        },
        scale: {
          min: "0",
          max: "359"
        },
        unit: "\xB0"
      }, {
        data: "Identifier",
        shortcut: "ID",
        description: "Identifier",
        info: "DB_0.BIT_7 \u2026 4: Identifier",
        bitoffs: "24",
        bitsize: "4",
        enum: {
          item: {
            value: "0x5",
            description: {}
          }
        }
      }]
    },
    {
      title: "0x06 Geographic Position Exchange",
      description: "",
      status: "released",
      condition: {
        datafield: {
          bitoffs: "24",
          bitsize: "4",
          value: "0x06"
        }
      },
      datafield: [{
        reserved: {},
        bitoffs: "29",
        bitsize: "3"
      }, {
        data: "LRN Bit",
        shortcut: "LRNB",
        description: "LRN Bit",
        bitoffs: "28",
        bitsize: "1",
        enum: {
          item: [{
            value: "0",
            description: "Teach-in telegram"
          }, {
            value: "1",
            description: "Data telegram"
          }]
        }
      }, {
        data: "Latitude",
        shortcut: "LAT",
        description: "Latitude",
        info: "combined Latitude from MSB+LSB",
        spread: [
          {
            bitoffs: 0,
            bitsize: 4
          },
          {
            bitoffs: 8,
            bitsize: 8
          }
        ],
        range: {
          min: 0,
          max: 4095
        },
        scale: {
          min: -90,
          max: 90
        },
        unit: "\xB0"
      }, {
        data: "Longitude",
        shortcut: "LOT",
        description: "Longitude",
        info: "combined Longitude from MSB+LSB",
        spread: [
          {
            bitoffs: 4,
            bitsize: 4
          },
          {
            bitoffs: 16,
            bitsize: 8
          }
        ],
        range: {
          min: 0,
          max: 4095
        },
        scale: {
          min: -180,
          max: 180
        },
        unit: "\xB0"
      }, {
        data: "Identifier",
        shortcut: "ID",
        description: "Identifier",
        info: "DB_0.BIT_7 \u2026 4: Identifier",
        bitoffs: "24",
        bitsize: "4",
        enum: {
          item: {
            value: "0x6",
            description: {}
          }
        }
      }]
    }
  ],
  originalIndex: 107,
  eep: "a5-13-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Environmental Applications",
  func_number: "0x13",
  submitter: []
};

// ../eep-transcoder/eep/a5-13-02.js
var a51302 = {
  number: "0x02",
  title: "Sun Intensity",
  status: "released",
  description: "",
  ref: "a5-13-01",
  originalIndex: 108,
  eep: "a5-13-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Environmental Applications",
  func_number: "0x13",
  submitter: [
    "Elsner electronics"
  ]
};

// ../eep-transcoder/eep/a5-13-03.js
var a51303 = {
  number: "0x03",
  title: "Date Exchange",
  status: "released",
  description: "",
  ref: "a5-13-01",
  originalIndex: 109,
  eep: "a5-13-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Environmental Applications",
  func_number: "0x13",
  submitter: [
    "Elsner electronics"
  ]
};

// ../eep-transcoder/eep/a5-13-04.js
var a51304 = {
  number: "0x04",
  title: "Time and Day Exchange",
  status: "released",
  description: "\n          <br/>\n          <br/>\n          Recommendation: always transmit time in 24 hrs format",
  ref: "a5-13-01",
  originalIndex: 110,
  eep: "a5-13-04",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Environmental Applications",
  func_number: "0x13",
  submitter: [
    "Elsner electronics"
  ]
};

// ../eep-transcoder/eep/a5-13-05.js
var a51305 = {
  number: "0x05",
  title: "Direction Exchange",
  status: "released",
  ref: "a5-13-01",
  originalIndex: 111,
  eep: "a5-13-05",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Environmental Applications",
  func_number: "0x13",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-13-06.js
var a51306 = {
  number: "0x06",
  title: "Geographic Position Exchange",
  status: "released",
  ref: "a5-13-01",
  originalIndex: 112,
  eep: "a5-13-06",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Environmental Applications",
  func_number: "0x13",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-13-07.js
var a51307 = {
  number: "0x07",
  title: "Wind Sensor",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>This profile provides wind sensor information.\n            <br/>That includes the current wind direction, the average and the\n            maximum wind speed.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: time-triggered\n            <br/>Communication interval: 33 seconds\n            <br/>Trigger event: timer\n            <br/>Tx delay: N/A\n            <br/>Rx timeout: N/A\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 1\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: N/A',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Wind Direction",
      shortcut: "WD",
      description: "Shows the current wind direction",
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "NNE"
        }, {
          value: "1",
          description: "NE"
        }, {
          value: "2",
          description: "ENE"
        }, {
          value: "3",
          description: "E"
        }, {
          value: "4",
          description: "ESE"
        }, {
          value: "5",
          description: "SE"
        }, {
          value: "6",
          description: "SSE"
        }, {
          value: "7",
          description: "S"
        }, {
          value: "8",
          description: "SSW"
        }, {
          value: "9",
          description: "SW"
        }, {
          value: "10",
          description: "WSW"
        }, {
          value: "11",
          description: "W"
        }, {
          value: "12",
          description: "WNW"
        }, {
          value: "13",
          description: "NW"
        }, {
          value: "14",
          description: "NNW"
        }, {
          value: "15",
          description: "N"
        }]
      }
    }, {
      data: "Average Wind Speed",
      shortcut: "AWS",
      description: "Linear average wind speed",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "1",
        max: "199.9"
      },
      unit: "mph"
    }, {
      data: "Maximum Wind Speed",
      shortcut: "MWS",
      description: "Maximum wind speed",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "1",
        max: "199.9"
      },
      unit: "mph"
    }, {
      data: "Battery Status",
      shortcut: "BS",
      description: "Indicates if the battery is low",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Battery okay"
        }, {
          value: "1",
          description: "Battery low"
        }]
      }
    }]
  }],
  originalIndex: 113,
  eep: "a5-13-07",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Environmental Applications",
  func_number: "0x13",
  submitter: [
    "Hideki Electronics Limited"
  ]
};

// ../eep-transcoder/eep/a5-13-08.js
var a51308 = {
  number: "0x08",
  title: "Rain Sensor",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>This profile provides rain sensor information.\n            <br/>That includes the current rainfall count value and the rainfall count correction.\n            <br/>Using these values, the receiver of the information can calculate the currently\n                 measured amount of rainfall.\n            <br/>\n            <br/>Rainfall = (Rainfall Count x 0.6875 mm) x (1+ (Rainfall Adjust Sign) Rainfall Adjust)\n            <br/>\n            <br/>Example:\n            <br/>Rainfall Count = 10\n            <br/>Rainfall Adjust = 26\n            <br/>Rainfall Adjust Sign = 1\n            <br/>Rainfall = 10 x 0.6875 mm X (1 + 2.6/100) = 7.05375 mm\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: time-triggered\n            <br/>Communication interval: 183 seconds\n            <br/>Trigger event: timer\n            <br/>Tx delay: N/A\n            <br/>Rx timeout: N/A\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 1\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: N/A',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Rainfall Adjust Sign",
      shortcut: "RAS",
      description: "Provides the sign of the rainfall adjust value",
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Negative"
        }, {
          value: "1",
          description: "Positive"
        }]
      }
    }, {
      data: "Rainfall Adjust",
      shortcut: "RFA",
      description: "Provides the rainfall count correction value",
      info: {},
      bitoffs: "2",
      bitsize: "6",
      enum: {
        item: [{
          min: "0",
          max: "39",
          scale: {
            min: "0",
            max: "3.9"
          },
          unit: "%"
        }, {
          min: "40",
          max: "63",
          description: "Reserved"
        }]
      }
    }, {
      data: "Rainfall Count",
      shortcut: "RFC",
      description: "Number of counted rain drops",
      info: {},
      bitoffs: "8",
      bitsize: "16",
      range: {
        min: "0",
        max: "65535"
      },
      scale: {
        min: "0",
        max: "65535"
      },
      unit: {}
    }, {
      data: "Battery Status",
      shortcut: "BS",
      description: "Indicates if the battery is low",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Battery okay"
        }, {
          value: "1",
          description: "Battery low"
        }]
      }
    }]
  }],
  originalIndex: 114,
  eep: "a5-13-08",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Environmental Applications",
  func_number: "0x13",
  submitter: [
    "Hideki Electronics Limited"
  ]
};

// ../eep-transcoder/eep/a5-13-10.js
var a51310 = {
  number: "0x10",
  title: "Sun position and radiation",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Day / Night",
      shortcut: "D/N",
      description: "Day / Night",
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Day"
        }, {
          value: "1",
          description: "Night"
        }]
      }
    }, {
      data: "Sun Elevation",
      shortcut: "SNE",
      description: "Sun Elevation (linear); <br/>91 - 127: reserved",
      info: {},
      bitoffs: "0",
      bitsize: "7",
      range: {
        min: "0",
        max: "90"
      },
      scale: {
        min: "0",
        max: "90"
      },
      unit: "\xB0"
    }, {
      data: "Sun Azimuth",
      shortcut: "SNA",
      description: "Sun Azimuth<br/>181 - 255: reserved",
      info: {},
      bitoffs: 8,
      bitsize: 8,
      range: {
        min: 0,
        max: 180
      },
      scale: {
        min: -90,
        max: 90
      },
      unit: "\xB0"
    }, {
      data: "Solar Radiation",
      shortcut: "SRA",
      description: "Solar Radiation",
      info: {},
      spread: [
        {
          bitoffs: 16,
          bitsize: 8
        },
        {
          bitoffs: 29,
          bitsize: 3
        }
      ],
      range: {
        min: 0,
        max: 2e3
      },
      unit: "W/m2"
    }, {
      data: "Identifier",
      shortcut: "ID",
      description: "Identifier",
      info: {},
      bitoffs: "24",
      bitsize: "4",
      enum: {
        item: {
          value: "0x7",
          description: {}
        }
      }
    }]
  }],
  originalIndex: 115,
  eep: "a5-13-10",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Environmental Applications",
  func_number: "0x13",
  submitter: [
    "NanoSense"
  ]
};

// ../eep-transcoder/eep/a5-14-01.js
var a51401 = {
  number: "0x01",
  title: "Single Input Contact (Window/Door), Supply voltage monitor",
  status: "released",
  description: "<br/><br/>\n          Purpose (eg): Ventilation, Lighting, Alarm",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage / super cap. (linear);<br/>\n            251 \u2013 255 reserved for error code",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "20"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "Contact",
      shortcut: "CT",
      description: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Contact closed"
        }, {
          value: "0b1",
          description: "Contact open"
        }]
      }
    }]
  }],
  originalIndex: 116,
  eep: "a5-14-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Multi-Func Sensor",
  func_number: "0x14",
  submitter: [
    "Lutuo Technology"
  ]
};

// ../eep-transcoder/eep/a5-14-02.js
var a51402 = {
  number: "0x02",
  title: "Single Input Contact (Window/Door), Supply voltage monitor and Illumination",
  status: "released",
  description: "<br/><br/>\n          Purpose (eg): Ventilation, Lighting, Alarm",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage / super cap. (linear);\n                <br/>251 \u2013 255 reserved for error code",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear);\n                <br/>251 \u2013 over range, 252 - 255 reserved",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "1000"
      },
      unit: "lx"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "12"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "Contact",
      shortcut: "CT",
      description: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Contact closed"
        }, {
          value: "0b1",
          description: "Contact open"
        }]
      }
    }]
  }],
  originalIndex: 117,
  eep: "a5-14-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Multi-Func Sensor",
  func_number: "0x14",
  submitter: [
    "Lutuo Technology"
  ]
};

// ../eep-transcoder/eep/a5-14-03.js
var a51403 = {
  number: "0x03",
  title: "Single Input Contact (Window/Door), Supply voltage monitor and Vibration",
  status: "released",
  description: "<br/><br/>\n          Purpose (eg): Ventilation\uFF0CLighting\uFF0CAlarm \uFF0CIntrusion (breakage of glass),\n          Calling system",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage / super cap. (linear);\n                <br/>251 \u2013 255 reserved for error code",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "20"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "Vibration",
      shortcut: "VIB",
      description: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "No vibration detected"
        }, {
          value: "0b1",
          description: "Vibration detected"
        }]
      }
    }, {
      data: "Contact",
      shortcut: "CT",
      description: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Contact closed"
        }, {
          value: "0b1",
          description: "Contact open"
        }]
      }
    }]
  }],
  originalIndex: 118,
  eep: "a5-14-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Multi-Func Sensor",
  func_number: "0x14",
  submitter: [
    "Lutuo Technology"
  ]
};

// ../eep-transcoder/eep/a5-14-04.js
var a51404 = {
  number: "0x04",
  title: "Single Input Contact (Window/Door), Supply voltage monitor, Vibration and Illumination",
  status: "released",
  description: "<br/><br/>\n          Purpose (eg): Ventilation\uFF0CLighting\uFF0CAlarm \uFF0CIntrusion (breakage of glass), Calling system",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage / super cap. (linear);\n                <br/>251 \u2013 255 reserved for error code",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear);\n                <br/>251 \u2013 over range, 252 - 255 reserved",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "1000"
      },
      unit: "lx"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "12"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      data: "Vibration",
      shortcut: "VIB",
      description: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "No vibration detected"
        }, {
          value: "0b1",
          description: "Vibration detected"
        }]
      }
    }, {
      data: "Contact",
      shortcut: "CT",
      description: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Contact closed"
        }, {
          value: "0b1",
          description: "Contact open"
        }]
      }
    }]
  }],
  originalIndex: 119,
  eep: "a5-14-04",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Multi-Func Sensor",
  func_number: "0x14",
  submitter: [
    "Lutuo Technology"
  ]
};

// ../eep-transcoder/eep/a5-14-05.js
var a51405 = {
  number: "0x05",
  title: "Vibration/Tilt, Supply voltage monitor",
  status: "released",
  description: "<br/><br/>\n          Purpose (eg): Intrusion (breakage of glass), Calling system",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage / super cap. (linear);\n                <br/>251 \u2013 255 reserved for error code",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "20"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "31",
      bitsize: "1"
    }, {
      data: "Vibration",
      shortcut: "VIB",
      description: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "No vibration detected"
        }, {
          value: "0b1",
          description: "Vibration detected"
        }]
      }
    }]
  }],
  originalIndex: 120,
  eep: "a5-14-05",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Multi-Func Sensor",
  func_number: "0x14",
  submitter: [
    "Lutuo Technology"
  ]
};

// ../eep-transcoder/eep/a5-14-06.js
var a51406 = {
  number: "0x06",
  title: "Vibration/Tilt, Illumination and Supply voltage monitor",
  status: "released",
  description: "<br/><br/>\n          Purpose (eg): Intrusion (breakage of glass), Calling system",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage / super cap. (linear);\n                <br/>251 \u2013 255 reserved for error code",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      data: "Illumination",
      shortcut: "ILL",
      description: "Illumination (linear);\n                <br/>251 \u2013 over range, 252 - 255 reserved",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "1000"
      },
      unit: "lx"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "12"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "31",
      bitsize: "1"
    }, {
      data: "Vibration",
      shortcut: "VIB",
      description: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "No vibration detected"
        }, {
          value: "0b1",
          description: "Vibration detected"
        }]
      }
    }]
  }],
  originalIndex: 121,
  eep: "a5-14-06",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Multi-Func Sensor",
  func_number: "0x14",
  submitter: [
    "Lutuo Technology"
  ]
};

// ../eep-transcoder/eep/a5-14-0a.js
var a5140a = {
  number: "0x0a",
  title: "Window/Door-Sensor with States Open/Closed/Tilt, Supply voltage monitor and Vibrationdetection",
  status: "released",
  description: "<br/><br/>\n          Purpose (eg): Ventilation\uFF0CLighting\uFF0CAlarm \uFF0CIntrusion (breakage of glass),\n          Calling system",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage / super cap. (linear);\n                <br/>251 \u2013 255 reserved for error code",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "5.0"
      },
      unit: "V"
    }, {
      data: "Vibration",
      shortcut: "VIB",
      description: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "No vibration detected"
        }, {
          value: "0b1",
          description: "Vibration detected"
        }]
      }
    }, {
      data: "Contact",
      shortcut: "CT",
      description: {},
      bitoffs: "29",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Closed"
        }, {
          value: "1",
          description: "Tilt"
        }, {
          value: "3",
          description: "Open"
        }]
      }
    }]
  }],
  originalIndex: 118,
  eep: "a5-14-0a",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Multi-Func Sensor",
  func_number: "0x14",
  submitter: [
    "EiMSIG eine Marke der EFP GmbH"
  ]
};

// ../eep-transcoder/eep/a5-20-01.js
var a52001 = {
  number: "0x01",
  title: "Battery Powered Actuator",
  status: "released",
  description: "max. reponse time 1 sec.",
  case: [{
    direction: "1",
    title: "Transmit mode",
    description: "Message from the actuator to the controller",
    condition: {
      direction: "1"
    },
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Current Value",
      shortcut: "CV",
      description: "Current value",
      info: "actual value 0...100 %, linear n=0...100",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Service On",
      shortcut: "SO",
      description: "Service On",
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "off"
        }, {
          value: "1",
          description: "on"
        }]
      }
    }, {
      data: "Energy input enabled",
      shortcut: "ENIE",
      description: "Energy input enabled",
      info: {},
      bitoffs: "9",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Energy Storage",
      shortcut: "ES",
      description: "Energy storage sufficiently charged",
      info: {},
      bitoffs: "10",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Battery capacity",
      shortcut: "BCAP",
      description: "Battery capacity; change battery next days",
      info: {},
      bitoffs: "11",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "true"
        }, {
          value: "1",
          description: "false"
        }]
      }
    }, {
      data: "Contact, cover open",
      shortcut: "CCO",
      description: "Contact, cover open",
      info: {},
      bitoffs: "12",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Failure temperature sensor, out off range",
      shortcut: "FTS",
      description: "Failure Temperature sensor, out off range",
      info: {},
      bitoffs: "13",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Detection, window open",
      shortcut: "DWO",
      description: "Detection, window open",
      info: {},
      bitoffs: "14",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Actuator obstructed",
      shortcut: "ACO",
      description: "Actuator obstructed",
      info: {},
      bitoffs: "15",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "DB_1: Temperature 0...40\xB0C, linear n=0...255 Min.=0 ; Max.=255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }, {
    direction: "2",
    title: "Receive mode",
    description: "Commands from the controller to the actuator",
    condition: {
      direction: "2"
    },
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Valve position or Temperature Setpoint",
      shortcut: "SP",
      description: "Valve position or Temperature set point (linear); selection with DB1.2. Valve position 0\u2026100% in combination with compatible classic controllers the actuator used DB_3; Temperature set point: The actuator can be used as self-sufficient room controller (pi controller) without integration in automation systems. Wherever the user wants room conditions to be individually controlled, the actuator can work in combination with a wireless room device (RCU).",
      info: "",
      bitoffs: "0",
      bitsize: "8",
      range: {
        ref: "SPS"
      },
      scale: {
        ref: "SPS"
      },
      unit: {
        ref: "SPS"
      }
    }, {
      data: "Temperature  from RCU",
      shortcut: "TMP",
      description: 'Temperature actual from RCU = 0b0 (Room controller-unit), see DB1.0. Maintenance mode ("service on"): DB_2.BIT_5: energy memory sufficiently charged =1 DB_2.BIT_4: battery capacity changing battery in the next days, need changing batteries = 0<br/><br/>Status feedback signal (service on, DB_2.BIT_7)',
      info: "",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "40"
      },
      unit: "\xB0C"
    }, {
      data: "Run init sequence",
      shortcut: "RIN",
      description: "The limit switching measures the travel and signals when an end position has been reached. This end position (valve zero point) in the actuator is stored.",
      info: "",
      bitoffs: "16",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Lift set",
      shortcut: "LFS",
      description: "Initialization, adjustment to the valve stroke. The Initialization is switched after receiving the command. The valve is completely opened and closed during initialization.",
      info: "",
      bitoffs: "17",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Valve open / maintenance",
      shortcut: "VO",
      description: "After receiving an operation command, the actuator moves the valve in direction open or close.\nwhen reaching the end position, an automatic switch-off procedure is started. In service mode the valve\ncan be set to open or closed always.",
      info: "",
      bitoffs: "18",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Valve closed",
      shortcut: "VC",
      description: "valve closed",
      info: {},
      bitoffs: "19",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Summer bit, Reduction of energy consumption",
      shortcut: "SB",
      description: "The radio communication between the actuator and the controller is restricted, sleep mode is extended. This functionality can be used for battery powered actuators.",
      info: {},
      bitoffs: "20",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "false"
        }, {
          value: "1",
          description: "true"
        }]
      }
    }, {
      data: "Set Point Selection",
      shortcut: "SPS",
      description: "Set Point Selection",
      info: {},
      bitoffs: "21",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          scale: {
            min: 0,
            max: 100
          },
          range: {
            min: 0,
            max: 100
          },
          unit: "%",
          description: "Valve position (0-100%), linear n=0...100. Unit respond to controller."
        }, {
          value: "1",
          scale: {
            min: 0,
            max: 40
          },
          range: {
            min: 0,
            max: 255
          },
          unit: "\xB0C",
          description: "Temperature set point 0...40\xB0C, linear n=0...255. Unit respond to room sensor and use internal PI loop."
        }]
      }
    }, {
      data: "Set point inverse",
      shortcut: "SPN",
      description: "Valve set point can be sent to the actuator normal or inverted.\nThe selection is done by DB_1.Bit1. The implementation is done and is controlled in the actuator with DB_3. This function is used in dependence on the type of valve.",
      info: {},
      bitoffs: "22",
      bitsize: "1",
      enum: {
        item: [
          {
            value: "0",
            description: "false"
          },
          {
            value: "1",
            description: "true"
          }
        ]
      }
    }, {
      data: "Select function",
      shortcut: "RCU",
      description: 'RCU or "Service on": After transmitting the command to the actuator, it can be send from the controller or a\nservice device, the actuator sends a status feedback signal (service on, DB_2.BIT_7).',
      info: {},
      bitoffs: "23",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "RCU"
        }, {
          value: "1",
          description: "service on"
        }]
      }
    }]
  }],
  originalIndex: 122,
  eep: "a5-20-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "HVAC Components",
  func_number: "0x20",
  submitter: [
    "Kieback + Peter GmbH"
  ]
};

// ../eep-transcoder/eep/a5-20-02.js
var a52002 = {
  number: "0x02",
  title: "Basic Actuator",
  status: "released",
  description: "<br/><br/>\n            Basic Actuator can be used by any manufacturer for linear or rotary actuator.\n            <br/><br/>\n            DIRECTION-1 = Transmit mode: Message from the actuator to the controller.\n            <br/>\n            DIRECTION-2 = Receive mode: Commands from the controller to the actuator.\n            To use with a BAS/Gateway system; max. reponse time 1 sec.",
  case: [{
    direction: "1",
    condition: {
      direction: "1"
    },
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "14"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Actual Value",
      shortcut: "AV",
      description: "Actual value (linear); can be a linear or rotation motion.",
      info: "Transmit status (sent every time there is a positioning or randomly sent every 15-\n                  20 minutes if no change in position. \u201CHeartbeat\u201D)\n                  DB_3: % open value 0...100 %, linear n=0...255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Set point inverse",
      shortcut: "SPI",
      description: "Set point inverse (Needs to be defined by manufacturer what zero(0) is equal to, and one(1) is equal to. Default state to be define as per product manufacturer",
      info: "DB_1.BIT_1: Set point inverse. Needs to be defined by manufacturer what zero(0) is equal to, and\n                  one(1) is equal to.",
      bitoffs: "22",
      bitsize: "1",
      enum: {
        item: {
          value: "1",
          description: "true"
        }
      }
    }]
  }, {
    direction: "2",
    condition: {
      direction: "2"
    },
    datafield: [{
      data: {},
      shortcut: {},
      description: {},
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "6"
    }, {
      reserved: {},
      bitoffs: "23",
      bitsize: "5"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Valve Set point",
      shortcut: "VSP",
      description: "Valve set Point (linear)",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Set point inverse",
      shortcut: "VSP",
      description: '"Set point inverse" needs to be defined by manufacturer what zero(0) is equal to, and one(1) is equal to. Default state to be define as per product manufacturer. It can send a command to invert functionality of the unit. In some instance some equipment might need 100% to represent fully extracted, in other fully retracted.',
      info: {},
      bitoffs: "22",
      bitsize: "1",
      enum: {
        item: {
          value: "1",
          description: "true"
        }
      }
    }]
  }],
  originalIndex: 123,
  eep: "a5-20-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "HVAC Components",
  func_number: "0x20",
  submitter: [
    "Spartan Peripheral Devices"
  ]
};

// ../eep-transcoder/eep/a5-20-03.js
var a52003 = {
  number: "0x03",
  title: "Line powered Actuator",
  status: "released",
  description: "<br/><br/>\n          DIRECTION-1 = Transmit mode: Message from the actuator to the controller.\n          <br/>\n          DIRECTION-2 = Receive mode: Commands from the controller to the actuator;\n          max. reponse time 1 sec.",
  case: [{
    direction: "1",
    condition: {
      direction: "1"
    },
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Actual valve",
      shortcut: "AV",
      description: "Actual valve",
      info: "Transmit status (sent every time there is a positioning or randomly sent every 15-\n                20 minutes if no change in position. \u201CHeartbeat\u201D)\n                DB_3: % open value 0...100 %, linear n=0...255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "Receive: DB_1: Temperature 0-40 deg C. linear n=255\u20260",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }, {
    direction: "2",
    condition: {
      direction: "2"
    },
    datafield: [{
      reserved: {},
      bitoffs: "16",
      bitsize: "5"
    }, {
      reserved: {},
      bitoffs: "23",
      bitsize: "5"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "Set Point Inverse",
      shortcut: {},
      description: "Valve set point can be sent to the actuator normal or inverted through BAS/Gateway controller.\nThe selection is done by DB_1.Bit1. in the actuator with DB_3. This function is used in dependence on the\ntype of valve.",
      info: {},
      bitoffs: "22",
      bitsize: "1",
      enum: {
        item: {
          value: "1",
          description: "true"
        }
      }
    }, {
      data: "Set Point Selection",
      shortcut: "SPS",
      description: "Set Point Selection for DB3",
      info: {},
      bitoffs: "21",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Actuator Setpoint (0-100%); Unit respond to controller."
        }, {
          value: "1",
          description: "Temperature Setpoint 0...+40\xB0C; Unit respond to room sensor and use internal PI loop."
        }]
      }
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Actuator or Temperature Setpoint",
      shortcut: "ATS",
      description: "Actuator Setpoint: in combination with BAS/Gateway controllers.<br/><br/>Temperature Setpoint: The actuator can be used as self-sufficient room controller (pi controller) without integration\nin automation systems. Wherever the user wants room conditions to be individually controlled,\nthe actuator can work in combination with a wireless room device (RCU).",
      info: "DB_3: Valve set point 0...100 %, linear n=0...100\n                Temperature set point 0...40\xB0C, linear n=0...255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "100 or 255"
      },
      scale: {
        min: "0",
        max: "100 or +40"
      },
      unit: "% or \xB0C"
    }, {
      data: "Temperature  from RCU",
      shortcut: "TMPRC",
      description: "Temperature actual from RCU = 0b0 (Room controller-unit)",
      info: "Temperature actual from RCU = 0b0, Room controller-unit \u2026\n                0...40\xB0C, linear n=255...0",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }],
  originalIndex: 124,
  eep: "a5-20-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "HVAC Components",
  func_number: "0x20",
  submitter: [
    "Spartan Peripheral Devices"
  ]
};

// ../eep-transcoder/eep/a5-20-04.js
var a52004 = {
  number: "0x04",
  title: "Heating Radiator Valve Actuating Drive with Feed and Room Temperature Measurement, Local Set Point Control and Display",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>The following document describes the communication between a controller\n            and an intelligent heating radiator valve actuating drive with the following features:\n            <ul>\n            <li>Feed temperature measurement</li>\n            <br/>\n            <li>Room temperature measurement</li>\n            <br/>\n            <li>Current position feedback</li>\n            <br/>\n            <li>Display</li>\n            <br/>\n            <li>Button</li>\n            <br/>\n            <li>On device temperature set point selection</li>\n            <br/>\n            </ul>\n            In order to be able to process this information and control the actuator,\n            every command has been included in this document. Each customer can use\n            his own controller by implementing the EEP of this document.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: bidirectional\n            <br/>Addressing: unicast (ADT)\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: can be configured by the controller\n            <br/>Trigger event: a trigger event occurs when the button is pressed\n            or the local set point is used\n            <br/>Tx delay: 550 ms is the maximum response time for Smart-Ack Devices\n            and 1100 ms for devices which use the 4BS teach-in method\n            <br/>Rx timeout: just 1 message per wake-up cycle\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: Smart-Ack teach-in and 4BS teach-in Variation 3\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Telegram Description of Direction 1</span>\n            (Transmit mode / Message from the actuator to the controller)\n            <br/>\n            <br/>\n            This direction initializes the communication, shares the needed\n            data and waits for an answer from the controller.\n            This allows the device to work in deep sleep mode the rest of the time.\n            <br/>\n            <br/>Each message from the actuator contains the following information:\n            <ul>\n            <li>Current Position (CP)\n            <br/>The current position is a feedback value from the actuator.\n            It indicates the actual per cent position of the valve.\n            The value 0 % means that the valve is completely closed and 100 %\n            completely open. The controller can use this information for the room\n            temperature regulation.</li>\n            </ul>\n            <ul><li>Temperature Set Point OR Feed Temperature (FTS)*\n            <br/>\n            * This byte is shared by the Temperature Set Point and the Feed\n            Temperature value. Only one of these values is sent in the same message.\n            Which value is transmitted is indicated by DB0.1 (TS bit).\n            <br/>\n            The feed temperature is the water temperature in the radiator input,\n            which can be useful for implementing several features in the home\n            automation system.\n            <br/>\n            The temperature set point is only sent when the user specifies a new\n            room temperature by using the local temperature set point on the device.\n            </li></ul>\n            <ul><li>Room Temperature (TMP) OR Failure Code (FC)*\n            <br/>\n            * This byte is shared by the Room Temperature and Failure Code Value.\n            Only one of these values is sent in the same message.\n            The value transmitted is indicated by DB0.0 (FL).\n            By default it is the room temperature.\n            <br/>\n            The room temperature is the ambient temperature of the place in which\n            the device is used and is measured by the actuator.\n            This value is transmitted if no error occurred.\n            <br/>\n            The Failure Code is transmitted instead of the Room Temperature\n            if an error occurs.\n            </li></ul>\n            <ul><li>Measurement Status (MST)\n            <br/>\n            The temperature measurements (room and feed temperature) can be\n            deactivated in order to reduce the energy consumption.\n            This can be specified only by the controller i.e. to implement\n            summer mode or to replace the internal room temperature measurement\n            of the actuator by an external one.\n            </li></ul>\n            <ul><li>Status Request (SRT)\n            <br/>\n            The status request bit can be used to ask the controller about its\n            status. If the controller does not send back the correct reply, the\n            actuator will start its own room temperature regulation.\n            With this feature, a frozen actuator would not interrupt the room\n            temperature regulation.\n            </li></ul>\n            <ul><li>Teach-in Bit (LRNB)\n            <br/>\n            For establishing the radio link between the controller and the actuator,\n            a teachin message has to be sent from the actuator to the controller.\n            If the binary value 0 is transmitted, the message will be identified\n            as a teach-in one and will allow the controller to receive the\n            EnOcean-ID of the actuator.\n            </li></ul>\n            <ul><li>Button Lock Status (BLS)\n            <br/>\n            The button lock status can be set by the controller. This enables or\n            disables the manual room temperature selection. If locked, the manual\n            room temperature selection on the actuator will be disabled and the\n            user will be notified with a symbol on the display.\n            </li></ul>\n            <ul><li>Temperature Selection (TS)\n            <br/>\n            If the user specifies a temperature set point manually on the device,\n            this will be sent to the controller and indicated on the temperature\n            selection field (TS). It can indicate that the field FTS contains the\n            temperature set point (binary value = 1) or the feed temperature\n            (binary value = 0).\n            </li></ul>\n            <ul><li>Failure (FL)\n            <br/>\n            Indicates the occurrence of a failure. The room temperature value is\n            replaced by the failure code if the bit FL has the binary value 1.\n            </li></ul>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Telegram Description of Direction 2</span>\n            (Receive mode / Commands from the controller to the actuator)\n            <br/>\n            <br/>\n            The messages from the controller to the actuator are sent in this direction.\n            A message in this direction has to be sent after receiving a message from\n            the actuator, in order to achieve a successful communication.\n            If the controller message is not received by the actuator in a specific\n            time after a direction 1 message, no information will be received by\n            the actuator. The time that the actuator will wait for a reply is defined\n            by the Smart-Ack Teach-In process. For controllers which cannot use\n            Smart-Ack, the 4BS Teach-in Variation 3 has to be used, with a maximum\n            response time of 1100 ms.\n            <br/>\n            <br/>Each message from the controller contains the following information:\n            <ul><li>\n            Valve Position (POS)\n            <br/>\n            The valve position is a set point position for the valve.\n            It indicates the per cent position of the valve, which the actuator\n            has to reach. The value 0 % means that the valve is completely closed\n            and 100 % completely open. The controller should be able to regulate\n            the room temperature by adjusting this value.\n            </li></ul>\n            <ul><li>\n            Temperature Set Point (TSP)\n            <br/>\n            The controller can send the temperature set point to the actuator in\n            order to allow the user to see the actual specified temperature in\n            the device display. This value does not affect room temperature regulation.\n            </li></ul>\n            <ul><li>\n            Measurement Control (MC)\n            <br/>\n            The temperature measurements (room and feed temperature) can be\n            deactivated in order to reduce energy consumption. This can be specified\n            only by the controller i.e. to implement summer mode or to replace\n            the internal room temperature measurement by the device with an\n            external one. The measurement control bit enables the controller to\n            activate or deactivate the measurements.\n            </li></ul>\n            <ul><li>\n            Wake-up Cycle (WUC)\n            <br/>\n            To save energy, the actuator works in deep sleep mode the most of the\n            time. Nevertheless it has to wake up to communicate with the controller\n            and to reach the valve position specified by the controller.\n            The longer the actuator remains in deep sleep mode, the more energy\n            efficient will be your batteries. If fast response is required, the\n            actuator has to communicate more frequently with the controller and\n            that is why it should use a shorter wake-up cycle. If a fast room\n            temperature control is not required, the wake-up cycle should be set\n            by the controller as long as possible.\n            </li></ul>\n            <ul><li>\n            Display Orientation (DSO)\n            <br/>\n            The heater valves can be installed in different directions.\n            That is why it can be useful to have the option to choose the fitting\n            display orientation. This feature makes reading the display easier.\n            </li></ul>\n            <ul><li>\n            Teach-in Bit (LRNB)\n            <br/>\n            For establishing a radio link between the controller and the actuator,\n            a teach-in telegram has to be sent from the controller to the actuator.\n            If the binary value 0 is transmitted, the message will be identified\n            as a teach-in one and will allow the device to receive the EnOcean-ID\n            from the controller.\n            </li></ul>\n            <ul><li>\n            Button Lock Control (BLS)\n            <br/>\n            The button lock status can be set by the controller. This enables or\n            disables the manual room temperature selection. If locked, the manual\n            room temperature selection on the actuator will be disabled and the\n            user will be notified with a symbol on the display.\n            </li></ul>\n            <ul><li>\n            Service Command (SER)\n            <br/>\n            In order to adapt the actuator to a new valve, the controller can\n            order the execution of some functions of the actuator:\n            <br/>\n            - run initialisation: This function has to be executed for adapting\n            the actuator to the length of the valve stroke.\n            <br/>\n            - open valve: To facilitate the installation or maintenance of the\n            valve, the actuator can open the valve completely.\n            After completely opening the valve it is necessary to run the initialisation.\n            <br/>\n            - close valve: Completely close the valve.\n            </li></ul>',
  case: [{
    direction: "1",
    condition: {
      direction: "1"
    },
    datafield: [{
      reserved: {},
      bitoffs: "26",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Current Position",
      shortcut: "CP",
      description: "Current valve position",
      info: "",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Feed Temperature OR Temperature Set Point",
      shortcut: "FTS",
      description: "Either current feed temperature value or temperature\n              set point (defined by DB0.1)",
      info: "",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "20 .. 80",
        max: "10 .. 30"
      },
      unit: "\xB0C"
    }, {
      data: "Room Temperature OR Failure Code",
      shortcut: "TMPFC",
      description: "Current room temperature value (10...30\xB0C) OR Failure Code (Enum)",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "255",
          scale: {
            min: "10",
            max: "30"
          },
          unit: "\xB0C"
        }, {
          value: "00 ... 16",
          description: "Reserved"
        }, {
          value: "17",
          description: "Measurement error"
        }, {
          value: "18",
          description: "Battery empty"
        }, {
          value: "19",
          description: "Reserved"
        }, {
          value: "20",
          description: "Frost protection"
        }, {
          value: "21 ... 32",
          description: "Reserved"
        }, {
          value: "33",
          description: "Blocked valve"
        }, {
          value: "34 ... 35",
          description: "Reserved"
        }, {
          value: "36",
          description: "End point detection error"
        }, {
          value: "37 ... 39",
          description: "Reserved"
        }, {
          value: "40",
          description: "No valve"
        }, {
          value: "41 ... 48",
          description: "Reserved"
        }, {
          value: "49",
          description: "Not taught in"
        }, {
          value: "50 ... 52",
          description: "Reserved"
        }, {
          value: "53",
          description: "No response from controller"
        }, {
          value: "54",
          description: "Teach-in error"
        }, {
          value: "55 ... 255",
          description: "Reserved"
        }]
      }
    }, {
      data: "Measurement Status",
      shortcut: "MST",
      description: "Shows if the temperature measurement (feed temperature\n              and room temperature) is active",
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Active"
        }, {
          value: "1",
          description: "Inactive"
        }]
      }
    }, {
      data: "Status Request",
      shortcut: "STR",
      description: "Request for status from the controller",
      bitoffs: "25",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No change"
        }, {
          value: "1",
          description: "Status requested"
        }]
      }
    }, {
      data: "Button Lock Status",
      shortcut: "BLS",
      description: "Shows if all buttons on the actuator are locked",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Unlocked"
        }, {
          value: "1",
          description: "Locked"
        }]
      }
    }, {
      data: "Temperature Selection",
      shortcut: "TS",
      description: "Defines which temperature value is transmitted in DB2",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Feed temperature"
        }, {
          value: "1",
          description: "Temperature set point"
        }]
      }
    }, {
      data: "Failure",
      shortcut: "FL",
      description: "A failure occurred, see DB1.7-DB1.0 for Failure Code",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No failure (TMP is transmitted)"
        }, {
          value: "1",
          description: "failure (FC is transmitted)"
        }]
      }
    }]
  }, {
    direction: "2",
    condition: {
      direction: "2"
    },
    datafield: [{
      reserved: {},
      bitoffs: "16",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "2"
    }, {
      data: "Valve Position",
      shortcut: "POS",
      description: "Valve position",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature Set Point",
      shortcut: "TSP",
      description: "Temperature set point",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "10",
        max: "30"
      },
      unit: "\xB0C"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Measurement Control",
      shortcut: "MC",
      description: "Control the temperature measurement (feed temperature\n              + room temperature)",
      bitoffs: "17",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Enable"
        }, {
          value: "1",
          description: "Disable"
        }]
      }
    }, {
      data: "Wake-up Cycle",
      shortcut: "WUC",
      description: "Defines the cyclic wake-up time",
      bitoffs: "18",
      bitsize: "6",
      enum: {
        item: [{
          value: "0",
          description: "10 sec"
        }, {
          value: "1",
          description: "60 sec"
        }, {
          value: "2",
          description: "90 sec"
        }, {
          value: "3",
          description: "120 sec"
        }, {
          value: "4",
          description: "150 sec"
        }, {
          value: "5",
          description: "180 sec"
        }, {
          value: "6",
          description: "210 sec"
        }, {
          value: "7",
          description: "240 sec"
        }, {
          value: "8",
          description: "270 sec"
        }, {
          value: "9",
          description: "300 sec (5 min)"
        }, {
          value: "10",
          description: "330 sec"
        }, {
          value: "11",
          description: "360 sec"
        }, {
          value: "12",
          description: "390 sec"
        }, {
          value: "13",
          description: "420 sec"
        }, {
          value: "14",
          description: "450 sec"
        }, {
          value: "15",
          description: "480 sec"
        }, {
          value: "16",
          description: "510 sec"
        }, {
          value: "17",
          description: "540 sec"
        }, {
          value: "18",
          description: "570 sec"
        }, {
          value: "19",
          description: "600 sec (10 min)"
        }, {
          value: "20",
          description: "630 sec"
        }, {
          value: "21",
          description: "660 sec"
        }, {
          value: "22",
          description: "690 sec"
        }, {
          value: "23",
          description: "720 sec"
        }, {
          value: "24",
          description: "750 sec"
        }, {
          value: "25",
          description: "780 sec"
        }, {
          value: "26",
          description: "810 sec"
        }, {
          value: "27",
          description: "840 sec"
        }, {
          value: "28",
          description: "870 sec"
        }, {
          value: "29",
          description: "900 sec (15 min)"
        }, {
          value: "30",
          description: "930 sec"
        }, {
          value: "31",
          description: "960 sec"
        }, {
          value: "32",
          description: "990 sec"
        }, {
          value: "33",
          description: "1020 sec"
        }, {
          value: "34",
          description: "1050 sec"
        }, {
          value: "35",
          description: "1080 sec"
        }, {
          value: "36",
          description: "1110 sec"
        }, {
          value: "37",
          description: "1140 sec"
        }, {
          value: "38",
          description: "1170 sec"
        }, {
          value: "39",
          description: "1200 sec (20 min)"
        }, {
          value: "40",
          description: "1230 sec"
        }, {
          value: "41",
          description: "1260 sec"
        }, {
          value: "42",
          description: "1290 sec"
        }, {
          value: "43",
          description: "1320 sec"
        }, {
          value: "44",
          description: "1350 sec"
        }, {
          value: "45",
          description: "1380 sec"
        }, {
          value: "46",
          description: "1410 sec"
        }, {
          value: "47",
          description: "1440 sec"
        }, {
          value: "48",
          description: "1470 sec"
        }, {
          value: "49",
          description: "1500 sec (25 min)"
        }, {
          value: "50",
          description: "3 hrs"
        }, {
          value: "51",
          description: "6 hrs"
        }, {
          value: "52",
          description: "9 hrs"
        }, {
          value: "53",
          description: "12 hrs"
        }, {
          value: "54",
          description: "15 hrs"
        }, {
          value: "55",
          description: "18 hrs"
        }, {
          value: "56",
          description: "21 hrs"
        }, {
          value: "57",
          description: "24 hrs"
        }, {
          value: "58",
          description: "27 hrs"
        }, {
          value: "59",
          description: "30 hrs"
        }, {
          value: "60",
          description: "33 hrs"
        }, {
          value: "61",
          description: "36 hrs"
        }, {
          value: "62",
          description: "39 hrs"
        }, {
          value: "63",
          description: "42 hrs (max)"
        }]
      }
    }, {
      data: "Display Orientation",
      shortcut: "DSO",
      description: "Adjusts the display orientation",
      bitoffs: "26",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "0\xB0"
        }, {
          value: "1",
          description: "90\xB0"
        }, {
          value: "2",
          description: "180\xB0"
        }, {
          value: "3",
          description: "270\xB0"
        }]
      }
    }, {
      data: "Button Lock Control",
      shortcut: "BLC",
      description: "Set the button lock status",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Unlocked"
        }, {
          value: "1",
          description: "Locked"
        }]
      }
    }, {
      data: "Service Command",
      shortcut: "SER",
      description: "Initiates certain temporary service operations",
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "No change"
        }, {
          value: "1",
          description: "Open valve"
        }, {
          value: "2",
          description: "Run initialisation"
        }, {
          value: "3",
          description: "Close valve"
        }]
      }
    }]
  }],
  originalIndex: 125,
  eep: "a5-20-04",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "HVAC Components",
  func_number: "0x20",
  submitter: [
    "Holter Regelarmaturen GmbH & Co. KG"
  ]
};

// ../eep-transcoder/eep/a5-20-10.js
var a52010 = {
  number: "0x10",
  title: "Generic HVAC Interface",
  status: "released",
  description: "<br/><br/>\n          Functions: Mode, Vane Position, Fan Speed, Sensors and On/Off: With this\n          EEP plus the already existing EEP A5-10-03 and A5-20-11 all the information of AC\n          indoor unit can be sent and received allowing a much easier and complete control\n          of these units.\n          <br/>\n          <br/>\n          DIRECTION-1 = Receive mode: Commands received by the HVAC interface.\n          <br/>\n          DIRECTION-2 = Transmit mode: Commands sent by the HVAC interface.",
  case: [{
    direction: "1",
    condition: {
      direction: "1"
    },
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Mode",
      shortcut: "MD",
      description: "The modes are the same as in KNX and LON allowing a more transparent integration with this protocols\nand it has plenty of free positions for future expansion",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Heat"
        }, {
          value: "2",
          description: "Morning Warmup"
        }, {
          value: "3",
          description: "Cool"
        }, {
          value: "4",
          description: "Night Purge"
        }, {
          value: "5",
          description: "Precool"
        }, {
          value: "6",
          description: "Off"
        }, {
          value: "7",
          description: "Test"
        }, {
          value: "8",
          description: "Emergency Heat"
        }, {
          value: "9",
          description: "Fan only"
        }, {
          value: "10",
          description: "Free cool"
        }, {
          value: "11",
          description: "Ice"
        }, {
          value: "12",
          description: "Max heat"
        }, {
          value: "13",
          description: "Economic heat/cool"
        }, {
          value: "14",
          description: "Dehumidification (dry)"
        }, {
          value: "15",
          description: "Calibration"
        }, {
          value: "16",
          description: "Emergency cool"
        }, {
          value: "17",
          description: "Emergency steam"
        }, {
          value: "18",
          description: "max cool"
        }, {
          value: "19",
          description: "Hvc load"
        }, {
          value: "20",
          description: "no load"
        }, {
          min: "21",
          max: "30",
          description: "reserved"
        }, {
          value: "31",
          description: "Auto Heat"
        }, {
          value: "32",
          description: "Auto Cool"
        }, {
          min: "33",
          max: "254",
          description: "reserved"
        }, {
          value: "255",
          description: "N/A"
        }]
      }
    }, {
      data: "Vane position",
      shortcut: "VPS",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Horizontal"
        }, {
          value: "2",
          description: "Pos2"
        }, {
          value: "3",
          description: "Pos3"
        }, {
          value: "4",
          description: "Pos4"
        }, {
          value: "5",
          description: "Vertical"
        }, {
          value: "6",
          description: "Swing"
        }, {
          min: "7",
          max: "10",
          description: "Reserved"
        }, {
          value: "11",
          description: "Vertical swing"
        }, {
          value: "12",
          description: "Horizontal swing"
        }, {
          value: "13",
          description: "Horizontal and vertical swing"
        }, {
          value: "14",
          description: "Stop swing"
        }, {
          value: "15",
          description: "N/A"
        }]
      }
    }, {
      data: "Fan Speed",
      shortcut: "FANSP",
      description: "fan speed value goes from 1 to 14. 1 is the lowest fan speed allowed by the AC and from there it\nincrements with the value of this variable. Typically AC units have up to 5-6 speeds. Any speed higher than\nthe maximum the AC allows would set it to the higher speed.\n0 is auto and 15 is N/A",
      info: {},
      bitoffs: "12",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          min: "1",
          max: "14",
          description: "Up to 14 fan speeds being 1 the lowest"
        }, {
          value: "15",
          description: "N/A"
        }]
      }
    }, {
      data: "Control variable",
      shortcut: "CVAR",
      description: "Control variable; value 255 = auto",
      info: "DB_1 Control variable 0\u2026 100% 0...100, 255 = Auto",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "100, 255"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Room occupancy",
      shortcut: "RO",
      description: "The interfaces can automatically control the behaviour of the AC without integration in automation\nsystems when linked to presence/movement sensors.",
      info: {},
      bitoffs: "29",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Occupied"
        }, {
          value: "1",
          description: "StandBy (waiting to perform action)"
        }, {
          value: "2",
          description: "Unoccupied (action performed)"
        }, {
          value: "3",
          description: "Off (no occupancy and no action)"
        }]
      }
    }, {
      data: "On/Off",
      shortcut: "O/I",
      description: "On/Off",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "off (the unit is not running)"
        }, {
          value: "1",
          description: "on"
        }]
      }
    }]
  }, {
    direction: "2",
    condition: {
      direction: "2"
    },
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Mode",
      shortcut: "MD",
      description: "The modes are the same as in KNX and LON allowing a more transparent integration with this protocols\nand it has plenty of free positions for future expansion",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Heat"
        }, {
          value: "2",
          description: "Morning Warmup"
        }, {
          value: "3",
          description: "Cool"
        }, {
          value: "4",
          description: "Night Purge"
        }, {
          value: "5",
          description: "Precool"
        }, {
          value: "6",
          description: "Off"
        }, {
          value: "7",
          description: "Test"
        }, {
          value: "8",
          description: "Emergency Heat"
        }, {
          value: "9",
          description: "Fan only"
        }, {
          value: "10",
          description: "Free cool"
        }, {
          value: "11",
          description: "Ice"
        }, {
          value: "12",
          description: "Max heat"
        }, {
          value: "13",
          description: "Economic heat/cool"
        }, {
          value: "14",
          description: "Dehumidification (dry)"
        }, {
          value: "15",
          description: "Calibration"
        }, {
          value: "16",
          description: "Emergency cool"
        }, {
          value: "17",
          description: "Emergency steam"
        }, {
          value: "18",
          description: "max cool"
        }, {
          value: "19",
          description: "Hvc load"
        }, {
          value: "20",
          description: "no load"
        }, {
          min: "21",
          max: "30",
          description: "reserved"
        }, {
          value: "31",
          description: "Auto Heat"
        }, {
          value: "32",
          description: "Auto Cool"
        }, {
          min: "33",
          max: "254",
          description: "reserved"
        }, {
          value: "255",
          description: "N/A"
        }]
      }
    }, {
      data: "Vane position",
      shortcut: "VPS",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Horizontal"
        }, {
          value: "2",
          description: "Pos2"
        }, {
          value: "3",
          description: "Pos3"
        }, {
          value: "4",
          description: "Pos4"
        }, {
          value: "5",
          description: "Vertical"
        }, {
          value: "6",
          description: "Swing"
        }, {
          min: "7",
          max: "10",
          description: "Reserved"
        }, {
          value: "11",
          description: "Vertical swing"
        }, {
          value: "12",
          description: "Horizontal swing"
        }, {
          value: "13",
          description: "Horizontal and vertical swing"
        }, {
          value: "14",
          description: "Stop swing"
        }, {
          value: "15",
          description: "N/A"
        }]
      }
    }, {
      data: "Fan Speed",
      shortcut: "FANSP",
      description: "fan speed value goes from 1 to 14. 1 is the lowest fan speed allowed by the AC and from there it\nincrements with the value of this variable. Typically AC units have up to 5-6 speeds. Any speed higher than\nthe maximum the AC allows would set it to the higher speed.\n0 is auto and 15 is N/A",
      info: {},
      bitoffs: "12",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          min: "1",
          max: "14",
          description: "Up to 14 fan speeds being 1 the lowest"
        }, {
          value: "15",
          description: "N/A"
        }]
      }
    }, {
      data: "Control variable",
      shortcut: "CVAR",
      description: "Control variable (linear); value 255 = auto",
      info: "DB_1 Control variable 0\u2026 100% 0...100, 255 = Auto",
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: [
          {
            min: "0",
            max: "100",
            description: "Control variable 0\u2026 100% 0...100",
            unit: "%"
          },
          {
            value: 255,
            description: "Auto",
            unit: ""
          },
          {
            min: "101",
            max: "254",
            description: "not used",
            unit: ""
          }
        ]
      }
    }, {
      data: "Room occupancy",
      shortcut: "RO",
      description: "Room occupancy",
      info: {},
      bitoffs: "29",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Occupied"
        }, {
          value: "1",
          description: "StandBy (waiting to perform action)"
        }, {
          value: "2",
          description: "Unoccupied (action performed)"
        }, {
          value: "3",
          description: "Off (no occupancy and no action)"
        }]
      }
    }, {
      data: "On/Off",
      shortcut: "O/I",
      description: "On/Off",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "off"
        }, {
          value: "1",
          description: "on"
        }]
      }
    }]
  }],
  originalIndex: 126,
  eep: "a5-20-10",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "HVAC Components",
  func_number: "0x20",
  submitter: [
    "Intesis Software SL"
  ]
};

// ../eep-transcoder/eep/a5-20-11.js
var a52011 = {
  number: "0x11",
  title: "Generic HVAC Interface \u2013 Error Control",
  status: "released",
  description: "<br/><br/>\n          Error Control: AC Error Code, Error States and Disablements. With this\n          EEP plus the already existing EEP A5-10-03 and A5-20-10 all the information of AC indoor\n          unit can be sent and received allowing a much easier and complete control of these units.\n          <br/>\n          <br/>\n          DIRECTION-1 = Receive mode: Commands received by the HVAC interface.\n          <br/>\n          DIRECTION-2 = Transmit mode: Commands sent by the HVAC interface.",
  case: [{
    direction: "1",
    condition: {
      direction: "1"
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "23"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      data: "Disable remote controller",
      shortcut: "DRC",
      description: "Disable remote controller<br/>(When in receive mode it controls if the interface overwrites the remote controller commands.)",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Enable Remote controller"
        }, {
          value: "1",
          description: "Disable Remote controller"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "31",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "External disablement",
      shortcut: "EXDS",
      description: "External disablement",
      info: {},
      bitoffs: "23",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Not disabled"
        }, {
          value: "1",
          description: "Disabled"
        }]
      }
    }, {
      data: "Window contact",
      shortcut: "WC",
      description: "Window contact",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Windows opened"
        }, {
          value: "1",
          description: "Windows closed"
        }]
      }
    }]
  }, {
    direction: "2",
    condition: {
      direction: "2"
    },
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      data: "Remote controller Disablement",
      shortcut: "RCD",
      description: "Remote controller Disablement<br/>(In transmit it sends the status of this parameter. If the manufacturer doesn't support this option, it will send allways 0, no matter what it receives.)",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Remote controller enabled"
        }, {
          value: "1",
          description: "Remote controller disabled"
        }]
      }
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Error Code",
      shortcut: "ERR",
      description: "Error Code (DB3 HI,DB2 LO); generated by A.C.",
      info: {},
      bitoffs: "0",
      bitsize: "16",
      range: {
        min: "0",
        max: "65535"
      },
      scale: {
        min: "0",
        max: "65535"
      },
      unit: "N/A"
    }, {
      data: "Reserved",
      shortcut: "RES",
      description: "Reserved (0b0000)",
      info: {},
      bitoffs: "16",
      bitsize: "4",
      enum: {
        item: {
          value: {},
          description: "Reserved"
        }
      }
    }, {
      data: "Other disablement",
      shortcut: "OD",
      description: "Manufacturer defined. It is just to provide an extra \u201Cdisablement signal\u201D that could be used for other\ndevices. People would not have to change anything then as this is already an established \u201Csignal\u201D",
      info: {},
      bitoffs: "20",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Not disabled"
        }, {
          value: "1",
          description: "Disabled"
        }]
      }
    }, {
      data: "Window contact disablement",
      shortcut: "WCD",
      description: "Window contact disablement",
      info: {},
      bitoffs: "21",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Not disabled"
        }, {
          value: "1",
          description: "Disabled"
        }]
      }
    }, {
      data: "Key card disablement",
      shortcut: "KCD",
      description: "Key carddisablement",
      info: {},
      bitoffs: "22",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Not disabled"
        }, {
          value: "1",
          description: "Disabled"
        }]
      }
    }, {
      data: "External disablement",
      shortcut: "ED",
      description: "External disablement",
      info: {},
      bitoffs: "23",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Not disabled"
        }, {
          value: "1",
          description: "Disabled"
        }]
      }
    }, {
      data: "Window contact",
      shortcut: "WC",
      description: "Window contact",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Windows opened"
        }, {
          value: "1",
          description: "Windows closed"
        }]
      }
    }, {
      data: "Alarm State",
      shortcut: "AS",
      description: "Alarm State",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Ok"
        }, {
          value: "1",
          description: "Error"
        }]
      }
    }]
  }],
  originalIndex: 127,
  eep: "a5-20-11",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "HVAC Components",
  func_number: "0x20",
  submitter: [
    "Intesis Software SL"
  ]
};

// ../eep-transcoder/eep/a5-20-12.js
var a52012 = {
  number: "0x12",
  title: "Temperature Controller Input",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Control Variable override",
      shortcut: "CV",
      description: "Actual value for controller",
      info: "DB_3: Control variable \u2026 100 % 0...255",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "FanStage override",
      shortcut: "FANOR",
      description: "FanStage override",
      info: "",
      bitoffs: "8",
      bitsize: "8",
      enum: {
        item: [{
          value: "0",
          description: "Stage 0"
        }, {
          value: "1",
          description: "Stage 1"
        }, {
          value: "2",
          description: "Stage 2"
        }, {
          value: "3",
          description: "Stage 3"
        }, {
          value: "31",
          description: "auto"
        }, {
          value: "255",
          description: "not available"
        }]
      }
    }, {
      data: "Setpoint shift",
      shortcut: "SPS",
      description: "Actual set point could be shifted",
      info: "DB_1: 10K\u2026\n              0\u2026 +10K 0\u2026\n              128\u2026 255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "-10",
        max: "+10"
      },
      unit: "\xB0K"
    }, {
      data: "Fan override",
      shortcut: "FANOR",
      description: {},
      info: {},
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Automatic"
        }, {
          value: "1",
          description: "Override Fan DB2"
        }]
      }
    }, {
      data: "Controller mode",
      shortcut: "CTM",
      description: {},
      info: {},
      bitoffs: "25",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Auto mode"
        }, {
          value: "1",
          description: "Heating"
        }, {
          value: "2",
          description: "Cooling"
        }, {
          value: "3",
          description: "Off"
        }]
      }
    }, {
      data: "Controller state",
      shortcut: "CST",
      description: "Controller state",
      info: "Controller state",
      bitoffs: "27",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Automatic"
        }, {
          value: "1",
          description: "Override control variable DB3"
        }]
      }
    }, {
      data: "Energy hold-off / Dew point",
      shortcut: "ERH",
      description: "Energy hold-off / Dew point",
      info: "Energy hold-off / Dew point",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Normal"
        }, {
          value: "1",
          description: "Energy hold-off/ Dew point"
        }]
      }
    }, {
      data: "Room occupancy",
      shortcut: "RO",
      description: "Actual room occupancy",
      info: "Room occupancy",
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Occupied"
        }, {
          value: "1",
          description: "Unoccupied"
        }, {
          value: "2",
          description: "StandBy"
        }, {
          value: "3",
          description: "Frost"
        }]
      }
    }]
  }],
  originalIndex: 128,
  eep: "a5-20-12",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "HVAC Components",
  func_number: "0x20",
  submitter: [
    "Thermokon Sensortechnik GmbH"
  ]
};

// ../eep-transcoder/eep/a5-30-01.js
var a53001 = {
  number: "0x01",
  title: "Single Input Contact, Battery Monitor",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "SVC",
      description: "Supply voltage (linear)",
      info: "DB_2: Supply voltage",
      bitoffs: "8",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "120",
          description: "Battery LOW"
        }, {
          min: "121",
          max: "255",
          description: "Battery OK"
        }]
      }
    }, {
      data: "Input State",
      shortcut: "IPS",
      description: "Input State",
      info: "DB_1: Input State",
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "195",
          description: "Contact closed"
        }, {
          min: "196",
          max: "255",
          description: "Contact open"
        }]
      }
    }]
  }],
  originalIndex: 129,
  eep: "a5-30-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Digital Input",
  func_number: "0x30",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-30-02.js
var a53002 = {
  number: "0x02",
  title: "Single Input Contact",
  status: "released",
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "28"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "2"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Input State",
      shortcut: "IPS",
      description: "Input State",
      info: "DB_0.0: Input State",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Contact closed"
        }, {
          value: "1",
          description: "Contact open"
        }]
      }
    }]
  }],
  originalIndex: 130,
  eep: "a5-30-02",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Digital Input",
  func_number: "0x30",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/a5-30-03.js
var a53003 = {
  number: "0x03",
  title: "4 Digital Inputs, Wake and Temperature",
  status: "released",
  description: '\n            <br/><br/>\n            Description:<br/>\n            This is used for universal modules with 4 digital inputs and a room temperature.\n            The wake input signal of the device is provided to show the telegram transmission trigger.\n            The application meaning and exact data interpretation of the digital channels depends on the end application and is not defined in this profile documentation.\n            <br/><br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>\n            Direction: unidirectional<br/>\n            Addressing: broadcast<br/>\n            Communication trigger: event- & time-triggered<br/>\n            Trigger event: wake event \u2013 application dependent<br/>\n            Teach-in method: 4BS teach-in 2\n            <br/><br/>\n            Appendix:<br/>\n            D1.4 \u2013 The Status of Wake signalizes the status of the WAKE PIN which has a special\n            meaning in an ultra low application. Usually, by a status change of this input the module\n            is triggered to perform a predefined operation.<br/><br/>\n            Applications using this profile:<br/>\n            <ul>\n            <li> water sensor conductive \u2013 Wake Status = 0 (water detected) </li>\n            <li> pressure gauge with minimum or maximum (wake signal, configurable if min or max) </li>\n            <li> indication and individual switching points (digital channels show different areas) </li>\n            </ul>',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear)",
      info: "Temperature (linear)",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "255",
        max: "0"
      },
      scale: {
        min: "0",
        max: "40"
      },
      unit: "\xB0C"
    }, {
      data: "Status of Wake",
      shortcut: "WA0",
      description: "Value of wake signal",
      info: "Status of Wake",
      bitoffs: "19",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Low"
        }, {
          value: "1",
          description: "High"
        }]
      }
    }, {
      data: "Digital Input 3",
      shortcut: "DI3",
      description: "Digital Input 3",
      info: "Digital Input 3",
      bitoffs: "20",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Low"
        }, {
          value: "1",
          description: "High"
        }]
      }
    }, {
      data: "Digital Input 2",
      shortcut: "DI2",
      description: "Digital Input 2",
      info: "Digital Input 2",
      bitoffs: "21",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Low"
        }, {
          value: "1",
          description: "High"
        }]
      }
    }, {
      data: "Digital Input 1",
      shortcut: "DI1",
      description: "Digital Input 1",
      info: "Digital Input 1",
      bitoffs: "22",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Low"
        }, {
          value: "1",
          description: "High"
        }]
      }
    }, {
      data: "Digital Input 0",
      shortcut: "DI0",
      description: "Digital Input 0",
      info: "Digital Input 0",
      bitoffs: "23",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Low"
        }, {
          value: "1",
          description: "High"
        }]
      }
    }]
  }],
  originalIndex: 131,
  eep: "a5-30-03",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Digital Input",
  func_number: "0x30",
  submitter: [
    "Afriso",
    "EnOcean"
  ]
};

// ../eep-transcoder/eep/a5-30-04.js
var a53004 = {
  number: "0x04",
  title: "3 Digital Inputs, 1 Digital Input 8 Bits",
  status: "released",
  description: '\n            <br/>\n            <br/>Description:\n            <br/>This profile is used for universal module with 1 analog input (= 8 bits resolution digital) and 3 digital inputs.\n            The application meaning and exact data interpretation of the input channels depends on the\n            end application and is not defined in this profile documentation.\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Trigger event: values have changed\n            <br/>Teach-in method: 4BS teach-in 2',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "16"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Digital value-input",
      shortcut: "DV0",
      description: "Digital value 1 byte",
      info: "Digital value-input",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Digital Input 2",
      shortcut: "DI2",
      description: "Measured digital Input 2",
      info: "Digital Input 2",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Low"
        }, {
          value: "1",
          description: "High"
        }]
      }
    }, {
      data: "Digital Input 1",
      shortcut: "DI1",
      description: "Measured digital Input 1",
      info: "Digital Input 1",
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Low"
        }, {
          value: "1",
          description: "High"
        }]
      }
    }, {
      data: "Digital Input 0",
      shortcut: "DI0",
      description: "Measured digital Input 0",
      info: "Digital Input 0",
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Low"
        }, {
          value: "1",
          description: "High"
        }]
      }
    }]
  }],
  originalIndex: 132,
  eep: "a5-30-04",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Digital Input",
  func_number: "0x30",
  submitter: [
    "Afriso",
    "EnOcean"
  ]
};

// ../eep-transcoder/eep/a5-30-05.js
var a53005 = {
  number: "0x05",
  title: "Single Input Contact, Retransmission, Battery Monitor",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: unidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval:\n            <br/>- retransmission: 5 ... 255 seconds (one time configuration)\n            <br/>- number of retransmission times: 0 ... 127 times (one time configuration)\n            <br/>- heartbeat: 60 ... 65535 seconds (one time configuration)\n            <br/>Trigger event: digital input, retransmission, heartbeat\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: 4BS teach-in 2\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Supply voltage",
      shortcut: "VDD",
      description: "Supply voltage",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "3.3"
      },
      unit: "V"
    }, {
      data: "Signal type",
      shortcut: "ST",
      description: "Signal type",
      info: {},
      bitoffs: "16",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Normal signal"
        }, {
          value: "1",
          description: "Heart beat signal"
        }]
      }
    }, {
      data: "Index of Signals",
      shortcut: "IOS",
      description: "Ordinal count",
      info: {},
      bitoffs: "17",
      bitsize: "7",
      enum: {
        item: {
          min: "0",
          max: "127",
          description: "Increment a counter by new telegram"
        }
      }
    }]
  }],
  originalIndex: 133,
  eep: "a5-30-05",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Digital Input",
  func_number: "0x30",
  submitter: [
    "ITEC"
  ]
};

// ../eep-transcoder/eep/a5-37-01.js
var a53701 = {
  number: "0x01",
  title: "Demand Response",
  status: "released",
  description: "<br/><br/>\n          Purpose of EEP:<br/>\nDemand Response is a developing standard to allow utility\ncompanies to send requests for reduction in power consumption\nduring peak usage times. It is also used as a means to allow users\nto reduce overall power consumption as energy prices increase.\nHaving an EEP for this will allow ease of integration with\nEnOcean products to this standard. The EEP was designed with a\nvery flexible setting for the level (0-15) as well as a default level\nwhereby the transmitter can specify a specific level for all\ncontrollers to use (0-100% of either maximum or current power\noutput, depending on the load type). This EEP also includes a\ntimeout setting to indicate how long the DR event should last if the\nDR transmitting device does not send heartbeats or subsequent\nnew DR levels.\n<br/>\n<br/>\nDescription:\n<br/>\nThis EEP is included under a new function of Energy\nManagement. Additional types could be added in future for power,\nvoltage, and current data. The proposed EEP type 01 only deals\nwith demand response activation at this point.\nData Byte 3 is the default DR value for devices that\nimplement a control algorithm that uses a set-point. It will be used\nfor any controllers not supporting the current DR Level in the\nmessage and having an adjustable set-point.\n<br/>\n<br/>\nData Byte 2 is the default DR Level for any controllers not\nsupporting the current DR Level in the message and having an\nadjustable control. It can be defined as either a percentage of the\nmaximum power or a percentage of the current power, depending\non the value of bit 7 in Data Byte 2. Bits 0 through 6 contain the\npercentage of power (either relative or absolute) that should be\nused. A value of 0 corresponds to 0% and a value of 100\ncorresponds to 100%. Any value higher that n100 should be\ninterpreted as 100%. For example, if the current DR level is not\nsupported by the controller and Data Byte 2 bit 7 is 0 and Data\nByte 2 bits 0 through 6 are set to 55, then the controller should try\nto use 55% of its maximum power usage. In the case of a lighting\nload with 0-10V dimming, this would correspond to 5.5V on the\ndimming line. In the case of a heating controller with a maximum\nset back of 5 degrees C, this would correspond to a set back of 2.75\ndegrees C (this would most likely be rounded to 3).\n<br/>\n<br/>\nData Byte 1 is the timeout for this DR event. After this\ncommand is sent the controller will stay at the DR level for Data\nByte 1 multiplied by 15 minutes. Once this time has elapsed the\ncontroller will return to normal operation. If Data Byte 1 is 0 then\nthe controller will remain in the DR event until the next DR\ncommand is received. This timeout allows DR devices to leave or\nturn off after setting controllers into a DR state, thus the DR\ntransmitter is not needed to take the devices out of the DR state\nand the controllers will automatically recover. For example a DR\ntransmitter that only sends messages when a DR event is active\ncould be used with the timeout to create a successful DR system.\n<br/>\n<br/>\nData Byte 0, Bits 7 through 4 make up a nibble that will be\nused as the DR level. Levels 0 through 15 will be possible using\nthese bits. Bit 4 will be the lowest bit in this nibble and bit 7 will\nbe the highest. If any level is not supported by a controller then\nthat controller should use the default settings sent in this message\nor map the level to one that it supports.\n<br/>\n<br/>\nData Byte 0 Bits 2 and 1 indicate whether the power adjustment at\nstart and end of the DR event should be randomized or not. This\nfeature is intended to minimize rapid changes on the power\ndistribution equipment by delaying each controller\u2019s response. If\nrandom start or end is enabled, each controller will delay starting\nor ending the DR event by a random time that will vary uniformly\nover a specific time period (for example, 5 seconds, 60 seconds, or\n15 minutes).. The maximum length of these random delays will\ndepend on the implementation in the controller.\n<br/>\n<br/>\nData Byte 0, Bit 0 is the state for loads that are not adjustable\nfor the default DR level. If a controller does not support the current\nDR level and does not have adjustable control then it should use\nthis bit. The two states of this bit are defined as follows: 1 =\nmaximum power usage by controller, 0 = minimum power usage\nby the controller. If for example lights are being controlled, then a\nsetting of 1 will mean the lights should be ON, where as a setting\nof 0 will mean the lights should be OFF. For a thermostat\napplication with non adjustable set back, a setting of 1 will mean\nthat no set back should be applied, whereas a setting of 0 will mean\nthat the full set back should be applied. This setting only applies to\nthe maximum power usage of the controller, if for example the\nlights are currently off and the controller receives a DR event with this bit set, then the lights should not turn ON as the DR event has\nonly set the maximum power usage for the device.",
  case: [{
    datafield: [{
      data: "DR Level",
      shortcut: "DRL",
      description: "DR Level",
      bitoffs: "24",
      bitsize: "4",
      range: {
        min: "0",
        max: "15"
      },
      scale: {
        min: "0",
        max: "15"
      },
      unit: "N/A"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Temporary default",
      shortcut: "TMPD",
      description: "New Temporary default DR set point Min. ... Max. (linear)",
      info: "DB_3: new Temporary default DR set-point",
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "N/A"
    }, {
      data: "Absolute/relative power usage",
      shortcut: "SPWRU",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Absolute power usage. Interpret\nDB_2.BIT_6...DB_2.BIT_0 as a percentage of the\nmaximum power use."
        }, {
          value: "1",
          description: "Relative power usage. Interpret\nDB_2.BIT_6...DB_2.BIT_0 as a percentage of the\ncurrent power use."
        }]
      }
    }, {
      data: "Power Usage",
      shortcut: "PWRU",
      description: "0% to 100% power usage in 1% increments; 101...127 = interpreted as 100%",
      info: {},
      bitoffs: "9",
      bitsize: "7",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "N/A"
    }, {
      data: "Timeout Setting",
      shortcut: "TMOS",
      description: "Time in 15 min. intervals; 0 = No time specified; 1...255 = increasing 15 min. intervals. Max value: 3825 = 255*15",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "1",
        max: "255"
      },
      scale: {
        min: "15",
        max: "3825"
      },
      unit: "min"
    }, {
      data: "Random start delay",
      shortcut: "RSD",
      description: "...",
      info: {},
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "False"
        }, {
          value: "1",
          description: "True"
        }]
      }
    }, {
      data: "Randomized end delay",
      shortcut: "RED",
      description: "...",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "False"
        }, {
          value: "1",
          description: "True"
        }]
      }
    }, {
      data: "Max/Min Power Usage for Default DR State",
      shortcut: "MPWRU",
      description: {},
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Minimum Power usage"
        }, {
          value: "1",
          description: "Maximum Power usage"
        }]
      }
    }]
  }],
  originalIndex: 134,
  eep: "a5-37-01",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Energy Management",
  func_number: "0x37",
  submitter: [
    "Echoflex Solutions Inc."
  ]
};

// ../eep-transcoder/eep/a5-38-08.js
var a53808 = {
  number: "0x08",
  title: "Gateway",
  description: "Communication between gateway and actuator uses byte DB_3 to identify Commands.\n              Commands 0x01 to 0x7F shall be common to all types belonging to this profile.\n              Commands 0x80 to 0xFE can be defined individually for each device type.",
  case: [{
    title: "0x01 Switching",
    description: "",
    status: "released",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x01"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Command",
      shortcut: "COM",
      description: "Command ID",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x01",
          description: {}
        }
      }
    }, {
      data: "Time",
      shortcut: "TIM",
      description: "Time in 1/10 seconds. 0 = no time specifed",
      info: "DB_2/DB_1: Time in 1/10 seconds.",
      bitoffs: "8",
      bitsize: "16",
      range: {
        min: "1",
        max: "65535"
      },
      scale: {
        min: "0.1",
        max: "6553.5"
      },
      unit: "s"
    }, {
      data: "Lock/Unlock",
      shortcut: "LCK",
      description: "Lock for duration time if time >0, unlimited time of no time\n                  specified. Locking may be cleared with \u201Eunlock\u201C. During lock\n                  phase no other commands will be accepted or executed",
      info: {},
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Unlock"
        }, {
          value: "1",
          description: "Lock"
        }]
      }
    }, {
      data: "Delay or duration",
      shortcut: "DEL",
      description: "Delay or duration (if Time > 0);<br/> 0 = Duration (Execute switching command immediately and switch back after duration)<br/> 1 = Delay (Execute switching command after delay)",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Duration"
        }, {
          value: "1",
          description: "Delay"
        }]
      }
    }, {
      data: "Switching Command",
      shortcut: "SW",
      description: "Switching Command ON/OFF",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Off"
        }, {
          value: "1",
          description: "On"
        }]
      }
    }]
  }, {
    title: "0x02 Dimming",
    description: "REMARK:\n              <br/>\n              Ramp time is the time needed to transition from minimum to maximum dimming levels.\n              <br/>",
    status: "released",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x02"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Command",
      shortcut: "COM",
      description: "Command ID",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x02",
          description: {}
        }
      }
    }, {
      data: "Dimming value",
      shortcut: "EDIM",
      description: "Dimming value (absolute [0...255] or relative [0...100])",
      info: "DB_2: Dimming value (absolute [0...255] or relative [0...100])",
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Ramping time",
      shortcut: "RMP",
      description: "Ramping time in seconds, 0 = no ramping, 1... 255 = seconds to 100%",
      info: "DB_1: Ramping time in seconds",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "s"
    }, {
      data: "Dimming Range",
      shortcut: "EDIM R",
      description: "Dimming Range",
      info: {},
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Absolute value"
        }, {
          value: "1",
          description: "Relative value"
        }]
      }
    }, {
      data: "Store final value",
      shortcut: "STR",
      description: "Store final value",
      info: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No"
        }, {
          value: "1",
          description: "Yes"
        }]
      }
    }, {
      data: "Switching Command",
      shortcut: "SW",
      description: "Switching Command ON/OFF",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Off"
        }, {
          value: "1",
          description: "On"
        }]
      }
    }]
  }, {
    title: "0x03 Setpoint shift",
    description: '<span style="background-color:#CDFF7D;border-bottom:2px groove #000000;font-style:italic;">Submitter: Thermokon Sensortechnik GmbH</span><br/><br/>\n              Used for changing set point, for example summer / winter compensation',
    status: "released",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x03"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Command",
      shortcut: "COM",
      description: "Command ID",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x03",
          description: {}
        }
      }
    }, {
      data: "Setpoint",
      shortcut: "SP",
      description: "Setpoint shift",
      info: "DB_1: Setpoint shift -12,7\n                  K\u2026 0\u2026 +12,8 K 0\u2026\n                  128\u2026 255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "-12.7",
        max: "12.8"
      },
      unit: "K"
    }]
  }, {
    title: "0x04 Basic Setpoint",
    description: '<span style="background-color:#CDFF7D;border-bottom:2px groove #000000;font-style:italic;">Submitter: Thermokon Sensortechnik GmbH</span><br/><br/>\n              Send a new basic set point via DDC to an actuator',
    status: "released",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x04"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Command",
      shortcut: "COM",
      description: "Command ID",
      info: "DB_3: 0x04",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x04",
          description: {}
        }
      }
    }, {
      data: "Basic Setpoint",
      shortcut: "BSP",
      description: "Basic Setpoint",
      info: "DB_1: Basic Setpoint 0\xB0C \u2026 51.2\xB0C \u2026\n                  255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+51.2"
      },
      unit: "\xB0C"
    }]
  }, {
    title: "0x05 Control variable",
    description: '<span style="background-color:#CDFF7D;border-bottom:2px groove #000000;font-style:italic;">Submitter: Thermokon Sensortechnik GmbH</span><br/><br/>\n              Set occupancy, energy holdoff and control directly actuator',
    status: "released",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x05"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Command",
      shortcut: "COM",
      description: "Command ID",
      info: "DB_3: 0x05",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x05",
          description: {}
        }
      }
    }, {
      data: "Control variable override",
      shortcut: "CVOV",
      description: "Control variable override",
      info: "DB_1: Control variable override 0\u2026 100 % 0...\n                  255",
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Controller mode",
      shortcut: "CM",
      description: "Controller Mode",
      info: {},
      bitoffs: "25",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Automatic mode selection"
        }, {
          value: "1",
          description: "Heating"
        }, {
          value: "2",
          description: "Cooling"
        }, {
          value: "3",
          description: "Off"
        }]
      }
    }, {
      data: "Controller state",
      shortcut: "CS",
      description: "Controller state",
      info: {},
      bitoffs: "27",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Automatic"
        }, {
          value: "1",
          description: "Override"
        }]
      }
    }, {
      data: "Energy hold off",
      shortcut: "ENHO",
      description: "Energy Hold Off",
      info: {},
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Normal"
        }, {
          value: "1",
          description: "Energy holdoff/ Dew point"
        }]
      }
    }, {
      data: "Room occupancy",
      shortcut: "RMOCC",
      description: "Room occupancy",
      info: {},
      bitoffs: "30",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Occupied"
        }, {
          value: "1",
          description: "Unoccupied"
        }, {
          value: "2",
          description: "Standby"
        }]
      }
    }]
  }, {
    title: "0x06 Fan stage",
    description: '<span style="background-color:#CDFF7D;border-bottom:2px groove #000000;font-style:italic;">Submitter: Thermokon Sensortechnik GmbH</span><br/><br/>\n              Set directly fan stage<br/>',
    status: "released",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x06"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "3"
    }, {
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Command",
      shortcut: "COM",
      description: "Command ID",
      info: "DB_3: 0x06",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x06",
          description: {}
        }
      }
    }, {
      data: "FanStage override",
      shortcut: "FO",
      description: "FanStage override",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: [{
          value: "0",
          description: "Stage 0"
        }, {
          value: "1",
          description: "Stage 1"
        }, {
          value: "2",
          description: "Stage 2"
        }, {
          value: "3",
          description: "Stage 3"
        }, {
          value: "255",
          description: "Auto"
        }]
      }
    }]
  }, {
    title: "0x07 Blind Central Command",
    description: "",
    status: "released",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x07"
      }
    },
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Command",
      shortcut: "COM",
      description: "Command ID",
      info: "DB_3: 0x07",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x07",
          description: "Shutters / Blinds"
        }
      }
    }, {
      data: "Parameter 1",
      shortcut: "P1",
      description: "Function defined parameter value",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      enum: {
        item: {
          description: "Func. 00: -- not used \u2013-\n\n                    <br/><br/>Func. 01: -- not used --\n\n                    <br/><br/>Func. 02: -- not used --\n\n                    <br/><br/>Func. 03: -- not used --\n\n                    <br/><br/>Func. 04: 0% ... 100%\n                    <br/>e.g.: 0% = Blind fully open / 100% = Blind fully closed\n\n                    <br/><br/>Func. 05: 0 ... 255 seconds\n\n                    <br/><br/>Func. 06: 0 ... 255 seconds\n\n                    <br/><br/>Func. 07: Runtime value to close the blind\n                    <br/>0 ... 255 seconds\n\n                    <br/><br/>Func. 08: Runtime value for the sunblind reversion time\n                    <br/>This is the time to revolve the sunblind from one\n                    <br/>slat angle end position to the other end position:\n                    <br/>0.0 \u2026 25.5 seconds (0.1s steps)\n\n                    <br/><br/>Func. 09: Set minimal position value\n                    <br/>0 ... 100%\n\n                    <br/><br/>Func. 10: Angle at the fully SHUT position\n                    <br/>Bit7 0 = positive sign\n                    <br/>Bit7 1 = negative sign\n                    <br/>Bit6...0  0 ... 90\n                    <br/>Angle in 2\xB0 steps (e.g. 0 = 0\xB0, 90 = 180\xB0)\n\n                    <br/><br/>Func. 11: Position logic\n                    <br/>0 = Highest position = 0% / Lowest position = 100%\n                    <br/>1 = Highest position = 100% / Lowest position = 0%"
        }
      }
    }, {
      data: "Parameter 2",
      shortcut: "P2",
      description: "Function defined parameter value",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: {
          description: "Func. 00: -- not used \u2013-\n\n                    <br/><br/>Func. 01: -- not used --\n\n                    <br/><br/>Func. 02: -- not used --\n\n                    <br/><br/>Func. 03: -- not used --\n\n                    <br/><br/>Func. 04: Angel (see remark 1)\n                    <br/>Bit7 0 = positive sign\n                    <br/>Bit7 1 = negative sign\n                    <br/>Bit6...0  0 ... 90\n                    <br/>Angle in 2\xB0 steps (e.g. 0 = 0\xB0, 90 = 180\xB0)\n\n                    <br/><br/>Func. 05: 0.0 ... 25.5 seconds\n\n                    <br/><br/>Func. 06: 0.0 ... 25.5 seconds\n\n                    <br/><br/>Func. 07: Runtime value to open the blind\n                    <br/>0 ... 255 seconds\n\n                    <br/><br/>Func. 08: -- not used --\n\n                    <br/><br/>Func. 09: Set maximal position value\n                    <br/>0 ... 100%\n\n                    <br/><br/>Func. 10: Angle at the fully OPEN position\n                    <br/>Bit7 0 = positive sign\n                    <br/>Bit7 1 = negative sign\n                    <br/>Bit6...0  0 ... 90\n                    <br/>Angle in 2\xB0 steps (e.g. 0 = 0\xB0, 90 = 180\xB0)\n\n                    <br/><br/>Func. 11: -- not used --"
        }
      }
    }, {
      data: "Function",
      shortcut: "FUNC",
      description: {},
      bitoffs: "24",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Do nothing, status request"
        }, {
          value: "1",
          description: "Blind stops"
        }, {
          value: "2",
          description: "Blind opens"
        }, {
          value: "3",
          description: "Blind closes"
        }, {
          value: "4",
          description: "Blind drives to position with angle value (see remark 2)"
        }, {
          value: "5",
          description: "Blind opens for time (position value) and angle (angle value)"
        }, {
          value: "6",
          description: "Blind closes for time (position value) and angle (angle value)"
        }, {
          value: "7",
          description: "Set Runtime parameters (see remark 3)"
        }, {
          value: "8",
          description: "Set angle configuration (see remark 3)"
        }, {
          value: "9",
          description: "Set Min, Max values (see remark 4)"
        }, {
          value: "10",
          description: "Set slat angle for SHUT and OPEN position (see remark 5)"
        }, {
          value: "11",
          description: "Set position logic (see remark 6)"
        }]
      }
    }, {
      data: "Send status flag",
      shortcut: "SSF",
      description: "see remark 7",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Send new status of device"
        }, {
          value: "1",
          description: "Send no status (e.g. Global central commands)"
        }]
      }
    }, {
      data: "Pos. and Angle flag",
      shortcut: "PAF",
      description: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No Angle and position value available"
        }, {
          value: "1",
          description: "Angle and position value available"
        }]
      }
    }, {
      data: "Service Mode Flag",
      shortcut: "SMF",
      description: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Normal operation"
        }, {
          value: "1",
          description: "Service mode: The module disables all\n                      senders, except this sender, which has set the service mode.\n                      (For example for maintenance)"
        }]
      }
    }]
  }],
  originalIndex: 135,
  eep: "a5-38-08",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Central Command",
  func_number: "0x38",
  submitter: []
};

// ../eep-transcoder/eep/a5-38-09.js
var a53809 = {
  number: "0x09",
  title: "Extended Lighting-Control",
  status: "released",
  description: "<br/><br/>\n            With this central command all lighting actors can be manipulated.\n                <br/>\n                <br/>\n                <br/>Remarks for data table:\n                <br/>\n                <br/>REMARK 1:\n                <br/>Set the RGB level for corresponding lighting-control.\n                <br/>Devices without this feature ignore this command.\n                <br/>\n                <br/>REMARK 2:\n                <br/>Up to 16 different scenes can be selected and configured.\n                <br/>\n                <br/>REMARK 3:\n                <br/>Change the minimal and maximal dimmer-value. Example:\n                <br/>\n                <img>graphics/EEP_A5-38-09_01.png</img>\n                <br/>General for switchers:\n                <br/>The values 0 .. 127 are defined to \u201COff\u201D.\n                <br/>The values 128.. 255 are defined to \u201COn\u201D.\n                <br/>\n                <br/>REMARK 4:\n                <br/>Example: If the lamp was replaced, the operating hours are reset to 0.\n                <br/>\n                <br/>REMARK 5:\n                <br/>This function blocks all other commands from the other taught-in\n                transmitters. The transmitter, which has called this function,\n                must delete the blocking state, before the other transmitters can use the device again.\n                <br/>\n                <br/>REMARK 6:\n                <br/>For important central commands, it's not necessary to send directly the\n                statefeedback, e.g. when many modules are activated simultaneously.<br/>\n                Note: Special functionality is in function \u201CStatus request (0)\u201D,\n                the status is always sent.\n                <br/>\n                <br/>REMARK 7:\n                <br/>Ramp time is the time needed to transition from minimum to maximum dimming levels.",
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Parameter 1",
      shortcut: "P1",
      description: "Function defined parameter value",
      info: "",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          description: "Func. 00: -- not used \u2013-\n                      <br/>\n                      <br/>Func. 01: -- not used --\n                      <br/>\n                      <br/>Func. 02: -- not used --\n                      <br/>\n                      <br/>Func. 03: -- not used --\n                      <br/>\n                      <br/>Func. 04: -- not used --\n                      <br/>\n                      <br/>Func. 05: -- not used --\n                      <br/>\n                      <br/>Func. 06: Dimm-Value (0 ... 255)\n                      <br/>\n                      <br/>Func. 07: R - Red (0 .. 255)\n                      <br/>\n                      <br/>Func. 08: -- not used --\n                      <br/>\n                      <br/>Func. 09: Dimm-Value (0 ... 255)\n                      <br/>\n                      <br/>Func. 10: Lamp operating hours (MSB 15..8)\n                      <br/>\n                      <br/>Func. 11: -- not used --\n                      <br/>\n                      <br/>Func. 12: Energy metering value (MSB 15..8)"
        }
      }
    }, {
      data: "Parameter 2",
      shortcut: "P2",
      description: "Function defined parameter value",
      info: "",
      bitoffs: "8",
      bitsize: "8",
      enum: {
        item: {
          description: "Func. 00: -- not used \u2013-\n                      <br/>\n                      <br/>Func. 01: -- not used --\n                      <br/>\n                      <br/>Func. 02: -- not used --\n                      <br/>\n                      <br/>Func. 03: Ramping time (MSB 15...8) (65535 s)\n                      <br/>\n                      <br/>Func. 04: Ramping time (MSB 15...8) (65535 s)\n                      <br/>\n                      <br/>Func. 05: -- not used --\n                      <br/>\n                      <br/>Func. 06: Ramping time (MSB 15...8) (65535 s)\n                      <br/>\n                      <br/>Func. 07: G - Green (0 ... 255)\n                      <br/>\n                      <br/>Func. 08: -- not used --\n                      <br/>\n                      <br/>Func. 09: Dimm-Value (0 ... 255)\n                      <br/>\n                      <br/>Func. 10: Lamp operating hours (7...0 LSB)\n                      <br/>\n                      <br/>Func. 11: -- not used --\n                      <br/>\n                      <br/>Func. 12: Energy metering value (7..0 LSB)"
        }
      }
    }, {
      data: "Parameter 3",
      shortcut: "P3",
      description: "Function defined parameter value",
      info: "",
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: {
          description: "Func. 00: -- not used \u2013-\n                      <br/>\n                      <br/>Func. 01: -- not used --\n                      <br/>\n                      <br/>Func. 02: -- not used --\n                      <br/>\n                      <br/>Func. 03: Ramping time (7...0 LSB) (65535 s)\n                      <br/>\n                      <br/>Func. 04: Ramping time (7...0 LSB) (65535 s)\n                      <br/>\n                      <br/>Func. 05: -- not used --\n                      <br/>\n                      <br/>Func. 06: Ramping time (7...0 LSB) (65535 s)\n                      <br/>\n                      <br/>Func. 07: B - Blue(0 ... 255)\n                      <br/>\n                      <br/>Func. 08:\n                      <br/>Bit7: 0 = Drive to scene-value\n                      <br/>Bit7: 1 = Stores actual value in the scene\n                      <br/>Bit3..0: Scene number 0 ... 15\n                      <br/>\n                      <br/>Func. 09: -- not used --\n                      <br/>\n                      <br/>Func. 10: -- not used --\n                      <br/>\n                      <br/>Func. 11: Blocks the local operations\n                      <br/>Enum:\n                      <br/>0 = Unlock local operations\n                      <br/>1 = Locking switch on commands\n                      <br/>2 = Locking switch off commands\n                      <br/>3 = Locking local operations\n                      <br/>\n                      <br/>Func. 12: Unit of energy metering value\n                      <br/>Enum:\n                      <br/>0 = mW\n                      <br/>1 = W\n                      <br/>2 = kW\n                      <br/>3 = MW\n                      <br/>4 = Wh\n                      <br/>5 = kWh\n                      <br/>6 = MWh\n                      <br/>7 = GWh\n                      <br/>8 = mA\n                      <br/>9 = 1/10 A\n                      <br/>10 = mV\n                      <br/>11 = 1/10 V\n                      <br/>12 ... 15 Not used"
        }
      }
    }, {
      data: "Function",
      shortcut: "FUNC",
      description: {},
      bitoffs: "24",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Do nothing, status request"
        }, {
          value: "1",
          description: "Switched off"
        }, {
          value: "2",
          description: "Switched on (Memory value)"
        }, {
          value: "3",
          description: "Dimming up with ramping time"
        }, {
          value: "4",
          description: "Dimming down with ramping time"
        }, {
          value: "5",
          description: "Dimming stops"
        }, {
          value: "6",
          description: "Set dimmer-value and ramping time"
        }, {
          value: "7",
          description: "Set RGB values (see remark 1)"
        }, {
          value: "8",
          description: "Scene function (see remark 2)"
        }, {
          value: "9",
          description: "Set minimal and maximal dimmer-value (see remark 3)"
        }, {
          value: "10",
          description: "Set the operating hours of the lamp (see remark 4)"
        }, {
          value: "11",
          description: "Locking local operations (see remark 5)"
        }, {
          value: "12",
          description: "Set a new value for the energy metering\n                    (overwrite the actual value with the selected unit)"
        }]
      }
    }, {
      data: "Send status flag",
      shortcut: "SSF",
      description: "see remark 6",
      bitoffs: "29",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Send new status of device"
        }, {
          value: "1",
          description: "Send no status (e.g. Global central commands)"
        }]
      }
    }, {
      data: "Store final value",
      shortcut: "SFV",
      description: {},
      bitoffs: "30",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No"
        }, {
          value: "1",
          description: "Yes"
        }]
      }
    }, {
      data: "Service Mode Flag",
      shortcut: "SMF",
      description: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Normal operation"
        }, {
          value: "1",
          description: "Service mode: The module disables all\n                      senders, except this sender, which has set the service mode.\n                      (For example for maintenance)"
        }]
      }
    }]
  }],
  originalIndex: 136,
  eep: "a5-38-09",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Central Command",
  func_number: "0x38",
  submitter: [
    "PEHA",
    "infratec"
  ]
};

// ../eep-transcoder/eep/a5-3f-00.js
var a53f00 = {
  number: "0x00",
  title: "Radio Link Test",
  status: "released",
  description: "<br/><br/>\n              Units supporting the EEP Radio Link Test shall offer a functionality that allows for radio link testing between them (Position A to Position B, point-to-point only). Testing shall be possible without the need for prior teach-in and as an option it shall cover two way communications.\n              <br/>\n              <br/>\n              Further, testing shall be backward compatible to existing EnOcean installations that support at least 1BS (RORG=0xD5) and 4BS (RORG=0xA5) EnOcean messages.\n              <br/>\n              <br/>\n              The main area of RLT application are in-field testing of radio links between portable test equipment placed at different locations as well as between portable test equipment and fixed installation, e.g. an EnOcean Gateway.\n              <br/>\n              <h4>Functional description of RLT:</h4>\n              When two units perform radio link testing one unit needs to act in a mode called RLT Master and\n              the other unit needs to act in a mode called RLT Slave.\n              On a RLT enabled unit one or both modes may be supported. The mode(s) supported shall require\n              explicitly activation at run time.\n              <br/>\n              After activation a RLT Master listens for RLT_Query messages. On reception of at least one\n              RLT_Query message a RLT Master responds with an RLT_Response message. Following that it\n              starts transmission of RLT_MasterTest messages within a maximum time frame of 250ms and\n              awaits the response from the RLT Slave for each RLT_MasterTest message sent.\n              A radio link test communication consists of a minimum of 16 and a maximum of 256\n              RLT_MasterTest messages. Timing distance between individual RLT_MasterTest messages shall\n              not exceed 250ms.\n              When the radio link test communication is completed the RLT Master gets deactivated\n              automatically.\n              <br/>\n              After activation a RLT Slave periodically transmits RLT_Query messages (1 message / 2s). It stops\n              transmission of RLT_Query messages as soon as it has received at least one RLT_Response\n              message. It then waits for RLT_MasterTest messages from the same EnOcean ID and replies to\n              them within a maximum delay of 100ms thru RLT_SlaveTest messages.\n              If it does not receive RLT_MasterTest messages from the same EnOcean ID for a time period of\n              5s, the RLT Slave restarts periodic transmission of RLT_Query messages.\n              The RLT Slave requires explicit deactivation.\n              <h4>RLT_Query Message</h4>\n              This Message is a \u201C4BS Teach-In Query\u201D message with FUNC, Type and Manufacturer ID set\n              properly. For details please refer to the description of the 4BS teach-in process.\n              <h4>RLT_Response Message</h4>\n              This Message is a \u201C4BS Teach-In Response\u201D message with FUNC, Type and Manufacturer ID set\n              properly. For details please refer to the description of the 4BS teach-in process.\n              As a RLT Master does accept teach-in of a RLT Slave only for the time period required by a single\n              RLT communication it shall indicate the EEP to be supported but the EnOcean ID of the RLT Slave\n              not to be stored permanently.",
  case: [{
    title: "RLT_MasterTest_4BS",
    description: "This is the 4BS message sent by the RLT Master during a radio link test communication",
    direction: "1",
    condition: {
      datafield: [{
        bitoffs: "29",
        bitsize: "2",
        value: "2"
      }, {
        bitoffs: "31",
        bitsize: "1",
        value: "0"
      }]
    },
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      reserved: {},
      data: "Not used",
      shortcut: "",
      description: "",
      info: {},
      bitoffs: "0",
      bitsize: "28",
      enum: {
        item: {
          value: "0",
          description: {}
        }
      }
    }, {
      data: "MSG_ID",
      shortcut: "MSGID",
      description: "Message ID",
      info: {},
      bitoffs: "29",
      bitsize: "2",
      enum: {
        item: {
          value: "2",
          description: {}
        }
      }
    }, {
      data: "MSG-Source",
      shortcut: "MSGS",
      description: "Message Source",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: {
          value: "0",
          description: "RLT-Master"
        }
      }
    }]
  }, {
    title: "RLT_SlaveTest_4BS",
    description: "This is the 4BS message sent by the RLT Slave in reply to an RLT_MasterTest_4BS message.",
    direction: "2",
    condition: {
      datafield: [{
        bitoffs: "29",
        bitsize: "2",
        value: "2"
      }, {
        bitoffs: "31",
        bitsize: "1",
        value: "1"
      }]
    },
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "Sub-Telegram Counter",
      shortcut: "STCNT",
      description: "related to RLT_MasterTest_4BS message received\n                  Repeater level 2",
      info: {},
      bitoffs: "0",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "not supported"
        }
      }, {
        item: {
          value: "1",
          description: "1 sub telegram"
        }
      }, {
        item: {
          value: "2",
          description: "2 sub telegram"
        }
      }, {
        item: {
          value: "3",
          description: "\u2265 3 sub telegram"
        }
      }]
    }, {
      data: "RSSI Level in dBm",
      shortcut: "RSLV",
      description: "related to RLT_MasterTest_4BS message received\n                  Repeater level 1",
      info: {},
      bitoffs: "2",
      bitsize: "6",
      enum: {
        item: [{
          value: "0x00",
          description: "not supported"
        }, {
          value: "0x01",
          description: "\u2265-31",
          unit: "dBm"
        }, {
          value: "0x02",
          description: "-32",
          unit: "dBm"
        }, {
          value: "0x3F",
          description: "\u2264-93",
          unit: "dBm"
        }]
      }
    }, {
      data: "Sub-Telegram Counter/RSSI Level in dBm",
      shortcut: "RSLV",
      description: "Related to RLT_MasterTest_4BS message received\n Repeater level 1 (for details see DB3)",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      enum: {
        item: {
          value: {},
          description: "See prev"
        }
      }
    }, {
      data: "Sub-Telegram Counter/RSSI Level in dBm",
      shortcut: "RSLV",
      description: "Related to RLT_MasterTest_4BS message received direct link",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: {
          value: {},
          description: "See prev"
        }
      }
    }, {
      data: "RSSI Level in dBm",
      shortcut: "RSLV",
      description: "Non-EnOcean signal detection since last RLT_MasterTest message\n RSSI Level with 6dB quantization steps",
      info: {},
      bitoffs: "24",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x00",
          description: "not supported"
        }, {
          value: "0x01",
          description: "\u2265 -31",
          unit: "dBm"
        }, {
          value: "0x02",
          description: "-32...-37",
          unit: "dBm"
        }, {
          value: "0x03",
          description: "-38...-43",
          unit: "dBm"
        }, {
          value: "0x04",
          description: "-44...-49",
          unit: "dBm"
        }, {
          value: "0x05",
          description: "-50...-55",
          unit: "dBm"
        }, {
          value: "0x06",
          description: "-56...-61",
          unit: "dBm"
        }, {
          value: "0x07",
          description: "-62...-67",
          unit: "dBm"
        }, {
          value: "0x08",
          description: "-68...-73",
          unit: "dBm"
        }, {
          value: "0x09",
          description: "-74...-79",
          unit: "dBm"
        }, {
          value: "0x0A",
          description: "-80...-85",
          unit: "dBm"
        }, {
          value: "0x0B",
          description: "\u2264 -92",
          unit: "dBm"
        }]
      }
    }, {
      data: "MSG_ID",
      shortcut: "MSGID",
      description: {},
      info: {},
      bitoffs: "29",
      bitsize: "2",
      enum: {
        item: {
          value: "2",
          description: {}
        }
      }
    }, {
      data: "MSG-Source",
      shortcut: "MSGS",
      description: {},
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: {
          value: "1",
          description: "RLT-Slave"
        }
      }
    }]
  }, {
    title: "RLT_MasterTest_1BS",
    description: `This is the 1BS message sent by the RLT Master during a radio link test communication.<br/><br/>
                REMARK: The column "Bitrange" is automatically generated from the telegram type and the offset. The column Bitrange shows currently DB_3 instead of DB_0. This isn't a bug in the XML, only a weakness of the formatting. AT THIS POINT, DB_0 WOULD BE CORRECT.<br/>`,
    direction: "1",
    condition: {
      datafield: {
        bitoffs: "31",
        bitsize: "1",
        value: "0"
      }
    },
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "4",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "RLT MSG-Counter",
      shortcut: "MC",
      description: "Round-trip, covering all RLT_x_1BS messages",
      info: {},
      spread: [
        {
          bitoffs: 0,
          bitsize: 4
        },
        {
          bitoffs: 5,
          bitsize: 2
        }
      ]
    }, {
      data: "MSG-Source",
      shortcut: "MSGS",
      description: "Message Source",
      info: {},
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: {
          value: "0",
          description: "RLT Master"
        }
      }
    }]
  }, {
    title: "RLT_SlaveTest_1BS",
    description: `This is the 1BS message sent by the RLT Slave in reply to an RLT_MasterTest_1BS message.<br/><br/>
                REMARK: The column "Bitrange" is automatically generated from the telegram type and the offset. The column Bitrange shows currently DB_3 instead of DB_0. This isn't a bug in the XML, only a weakness of the formatting. AT THIS POINT, DB_0 WOULD BE CORRECT.<br/>`,
    direction: "2",
    condition: {
      datafield: {
        bitoffs: "31",
        bitsize: "1",
        value: "1"
      }
    },
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "4",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "RLT MSG-Counter",
      shortcut: "MC",
      description: "Round-trip, covering all RLT_x_1BS messages",
      info: {},
      spread: [
        {
          bitoffs: 0,
          bitsize: 4
        },
        {
          bitoffs: 5,
          bitsize: 2
        }
      ]
    }, {
      data: "MSG-Source",
      shortcut: "MSGS",
      description: "Message Source",
      info: {},
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: {
          value: "1",
          description: "RLT-Slave"
        }
      }
    }]
  }],
  originalIndex: 137,
  eep: "a5-3f-00",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Universal",
  func_number: "0x3F",
  submitter: [
    "PROBARE"
  ]
};

// ../eep-transcoder/eep/a5-3f-7f.js
var a53f7f = {
  number: "0x7F",
  title: "Universal",
  status: "released",
  description: '\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Description</span>\n              <br/>\n              This profile was intended for manufacturer specific applications.\n              Every manufacturer may independently define the types within this profile.\n              <br/><br/>\n              This profile was replaced by the use of MSC-Telegrams with the advantage\n              of more payloads and the manufacturer Id as identification.\n              For future applications only use MSC-Telegrams.\n              <br/><br/>\n              This description is only necessary for legacy reasons.\n              <br/><br/>\n              <span style="border-bottom:2px groove #000000;">Data exchange</span>\n              <br/>Direction: unidirectional / bidirectional\n              <br/>Addressing: unicast (ADT) / broadcast\n              <br/>Communication trigger: event- & time-triggered\n              <br/>Communication interval: application specific\n              <br/>Trigger event: application specific\n              <br/>Tx delay: not specified\n              <br/>Rx timeout: not specified\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Teach-in</span>\n              <br/>Teach-in method: 4BS teach-in\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Security</span>\n              <br/>Encryption supported: no\n              <br/>Security level format: -',
  case: [{
    datafield: [{
      data: "LRN Bit",
      shortcut: "LRNB",
      description: "LRN Bit",
      bitoffs: "28",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Teach-in telegram"
        }, {
          value: "1",
          description: "Data telegram"
        }]
      }
    }, {
      data: "undefined",
      shortcut: "undef",
      description: "undefined",
      info: {},
      bitoffs: "0",
      bitsize: "28"
    }, {
      data: "undefined",
      shortcut: "undef",
      description: "undefined",
      info: {},
      bitoffs: "29",
      bitsize: "3"
    }]
  }],
  originalIndex: 138,
  eep: "a5-3f-7f",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Universal",
  func_number: "0x3F",
  submitter: [
    "EnOcean GmbH"
  ]
};

// ../eep-transcoder/eep/d2-00-01.js
var d20001 = {
  number: "0x01",
  title: "RCP with Temperature Measurement and Display (BI-DIR)",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="background-color:#F8DF36;">\n            Note: EEP Release 2.1, 2.5, and 2.6 reflected a wrong byte-order for all messages of this EEP!</span><br/>\n            <span style="background-color:#FFF08D;">\n            Example Message Type A:</span><br/>\n            <span style="background-color:#FFF08D;">\n            Instead of DB_1 = 0x01    DB_0 = 0x81 (which is correct for KP=1 and CV=1)</span><br/>\n            <span style="background-color:#FFF08D;">\n            by mistake DB_1 = 0x81    DB_0 = 0x11 (which is wrong) was printed.</span><br/>\n            <span style="background-color:#FFF08D;">\n            We apologize for the mistake.</span>',
  case: [{
    title: "Message type A / ID 01 (First User Action on RCP)",
    description: "Direction: Sensor -> Gateway<br/>\n            Transaction Response: Message Type B or Type E<br/>\n            Chaining: No<br/>\n            Timing: T1+ = 170ms<br/>\n            <img>graphics/EEP_D2-00-01_Message_A.png</img>",
    condition: {
      datafield: {
        bitoffs: "5",
        bitsize: "3",
        value: "1"
      }
    },
    datafield: [{
      data: "MsgId",
      shortcut: "MI",
      description: "Message Id; 0x01",
      info: {},
      bitoffs: "5",
      bitsize: "3",
      enum: {
        item: {
          value: "1",
          description: "Message Id"
        }
      }
    }, {
      reserved: {},
      bitoffs: "9",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "0",
      bitsize: "5"
    }, {
      data: "User Action",
      shortcut: "KP",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          value: "0x00",
          description: "not used"
        }, {
          value: "0x01",
          description: "Presence"
        }, {
          value: "0x02",
          description: "Temperature Set Point \u201Cdown\u201D or \u201C\u2014\u201C"
        }, {
          value: "0x03",
          description: "not used"
        }, {
          value: "0x04",
          description: "not used"
        }, {
          value: "0x05",
          description: "Temperature Set Point \u201Cup\u201D or \u201C+\u201D"
        }, {
          value: "0x06",
          description: "Fan"
        }, {
          min: "0x07",
          max: "0x1F",
          description: "Not Used"
        }]
      }
    }, {
      data: "ConfigValid",
      shortcut: "CV",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x00",
          description: "Configuration data not valid (e.g. never received message of type E)"
        }, {
          value: "0x01",
          description: "Configuration data valid"
        }]
      }
    }]
  }, {
    title: "Message Type B / ID 02 (Display Content)",
    description: "Direction: Gateway -> Sensor<br/>\n            Reply to Message Type A<br/>\n            Response: None<br/>\n            Chaining: Up to 2 messages per chain<br/>\n            Timing: T2+ = 300ms<br/>\n            <img>graphics/EEP_D2-00-01_Message_B.png</img><br/>\n            IMPORTANT NOTE:<br/>\n            The symbols Sa, Sb, Sc, Sd, Se are optional. One or more of those symbols are available\n            on the display only if the manufacturer of a RCP implements them in a specific design.\n            Thus, they are NOT mandatory for a RCP in order to comply with this EEP.<br/>",
    condition: {
      datafield: {
        bitoffs: "5",
        bitsize: "3",
        value: "2"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "32",
      bitsize: "3"
    }, {
      data: "MsgId",
      shortcut: "MI",
      description: "Message Id;0x02",
      info: {},
      bitoffs: "5",
      bitsize: "3",
      enum: {
        item: {
          value: "2",
          description: "Message Id"
        }
      }
    }, {
      data: "MoreData",
      shortcut: "MD",
      description: {},
      info: {},
      bitoffs: "4",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x00",
          description: "no more data"
        }, {
          value: "0x01",
          description: "more data will follow after T2+"
        }]
      }
    }, {
      data: "Fan",
      shortcut: "F",
      description: {},
      info: {},
      bitoffs: "1",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "Do not display"
        }, {
          value: "0x01",
          description: "Speed Level 0"
        }, {
          value: "0x02",
          description: "Speed Level 1"
        }, {
          value: "0x03",
          description: "Speed Level 2"
        }, {
          value: "0x04",
          description: "Speed Level 3"
        }, {
          min: "0x05",
          max: "0x07",
          description: "not used"
        }]
      }
    }, {
      data: "Fan manual",
      shortcut: "M",
      description: {},
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Fan manual"
        }]
      }
    }, {
      data: "Figure A Type",
      shortcut: "TA",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          value: "0x00",
          description: "Do not display"
        }, {
          value: "0x01",
          description: "Room Temperature",
          unit: "\xB0C"
        }, {
          value: "0x02",
          description: "Room Temperature",
          unit: "\xB0F"
        }, {
          value: "0x03",
          description: "Nominal Temperature",
          unit: "\xB0C"
        }, {
          value: "0x04",
          description: "Nominal Temperature",
          unit: "\xB0F"
        }, {
          value: "0x05",
          description: "Delta Temperature Set Point",
          unit: "\xB0C"
        }, {
          value: "0x06",
          description: "Delta Temperature Set Point",
          unit: "\xB0F"
        }, {
          value: "0x07",
          description: "Delta Temperature Set Point(graphic)"
        }, {
          value: "0x08",
          description: "Time 00:00 to 23:59 [24h]"
        }, {
          value: "0x09",
          description: "Time 00:00 to 11:59 [AM]"
        }, {
          value: "0x0A",
          description: "Time 00:00 to 11:59 [PM]"
        }, {
          value: "0x0B",
          description: "Date 01.01 to 31.12 [DD.MM]"
        }, {
          value: "0x0C",
          description: "Date 01.01 to 12.31 [MM.DD]"
        }, {
          value: "0x0D",
          description: "Illumination (linear) 0 to 9999",
          unit: "lx"
        }, {
          value: "0x0E",
          description: "Percentage 0 to 100",
          unit: "%"
        }, {
          value: "0x0F",
          description: "Parts per Million 0 to 9999",
          unit: "ppm"
        }, {
          value: "0x10",
          description: "Relative Humidity 0 to 100",
          unit: "% rH"
        }, {
          min: "0x11",
          max: "0x1F",
          description: "not used"
        }]
      }
    }, {
      data: "Presence",
      shortcut: "PR",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "Do not display"
        }, {
          value: "0x01",
          description: "Present"
        }, {
          value: "0x02",
          description: "Not present"
        }, {
          value: "0x03",
          description: "Night time reduction"
        }, {
          min: "0x04",
          max: "0x07",
          description: "not used"
        }]
      }
    }, {
      data: "Figure A Value",
      shortcut: "ZA",
      description: "Format according to TA:<br/>Byte-Order: Little-Endian!",
      info: {},
      bitoffs: "16",
      bitsize: "16",
      enum: {
        item: [{
          min: "0x01",
          max: "0x07",
          description: "0 ... 4000",
          unit: "0.01\xB0"
        }, {
          min: "0x08",
          max: "0x0A",
          description: "Time 0000 ... 2359"
        }, {
          min: "0x0B",
          max: "0x0C",
          description: "Date 0101 ... 3112"
        }, {
          value: "0x0D",
          description: "0 ... 9999",
          unit: "lx"
        }, {
          min: "0x0E",
          max: "0x10",
          description: "0 ... 10000",
          unit: "0.01%"
        }, {
          value: "0x0F",
          description: "0 ... 9999",
          unit: "ppm"
        }]
      }
    }, {
      data: "Heating",
      shortcut: "Sa",
      description: "optional",
      info: {},
      bitoffs: "39",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "Off"
        }, {
          value: "0x1",
          description: "On"
        }]
      }
    }, {
      data: "Cooling",
      shortcut: "Sb",
      description: "optional",
      info: {},
      bitoffs: "38",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "Off"
        }, {
          value: "0x1",
          description: "On"
        }]
      }
    }, {
      data: "Dew-Point",
      shortcut: "Sc",
      description: "optional",
      info: {},
      bitoffs: "37",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "Warning"
        }, {
          value: "0x1",
          description: "No warning"
        }]
      }
    }, {
      data: "Window",
      shortcut: "Sd",
      description: "optional",
      info: {},
      bitoffs: "36",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "Closed"
        }, {
          value: "0x1",
          description: "Opened"
        }]
      }
    }, {
      data: "User Notification",
      shortcut: "Se",
      description: "optional",
      info: {},
      bitoffs: "35",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "Off"
        }, {
          value: "0x1",
          description: "On"
        }]
      }
    }]
  }, {
    title: "Message Type C / ID 03 (Repeated User Action on RCP)",
    description: "Direction: Sensor -> Gateway<br/>\n            Fire and Forget<br/>\n            Response: None <br/>\n            Chaining: No<br/>\n            Timing: may only be sent within 5s from latest receipt of a Message Type B<br/>\n            <img>graphics/EEP_D2-00-01_Message_C.png</img><br/>",
    condition: {
      datafield: {
        bitoffs: "5",
        bitsize: "3",
        value: "3"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "4",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "0",
      bitsize: "1"
    }, {
      data: "MsgId",
      shortcut: "MI",
      description: "Message Id; 0x03",
      info: {},
      bitoffs: "5",
      bitsize: "3",
      enum: {
        item: {
          value: "3",
          description: "Message Id"
        }
      }
    }, {
      data: "Fan",
      shortcut: "F",
      description: {},
      info: {},
      bitoffs: "1",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "no change"
        }, {
          value: "0x01",
          description: "Speed Level 0"
        }, {
          value: "0x02",
          description: "Speed Level 1"
        }, {
          value: "0x03",
          description: "Speed Level 2"
        }, {
          value: "0x04",
          description: "Speed Level 3"
        }, {
          value: "0x05",
          description: "Speed Level Auto"
        }, {
          min: "0x06",
          max: "0x07",
          description: "not used"
        }]
      }
    }, {
      data: "Set Point A Type",
      shortcut: "TA",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          value: "0x00",
          description: "no change"
        }, {
          min: "0x01",
          max: "0x04",
          description: "not used"
        }, {
          value: "0x05",
          description: "Temperature Set Point [\xB0]"
        }, {
          min: "0x06",
          max: "0x1F",
          description: "not used"
        }]
      }
    }, {
      data: "Presence",
      shortcut: "PR",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "no change"
        }, {
          value: "0x01",
          description: "Present"
        }, {
          value: "0x02",
          description: "Not present"
        }, {
          value: "0x03",
          description: "Night time reduction"
        }, {
          min: "0x04",
          max: "0x07",
          description: "not used"
        }]
      }
    }, {
      data: "Set Point A Value",
      shortcut: "ZA",
      description: "Format according to TA: 0x05 [0.01\xB0]<br/><br/>Byte-Order: Little-Endian!",
      info: {},
      bitoffs: "16",
      bitsize: "16",
      range: {
        min: "-1270",
        max: "+1270"
      },
      scale: {
        min: "-12.70",
        max: "+12.70"
      },
      unit: "\xB0"
    }]
  }, {
    title: "Message Type D / ID 04 (Measurement Result)",
    description: "Direction: Sensor -> Gateway<br/>\n            Fire and Forget<br/>\n            Response: None<br/>\n            Chaining: No<br/>\n            Timing: None<br/>\n            <img>graphics/EEP_D2-00-01_Message_D.png</img><br/>",
    condition: {
      datafield: {
        bitoffs: "5",
        bitsize: "3",
        value: "4"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "5"
    }, {
      data: "MsgId",
      shortcut: "MI",
      description: "Message Id;0x04",
      info: {},
      bitoffs: "5",
      bitsize: "3",
      enum: {
        item: {
          value: "4",
          description: "Message Id"
        }
      }
    }, {
      data: "Channel A Value",
      shortcut: "VA",
      description: "Format according to TA",
      info: {},
      spread: [
        {
          bitoffs: "20",
          bitsize: "4"
        },
        {
          bitoffs: 8,
          bitsize: 8
        }
      ],
      bitoffs: 8,
      bitsize: 8,
      range: {
        min: 0,
        max: 4e3
      },
      scale: {
        min: 0,
        max: 40
      },
      unit: "\xB0C"
    }, {
      data: "Channel A Type",
      shortcut: "TA",
      description: {},
      info: {},
      bitoffs: "16",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x00",
          description: "Temperature [\xB0C]"
        }, {
          min: "0x01",
          max: "0x0E",
          description: "not used"
        }, {
          value: "0x0F",
          description: "Measurement result not valid"
        }]
      }
    }]
  }, {
    title: "Message Type E / ID 05 (Sensor Configuration)",
    description: "Direction: Gateway -> Sensor<br/>\n            Reply to Message Type A<br/>\n            Response: None <br/>\n            Chaining: Up to 2 messages per chain<br/>\n            Timing: T2+ = 300ms<br/>\n            <img>graphics/EEP_D2-00-01_Message_E.png</img><br/>",
    condition: {
      datafield: {
        bitoffs: "5",
        bitsize: "3",
        value: "5"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "28",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "44",
      bitsize: "1"
    }, {
      data: "MsgId",
      shortcut: "MI",
      description: "Message Id; 0x05",
      info: {},
      bitoffs: "5",
      bitsize: "3",
      enum: {
        item: {
          value: "5",
          description: "Message Id"
        }
      }
    }, {
      data: "MoreData",
      shortcut: "MD",
      description: {},
      info: {},
      bitoffs: "4",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "no more data"
        }, {
          value: "0x1",
          description: "more data will follow after T2+"
        }]
      }
    }, {
      data: "Set Point Range Limit",
      shortcut: "SPR",
      description: "Limit of Set Point Range, absolute value:<br/><br/>\n                REMARK:<br/>Set Point Range shall be symmetrical to 0\xB0",
      info: {},
      bitoffs: "9",
      bitsize: "7",
      enum: {
        item: [{
          value: "0x00",
          description: "Set Point disabled"
        }, {
          min: "0x01",
          max: "0x7F",
          description: "0,1\xB0 \u2026 12,7\xB0 [0,1\xB0]",
          scale: {
            min: "0.1",
            max: "12.7"
          },
          unit: "\xB0"
        }]
      }
    }, {
      data: "Set PointSteps",
      shortcut: "SPS",
      description: "Number of Set Point Steps:<br/><br/>\n                REMARK:<br/>Specifies the number of equidistant steps between 0 and Set Point Range Limit",
      info: {},
      bitoffs: "17",
      bitsize: "7",
      enum: {
        item: [{
          value: "0x00",
          description: "Set Point disabled"
        }, {
          min: "0x01",
          max: "0x7F",
          description: "1 \u2026 127",
          scale: {
            min: "1",
            max: "127"
          }
        }]
      }
    }, {
      data: "Temperature Measurement Timing",
      shortcut: "TT (LSB)",
      description: "Time between two subsequent Temperature measurements\n                  <br/><br/>\n                  LSB (Bit 3 ... 0)",
      info: {},
      bitoffs: "24",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x00",
          description: "Temperature measurement disabled"
        }, {
          min: "0x01",
          max: "0x3C",
          description: "10 \u2026 600s [10s]",
          scale: {
            min: "10",
            max: "600"
          },
          unit: "s"
        }]
      }
    }, {
      data: "Temperature Measurement Timing",
      shortcut: "TT (MSB)",
      description: "Time between two subsequent Temperature measurements\n                  <br/><br/>\n                  MSB (Bit 5 ... 4)",
      info: {},
      bitoffs: "38",
      bitsize: "2"
    }, {
      data: "Fan",
      shortcut: "F",
      description: "Number of Fan Speed Levels available to user:",
      info: {},
      bitoffs: "35",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x0",
          description: "Fan Speed disabled"
        }, {
          min: "0x1",
          max: "0x7",
          description: "1 \u2026 7",
          scale: {
            min: "1",
            max: "7"
          }
        }]
      }
    }, {
      data: "Presence",
      shortcut: "PR",
      description: "Number of Presence Levels available to user",
      info: {},
      bitoffs: "32",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x0",
          description: "Presence disabled"
        }, {
          min: "0x1",
          max: "0x7",
          description: "1 \u2026 7",
          scale: {
            min: "1",
            max: "7"
          }
        }]
      }
    }, {
      data: "Keep Alive Timing",
      shortcut: "KA",
      description: "Number of measurements (without trigger of a message\n                  Type D) between two subsequent \u201CKeep Alive messages\u201D:",
      info: {},
      bitoffs: "45",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x0",
          description: "Transmission of measurement result with\n                      each Temperature measurement"
        }, {
          min: "0x1",
          max: "0x7",
          description: "10 \u2026 70 measurements [step-size 10]",
          scale: {
            min: "10",
            max: "70"
          }
        }]
      }
    }, {
      data: "Significant Temperature Difference",
      shortcut: "ST",
      description: "Difference between two subsequent temperature\n                measurements to trigger a Message Type D [0.2\xB0]",
      info: {},
      bitoffs: "40",
      bitsize: "4",
      range: {
        min: "0x0",
        max: "0xF"
      },
      scale: {
        min: "0.0",
        max: "3.0"
      },
      unit: "\xB0"
    }]
  }],
  originalIndex: 139,
  eep: "d2-00-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Room Control Panel (RCP)",
  func_number: "0x00",
  submitter: [
    "Fr. Sauter AG"
  ]
};

// ../eep-transcoder/eep/d2-01-00.js
var d20100 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: "",
  case: [{
    title: "CMD 0x1 - Actuator Set Output",
    description: "This message is sent to an actuator. It controls switching / dimming of one or all channels of an actuator.\n			<br/><br/>\n            <img>graphics/EEP_D2-01-xx_CMD_01.png</img>\n            <br/>\n   			REMARK:<br/>\n            In case an Actuator Set Output message specifies a parameter that is not supported by the device being addresses, such device shall react as following:<br/>\n            - channel not supported by device -> ignore message<br/>\n            - dimming command to switching device -> no change of status<br/>\n            - dimming command with non supported speed -> dim with regular speed<br/>\n            <br/>\n            RECOMMENDATION:<br/>\n            Dimmers should take things like phase shifting into account to provide\n            dimming based on power consumption (results in brightness for lamps) rather than\n            interpreting percentage values as phase angle only.\n            <br/>\n            <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x01"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x01",
          description: "ID 01"
        }
      }
    }, {
      data: "Dim value",
      shortcut: "DV",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "Switch to new output value"
        }, {
          value: "0x01",
          description: "Dim to new output value \u2013 dim timer 1"
        }, {
          value: "0x02",
          description: "Dim to new output value \u2013 dim timer 2"
        }, {
          value: "0x03",
          description: "Dim to new output value \u2013 dim timer 3"
        }, {
          value: "0x04",
          description: "Stop dimming"
        }, {
          min: "0x05",
          max: "0x07",
          description: "not used"
        }]
      }
    }, {
      data: "I/O channel",
      shortcut: "I/O",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0x00",
          max: "0x1D",
          description: "Output channel (to load)"
        }, {
          value: "0x1E",
          description: "All output channels supported by the device"
        }, {
          value: "0x1F",
          description: "Input channel (from mains supply)"
        }]
      }
    }, {
      data: "Output value",
      shortcut: "OV",
      description: {},
      info: {},
      bitoffs: "17",
      bitsize: "7",
      enum: {
        item: [{
          value: "0x00",
          description: "Output value 0% or OFF"
        }, {
          min: "0x01",
          max: "0x64",
          description: "Output value 1% to 100% or ON"
        }, {
          min: "0x65",
          max: "0x7E",
          description: "Not used"
        }, {
          value: "0x7F",
          description: "Output value not valid / not applicable"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "1"
    }]
  }, {
    title: "CMD 0x2 - Actuator Set Local",
    description: "This message is sent to an actuator. It configures one or all channels of an actuator.\n                <br/>\n                <br/>Response Timing: None\n                <br/>\n                <br/>\n                RECOMMENDATION:\n                <br/>\n                In case the device implements an internal order for dim timers, this order\n                should be from \u201Cdim timer 1\u201D (fast) to \u201Cdim timer 3\u201D (slow).\n                The configured time shall always be interpreted for a full range (0 to 100%) dimming.\n                <br/>\n                <br/>\n                <img>graphics/EEP_D2-01-xx_CMD_02.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x02"
      }
    },
    datafield: [{
      data: "Taught-in devices",
      shortcut: "d/e",
      description: {},
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Disable taught-in devices (with different EEP)"
        }, {
          value: "0b1",
          description: "Enable taught-in devices (with different EEP)"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "1",
      bitsize: "3"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x02",
          description: "ID 02"
        }
      }
    }, {
      data: "Over current shut down",
      shortcut: "OC",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Over current shut down: static off"
        }, {
          value: "0b1",
          description: "Over current shut down: automatic restart"
        }]
      }
    }, {
      data: "reset over current shut down",
      shortcut: "RO",
      description: {},
      info: {},
      bitoffs: "9",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Reset over current shut down: not active"
        }, {
          value: "0b1",
          description: "Reset over current shut down: trigger signal"
        }]
      }
    }, {
      data: "Local control",
      shortcut: "LC",
      description: {},
      info: {},
      bitoffs: "10",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Disable local control"
        }, {
          value: "0b1",
          description: "Enable local control"
        }]
      }
    }, {
      data: "I/O channel",
      shortcut: "I/O",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0x00",
          max: "0x1D",
          description: "Output channel (to load)"
        }, {
          value: "0x1E",
          description: "All output channels supported by the device"
        }, {
          value: "0x1F",
          description: "Input channel (from mains supply)"
        }]
      }
    }, {
      data: "Dim timer 3",
      shortcut: "DT3",
      description: {},
      info: {},
      bitoffs: "20",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x00",
          description: "Not used"
        }, {
          min: "0x01",
          max: "0x0F",
          description: "Dim timer 3 [0,5 \u2026 7,5s / steps 0,5s]"
        }]
      }
    }, {
      data: "Dim timer 1",
      shortcut: "DT1",
      description: {},
      info: {},
      bitoffs: "28",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x00",
          description: "Not used"
        }, {
          min: "0x01",
          max: "0x0F",
          description: "Dim timer 1 [0,5 \u2026 7,5s / steps 0,5s]"
        }]
      }
    }, {
      data: "Dim timer 2",
      shortcut: "DT2",
      description: {},
      info: {},
      bitoffs: "16",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x00",
          description: "Not used"
        }, {
          min: "0x01",
          max: "0x0F",
          description: "Dim timer 2 [0,5 \u2026 7,5s / steps 0,5s]"
        }]
      }
    }, {
      data: "User interface indication",
      shortcut: "d/n",
      description: {},
      info: {},
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "User interface indication: day operation"
        }, {
          value: "0b1",
          description: "User interface indication: night operation"
        }]
      }
    }, {
      data: "Power Failure",
      shortcut: "PF",
      description: {},
      info: {},
      bitoffs: "25",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Disable Power Failure Detection"
        }, {
          value: "0b1",
          description: "Enable Power Failure Detection"
        }]
      }
    }, {
      data: "Default state",
      shortcut: "DS",
      description: {},
      info: {},
      bitoffs: "26",
      bitsize: "2",
      enum: {
        item: [{
          value: "0b00",
          description: "Default state: 0% or OFF"
        }, {
          value: "0b01",
          description: "Default state: 100% or ON"
        }, {
          value: "0b10",
          description: "Default state: remember previous state"
        }, {
          value: "0b11",
          description: "Not used"
        }]
      }
    }]
  }, {
    title: "CMD 0x3 - Actuator Status Query",
    description: "This message is sent to an actuator. It requests the status of one or all channels of an actuator.\n                <br/>\n                <br/>\n                Response Timing:<br/>\n                An Actuator Status Response message shall be received within a maximum of 300ms from the time of transmission of this message.\n                In case no such response is received within this time frame the action shall be treated as completed without result.\n                <br/>\n                <img>graphics/EEP_D2-01-xx_CMD_03.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x03"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x03",
          description: "ID 03"
        }
      }
    }, {
      data: "I/O channel",
      shortcut: "I/O",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0x00",
          max: "0x1D",
          description: "Output channel (to load)"
        }, {
          value: "0x1E",
          description: "All output channels supported by the device"
        }, {
          value: "0x1F",
          description: "Input channel (from mains supply)"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "3"
    }]
  }, {
    title: "CMD 0x4 - Actuator Status Response",
    description: "This message is sent by an actuator if one of the following events occurs:<br/>\n                          -	Status of one channel has been changed locally<br/>\n                          -	Message Actuator Status Query has been received<br/>\n                <br/>\n                Response Timing:<br/>\n                This message shall be sent within a maximum of 50ms from the time of reception of the Actuator Status Query message.<br/>\n                <br/>\n                <img>graphics/EEP_D2-01-xx_CMD_04.png</img>\n                <br/>\n                REMARK 1:<br/>\n                In case an Actuator Status Query message specifies a parameter that is not supported by the device being addresses, such device shall ignore the message and shall not answer using the Actuator Status Response message.<br/>\n                REMARK 2:<br/>\n                In case an Actuator Status Query message queries all output channels supported by a device being addresses, such device shall answer per each output channel by using an individual Actuator Measurement Response message.<br/>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x04"
      }
    },
    datafield: [{
      data: "Power Failure",
      shortcut: "PF",
      description: {},
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Power Failure Detection disabled/not supported"
        }, {
          value: "0b1",
          description: "Power Failure Detection enabled"
        }]
      }
    }, {
      data: "Power Failure Detection",
      shortcut: "PFD",
      description: {},
      info: {},
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Power Failure not detected/not supported/disabled"
        }, {
          value: "0b1",
          description: "Power Failure Detected"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "2",
      bitsize: "2"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x04",
          description: "ID 04"
        }
      }
    }, {
      data: "Over current switch off",
      shortcut: "OC",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Over current switch off: ready / not supported"
        }, {
          value: "0b1",
          description: "Over current switch off: executed"
        }]
      }
    }, {
      data: "Error level",
      shortcut: "EL",
      description: {},
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0b00",
          description: "Error level 0: hardware OK"
        }, {
          value: "0b01",
          description: "Error level 1: hardware warning"
        }, {
          value: "0b10",
          description: "Error level 2: hardware failure"
        }, {
          value: "0b11",
          description: "Error level not supported"
        }]
      }
    }, {
      data: "I/O channel",
      shortcut: "I/O",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0x00",
          max: "0x1D",
          description: "Output channel (to load)"
        }, {
          value: "0x1E",
          description: "Not applicable, do not use"
        }, {
          value: "0x1F",
          description: "Input channel (from mains supply)"
        }]
      }
    }, {
      data: "Local control",
      shortcut: "LC",
      description: {},
      info: {},
      bitoffs: "16",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Local control disabled / not supported"
        }, {
          value: "0b1",
          description: "Local control enabled"
        }]
      }
    }, {
      data: "Output value",
      shortcut: "OV",
      description: {},
      info: {},
      bitoffs: "17",
      bitsize: "7",
      enum: {
        item: [{
          value: "0x00",
          description: "Output value 0% or OFF"
        }, {
          min: "0x01",
          max: "0x64",
          description: "Output value 1% to 100% or ON"
        }, {
          min: "0x65",
          max: "0x7E",
          description: "Not used"
        }, {
          value: "0x7F",
          description: "output value not valid / not set"
        }]
      }
    }]
  }, {
    title: "CMD 0x5 - Actuator Set Measurement",
    description: "The command defines values at offset 32 and at offset 40 which\n              are the limits for the transmission periodicity of messages.\n              MIT must not be set to 0, MAT >= MIT.\n                <br/>\n                <br/>Response Timing: None\n                <br/>\n                <br/>\n                <img>graphics/EEP_D2-01-xx_CMD_05.png</img>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x05"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "20",
      bitsize: "1"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x05",
          description: "ID 05"
        }
      }
    }, {
      data: "Report measurement",
      shortcut: "RM",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Report measurement: query only"
        }, {
          value: "0b1",
          description: "Report measurement: query / auto reporting"
        }]
      }
    }, {
      data: "Reset measurement",
      shortcut: "RE",
      description: {},
      info: {},
      bitoffs: "9",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Reset measurement: not active"
        }, {
          value: "0b1",
          description: "Reset measurement: trigger signal"
        }]
      }
    }, {
      data: "Measurement mode",
      shortcut: "e/p",
      description: {},
      info: {},
      bitoffs: "10",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Energy measurement"
        }, {
          value: "0b1",
          description: "Power measurement"
        }]
      }
    }, {
      data: "I/O channel",
      shortcut: "I/O",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0x00",
          max: "0x1D",
          description: "Output channel (to load)"
        }, {
          value: "0x1E",
          description: "All output channels supported by the device"
        }, {
          value: "0x1F",
          description: "Input channel (from mains supply)"
        }]
      }
    }, {
      data: "Measurement delta to be reported",
      shortcut: "MD",
      description: {},
      info: {},
      spread: [
        {
          bitoffs: 24,
          bitsize: 8
        },
        {
          bitoffs: 16,
          bitsize: 4
        }
      ],
      range: {
        min: 0,
        max: 4095
      },
      scale: {
        min: 0,
        max: 4095
      },
      unit: {
        ref: "UN"
      }
    }, {
      data: "Unit",
      shortcut: "UN",
      description: {},
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "Energy [Ws]",
          unit: "Ws"
        }, {
          value: "0x01",
          description: "Energy [Wh]",
          unit: "Wh"
        }, {
          value: "0x02",
          description: "Energy [KWh]",
          unit: "kWh"
        }, {
          value: "0x03",
          description: "Power [W]",
          unit: "W"
        }, {
          value: "0x04",
          description: "Power [KW]",
          unit: "KW"
        }, {
          min: "0x05",
          max: "0x07",
          description: "Not used",
          unit: ""
        }]
      }
    }, {
      data: "Maximum time between two subsequent actuator messages",
      shortcut: "MAT",
      description: "Measurement Response messages [10s]",
      info: {},
      bitoffs: "32",
      bitsize: "8",
      enum: {
        item: [{
          min: "1",
          max: "255",
          scale: {
            min: "10",
            max: "2550"
          },
          unit: "s"
        }, {
          value: "0",
          description: "Reserved"
        }]
      }
    }, {
      data: "Minimum time between two subsequent actuator messages",
      shortcut: "MIT",
      description: "Measurement Response messages [s]",
      info: {},
      bitoffs: "40",
      bitsize: "8",
      enum: {
        item: [{
          min: "1",
          max: "255",
          scale: {
            min: "1",
            max: "255"
          },
          unit: "s"
        }, {
          value: "0",
          description: "Reserved"
        }]
      }
    }]
  }, {
    title: "CMD 0x6 - Actuator Measurement Query",
    description: "This message is sent to an actuator. The actuator replies with an Actuator Measurement Response message.\n                <br/>\n                <br/>Response Timing:\n                <br/>An Actuator Message Response message shall be received within a maximum of 300ms from the time of transmission of this message.\nIn case no such response is received within this time frame the action shall be treated as completed without result.\n                <br/>\n                <img>graphics/EEP_D2-01-xx_CMD_06.png</img>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x06"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x06",
          description: "ID 06"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "2"
    }, {
      data: "Query",
      shortcut: "qu",
      description: {},
      info: {},
      bitoffs: "10",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Query energy"
        }, {
          value: "0b1",
          description: "Query power"
        }]
      }
    }, {
      data: "I/O channel",
      shortcut: "I/O",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0x00",
          max: "0x1D",
          description: "Output channel (to load)"
        }, {
          value: "0x1E",
          description: "All output channels supported by the device"
        }, {
          value: "0x1F",
          description: "Input channel (from mains supply)"
        }]
      }
    }]
  }, {
    title: "CMD 0x7 - Actuator Measurement Response",
    description: "This message is sent by an actuator if one of the following events occurs:<br/>\n              -	Measurement results trigger an automated transmission (see Actuator Set Measurement message)<br/>\n              -	Message Actuator Measurement Query has been received\n                <br/>\n                <br/>Response Timing:<br/>\n                This message shall be sent within a maximum of 50ms from the time of reception of the Actuator Measurement Query message.\n                <br/>\n                <img>graphics/EEP_D2-01-xx_CMD_07.png</img>\n                <br/>\n                REMARK 1:<br/>\n                In case an Actuator Measurement Query message specifies a parameter that is not supported by the device addressed, such device shall ignore the message and shall not answer using the Actuator Measurement Response message.\n                <br/>\n                REMARK 2:<br/>\n                In case an Actuator Measurement Query message queries all output channels supported by a device being addresses, such device shall answer per each output channel by using an individual Actuator Measurement Response message.\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x07"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x07",
          description: "ID 07"
        }
      }
    }, {
      data: "Unit",
      shortcut: "UN",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "Energy [Ws]"
        }, {
          value: "0x01",
          description: "Energy [Wh]"
        }, {
          value: "0x02",
          description: "Energy [KWh]"
        }, {
          value: "0x03",
          description: "Power [W]"
        }, {
          value: "0x04",
          description: "Power [KW]"
        }, {
          min: "0x05",
          max: "0x07",
          description: "Not used"
        }]
      }
    }, {
      data: "I/O channel",
      shortcut: "I/O",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0x00",
          max: "0x1D",
          description: "Output channel (to load)"
        }, {
          value: "0x1E",
          description: "Not applicable, do not use"
        }, {
          value: "0x1F",
          description: "Input channel (from mains supply)"
        }]
      }
    }, {
      data: "Measurement value (4 bytes)",
      shortcut: "MV",
      description: "...",
      info: {},
      bitoffs: "16",
      bitsize: "32",
      range: {
        min: "0",
        max: "4294967295"
      },
      unit: "N/A"
    }]
  }, {
    title: "CMD 0x8 - Actuator Set Pilot Wire Mode",
    description: "<img>graphics/EEP_D2-01-xx_CMD_08.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x08"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "5"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x08",
          description: "ID 08"
        }
      }
    }, {
      data: "Pilotwire mode",
      shortcut: "PM",
      description: {},
      info: {},
      bitoffs: "13",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "Off"
        }, {
          value: "0x01",
          description: "Comfort"
        }, {
          value: "0x02",
          description: "Eco"
        }, {
          value: "0x03",
          description: "Anti-freeze"
        }, {
          value: "0x04",
          description: "Comfort-1"
        }, {
          value: "0x05",
          description: "Comfort-2"
        }]
      }
    }]
  }, {
    title: "CMD 0x9 - Actuator Pilot Wire Mode Query",
    description: "<img>graphics/EEP_D2-01-xx_CMD_09.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x09"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x09",
          description: "ID 09"
        }
      }
    }]
  }, {
    title: "CMD 0xA - Actuator Pilot Wire Mode Response",
    description: "<img>graphics/EEP_D2-01-xx_CMD_0A.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x0a"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "5"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x0A",
          description: "ID 0A"
        }
      }
    }, {
      data: "Pilotwire mode",
      shortcut: "PM",
      description: {},
      info: {},
      bitoffs: "13",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "Off"
        }, {
          value: "0x01",
          description: "Comfort"
        }, {
          value: "0x02",
          description: "Eco"
        }, {
          value: "0x03",
          description: "Anti-freeze"
        }, {
          value: "0x04",
          description: "Comfort-1"
        }, {
          value: "0x05",
          description: "Comfort-2"
        }]
      }
    }]
  }, {
    title: "CMD 0xB - Actuator Set External Interface Settings",
    description: "<img>graphics/EEP_D2-01-xx_CMD_0B.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x0b"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "51",
      bitsize: "5"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x0B",
          description: "ID 0B"
        }
      }
    }, {
      data: "I/O channel",
      shortcut: "I/O",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0x00",
          max: "0x1D",
          description: "Output channel (to load)"
        }, {
          value: "0x1E",
          description: "All output channels supported by the device"
        }, {
          value: "0x1F",
          description: "Input channel (from mains supply)"
        }]
      }
    }, {
      data: "Auto OFF Timer",
      shortcut: "AOT",
      description: "Timer to automatically set OFF output channel when it is set ON",
      info: {},
      bitoffs: "16",
      bitsize: "16",
      enum: {
        item: [{
          value: "0x0000",
          description: "Timer deactivated"
        }, {
          min: "0x0001",
          max: "0xFFFE",
          scale: {
            min: "0.1",
            max: "6553.4"
          },
          unit: "s"
        }, {
          value: "0xFFFF",
          description: "Does not modify saved value"
        }]
      }
    }, {
      data: "Delay OFF Timer",
      shortcut: "DOT",
      description: "Delay timer before setting output channel to OFF value received by radio cmd",
      info: {},
      bitoffs: "32",
      bitsize: "16",
      enum: {
        item: [{
          value: "0x0000",
          description: "Timer deactivated"
        }, {
          min: "0x0001",
          max: "0xFFFE",
          scale: {
            min: "0.1",
            max: "6553.4"
          },
          unit: "s"
        }, {
          value: "0xFFFF",
          description: "Does not modify saved value"
        }]
      }
    }, {
      data: "External Switch/Push Button",
      shortcut: "EBM",
      description: "External interface mode",
      info: {},
      bitoffs: "48",
      bitsize: "2",
      enum: {
        item: [{
          value: "0b00",
          description: "Not applicable"
        }, {
          value: "0b01",
          description: "External Switch"
        }, {
          value: "0b10",
          description: "External Push Button"
        }, {
          value: "0b11",
          description: "Auto detect"
        }]
      }
    }, {
      data: "2-state switch",
      shortcut: "SWT",
      description: "Switching state",
      info: {},
      bitoffs: "50",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b00",
          description: "Change of key state sets ON or OFF"
        }, {
          value: "0b01",
          description: "Specific ON/OFF positions.<br/>\n                    ON when contacts are closed.<br/>\n                    OFF when contacts are open."
        }]
      }
    }]
  }, {
    title: "CMD 0xC - Actuator External Interface Settings Query",
    description: "<img>graphics/EEP_D2-01-xx_CMD_0C.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x0c"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "3"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x0C",
          description: "ID 0C"
        }
      }
    }, {
      data: "I/O channel",
      shortcut: "I/O",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0x00",
          max: "0x1D",
          description: "Output channel (to load)"
        }, {
          value: "0x1E",
          description: "All output channels supported by the device"
        }, {
          value: "0x1F",
          description: "Input channel (from mains supply)"
        }]
      }
    }]
  }, {
    title: "CMD 0xD - Actuator External Interface Settings Response",
    description: "<img>graphics/EEP_D2-01-xx_CMD_0D.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x0d"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "51",
      bitsize: "5"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x0D",
          description: "ID 0D"
        }
      }
    }, {
      data: "I/O channel",
      shortcut: "I/O",
      description: {},
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0x00",
          max: "0x1D",
          description: "Output channel (to load)"
        }, {
          value: "0x1E",
          description: "Not applicable"
        }, {
          value: "0x1F",
          description: "Input channel (from mains supply)"
        }]
      }
    }, {
      data: "Auto OFF Timer",
      shortcut: "AOT",
      description: "Timer to automatically set OFF output channel when it is set ON",
      info: {},
      bitoffs: "16",
      bitsize: "16",
      enum: {
        item: [{
          value: "0x0000",
          description: "Timer deactivated"
        }, {
          min: "0x0001",
          max: "0xFFFE",
          scale: {
            min: "0.1",
            max: "6553.4"
          },
          unit: "s"
        }, {
          value: "0xFFFF",
          description: "Does not modify saved value"
        }]
      }
    }, {
      data: "Delay OFF Timer",
      shortcut: "DOT",
      description: "Delay timer before setting output channel to OFF value received by radio cmd",
      info: {},
      bitoffs: "32",
      bitsize: "16",
      enum: {
        item: [{
          value: "0x0000",
          description: "Timer deactivated"
        }, {
          min: "0x0001",
          max: "0xFFFE",
          scale: {
            min: "0.1",
            max: "6553.4"
          },
          unit: "s"
        }, {
          value: "0xFFFF",
          description: "Does not modify saved value"
        }]
      }
    }, {
      data: "External Switch/Push Button",
      shortcut: "EBM",
      description: "External interface mode",
      info: {},
      bitoffs: "48",
      bitsize: "2",
      enum: {
        item: [{
          value: "0b00",
          description: "Not applicable"
        }, {
          value: "0b01",
          description: "External Switch"
        }, {
          value: "0b10",
          description: "External Push Button"
        }, {
          value: "0b11",
          description: "Auto detect"
        }]
      }
    }, {
      data: "2-state switch",
      shortcut: "SWT",
      description: "Switching state",
      info: {},
      bitoffs: "50",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b00",
          description: "Change of key state sets ON or OFF"
        }, {
          value: "0b01",
          description: "Specific ON/OFF positions.\n                      <br/>ON when contacts are closed.\n                      <br/>OFF when contacts are open."
        }]
      }
    }]
  }],
  originalIndex: 140,
  eep: "d2-01-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: [
    "Team"
  ]
};

// ../eep-transcoder/eep/d2-01-01.js
var d20101 = {
  $t: "",
  number: "0x01",
  title: "Type 0x01 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 141,
  eep: "d2-01-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-02.js
var d20102 = {
  $t: "",
  number: "0x02",
  title: "Type 0x02 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 142,
  eep: "d2-01-02",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-03.js
var d20103 = {
  $t: "",
  number: "0x03",
  title: "Type 0x03 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 143,
  eep: "d2-01-03",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-04.js
var d20104 = {
  $t: "",
  number: "0x04",
  title: "Type 0x04 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 144,
  eep: "d2-01-04",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-05.js
var d20105 = {
  $t: "",
  number: "0x05",
  title: "Type 0x05 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 145,
  eep: "d2-01-05",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-06.js
var d20106 = {
  $t: "",
  number: "0x06",
  title: "Type 0x06 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 146,
  eep: "d2-01-06",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-07.js
var d20107 = {
  $t: "",
  number: "0x07",
  title: "Type 0x07 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 147,
  eep: "d2-01-07",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-08.js
var d20108 = {
  $t: "",
  number: "0x08",
  title: "Type 0x08 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 148,
  eep: "d2-01-08",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-09.js
var d20109 = {
  $t: "",
  number: "0x09",
  title: "Type 0x09 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 149,
  eep: "d2-01-09",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-0a.js
var d2010a = {
  $t: "",
  number: "0x0A",
  title: "Type 0x0A (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 150,
  eep: "d2-01-0a",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-0b.js
var d2010b = {
  $t: "",
  number: "0x0B",
  title: "Type 0x0B (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 151,
  eep: "d2-01-0b",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-0c.js
var d2010c = {
  $t: "",
  number: "0x0C",
  title: "Type 0x0C",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Description</span>\n            <br/>Intended for heating module with Pilotwire command and Energy Measurement.\n            <br/>Pilot wire includes 6 different modes:\n            <br/>- Off\n            <br/>- Comfort\n            <br/>- Eco\n            <br/>- Anti-freeze\n            <br/>- Comfort-1\xB0C\n            <br/>- Comfort-2\xB0C\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: bidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event-triggered\n            <br/>Communication interval: at each state change / every 5 minutes\n            <br/>Trigger event: actuator status change, consumption information change\n            <br/>Tx delay: -\n            <br/>Rx timeout: -\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: Universal teach-in (UTE)\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -\n            <br/>\n            <br/>\n          <table>\n          <tr>\n          <th>Supported command</th>\n          <th>Type 0x0C</th>\n          </tr>\n          <tr>\n            <td>0x1 \u2013 Actuator Set Output</td>\n            <td style="background-color:#FFFFFF">X</td>\n          </tr>\n          <tr>\n            <td>0x2 \u2013 Actuator Set Local</td>\n            <td style="background-color:#FFFFFF">X</td>\n          </tr>\n          <tr>\n            <td>0x3 \u2013 Actuator Status Query</td>\n            <td style="background-color:#FFFFFF">X</td>\n          </tr>\n          <tr>\n            <td>0x4 \u2013 Actuator Status Response</td>\n            <td style="background-color:#FFFFFF">X</td>\n          </tr>\n          <tr>\n            <td>0x5 \u2013 Actuator Set Measurement</td>\n            <td style="background-color:#FFFFFF">X</td>\n          </tr>\n          <tr>\n            <td>0x6 \u2013 Actuator Measurement Query</td>\n            <td style="background-color:#FFFFFF">X</td>\n          </tr>\n          <tr>\n            <td>0x7 \u2013 Actuator Measurement Response</td>\n            <td style="background-color:#FFFFFF">X</td>\n          </tr>\n          <tr>\n            <td>0x8 \u2013 Actuator Set Pilot Wire Mode</td>\n            <td style="background-color:#FFFFFF">X</td>\n          </tr>\n          <tr>\n            <td>0x9 \u2013 Actuator Pilot Wire Mode Query</td>\n            <td style="background-color:#FFFFFF">X</td>\n          </tr>\n          <tr>\n            <td>0xA \u2013 Actuator Pilot Wire Mode Response</td>\n            <td style="background-color:#FFFFFF">X</td>\n          </tr>\n          </table>\n          <br/>\n          <span style="border-bottom:2px groove #000000;">Telegram Definition</span>\n          <br/>\n          The telegrams corresponding to Command IDs: 0x1, 0x2, 0x3, 0x4, 0x5, 0x6\n          and 0x7 are already defined in EEP V2.6.2 and do not change.\n          <br/>\n          <br/>',
  ref: "d2-01-00",
  originalIndex: 152,
  eep: "d2-01-0c",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: [
    "AVIDSEN"
  ]
};

// ../eep-transcoder/eep/d2-01-0d.js
var d2010d = {
  $t: "",
  number: "0x0D",
  title: "Type 0x0D",
  status: "released",
  description: '\n		      <br/>\n		      <br/>\n              <br/>\n		      <span style="border-bottom:2px groove #000000;">Description for TYPE 0x0D, 0x0E, 0x0F, 0x12</span>\n		      <br/>\n              <br/>Add three commands:\n              <br/>- CMD 0xB \u2013 Actuator Set External Interface Settings\n              <br/>- CMD 0xC \u2013 Actuator External Interface Settings Query\n              <br/>- CMD 0xD \u2013 Actuator External Interface Settings Response\n              <br/>\n              <br/>Supported functions:\n              <br/>- External Switch/Push Button Control\n              <br/>- External Switch/Push Button Type (Bi-stable or Mono-stable / 2-state switch)\n              <br/>- Auto OFF Timer\n              <br/>- Delay OFF Timer\n              <br/>\n              <br/>Add D2-01-0D profile \u2013 Micro smart plug with 1 channel, no metering capabilities\n              <br/>Add D2-01-0E profile \u2013 Micro smart plug with 1 channel, and metering capabilities\n              <br/>Add D2-01-0F profile \u2013 Slot-in module with 1 channel, no metering capabilities\n              <br/>Add D2-01-12 profile \u2013 Slot-in module with 2 channels, no metering capabilities\n              <br/>\n              <br/>These new profiles are modifications of the existing ones, please find below a listing:\n              <br/>- Profile D2-01-0D is all same as D2-01-0A but with one modification\n              <br/>- Profile D2-01-0E is all same as D2-01-0B but with one modification\n              <br/>- Profiles D2-01-0F is all same as D2-01-0A but with three modifications\n              <br/>- Profiles D2-01-12 is all same as D2-01-0A but with four modifications\n		      <br/>\n		      <br/>\n		      <br/><span style="border-bottom:2px groove #000000;">Description of new supported functions</span><br/>\n		      <br/><b>External Switch/Push Button Control</b>\n		      <br/><br/>\n              As for \u201CLocal Control\u201D function, it indicates if the product can be\n              controlled using an additional physical interface, as an external\n              push button or wall switch. This interface is not directly integrated\n              to the product, but can be connected using wires.\n              <br/>\n		      <br/><b>External Switch/Push Button Type</b>\n              <ul><li>Bi-stable or Mono-stable:\n              <br/>\n              External interface can be composed of bi-stable button (switch) or\n              mono-stable button (push button). Depending of the type selected,\n              the product will have different reactions when switch/push button\n              actions are detected.\n              <br/>\n              - If bi-stable button type selected, each change of state (open or\n              close) toggle the output.\n              <br/>\n              - If mono-stable button type selected, first change of state (open\n              or close) toggle the output, second change (close or open) is\n              ignored, and output remains unchanged.\n		      <br/>\n              NOTE: If the product has more than one output, the external interface\n              type is applied for all outputs.\n              </li></ul>\n              <ul><li>2-state switch:\n              <br/>\n              This parameter is effective only if external switch/push button type\n              is set as \u201Cbi-stable\u201D. When this setting is enabled, the device will\n              turn ON output(s) when contacts are closed and turn OFF output(s)\n              when contacts are open. When this setting is disabled (default mode),\n              a change of contacts state will toggle the output(s).\n              </li></ul>\n		      <br/><b>Auto OFF Timer</b>\n		      <br/>\n              This functions turns OFF the output when time elapsed.\n		      <br/>\n              Use case: In corridor, when you turn ON the light, you want it\n              to be turned OFF automatically after a certain time.\n              <br/>\n              <br/><b>Delay OFF Timer</b>\n              <br/>\n              When the device receives a valid radio command, setting an output state to OFF,\n              instead of setting immediately the new output state, this function set\n              the new output state when time elapsed.\n              <br/>\n              Use Case: In hotel room, when you send a radio command (removing card\n              from card switch) to turn OFF the light, instead, turn OFF light after\n              a certain time, to allow people to leave the room.\n              <br/>\n              <br/>\n		      The addition of these functions required three new commands:\n              <br/>- CMD 0xB \u2013 Actuator Set External Interface Settings\n              <br/>- CMD 0xC \u2013 Actuator External Interface Settings Query\n		      <br/>- CMD 0xD \u2013 Actuator External Interface Settings Response\n              <br/>\n		      <br/>\n		      <span style="border-bottom:2px groove #000000;">Data exchange</span>\n		      <br/>Direction: bidirectional\n		      <br/>Addressing: broadcast\n		      <br/>Communication trigger: event triggered\n		      <br/>Communication interval: no fix interval\n		      <br/>Trigger event: actuator status change, consumption information\n		      <br/>Tx delay: -\n		      <br/>Rx timeout: -\n		      <br/>\n		      <br/>\n		      <span style="border-bottom:2px groove #000000;">Teach-in</span>\n		      <br/>Teach-in method: Universal teach-in (UTE)\n		      <br/>\n		      <br/>\n		      <span style="border-bottom:2px groove #000000;">Security</span>\n		      <br/>Encryption supported: no\n		      <br/>Security level format: -\n		      <br/>\n		      <br/>\n		      <br/>\n              <table>\n		        <tr>\n		          <th>Supported command</th>\n		          <th>Type 0x0D</th>\n		          <th>Type 0x0E</th>\n		          <th>Type 0x0F</th>\n		          <th>Type 0x12</th>\n		        </tr>\n		        <tr>\n		          <td>0x1 \u2013 Actuator Set Output</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		        </tr>\n		        <tr>\n		          <td>0x2 \u2013 Actuator Set Local</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		        </tr>\n		        <tr>\n		          <td>0x3 \u2013 Actuator Status Query</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		        </tr>\n		        <tr>\n		          <td>0x4 \u2013 Actuator Status Response</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		        </tr>\n		        <tr>\n		          <td>0x5 \u2013 Actuator Set Measurement</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		        </tr>\n		        <tr>\n		          <td>0x6 \u2013 Actuator Measurement Query</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		        </tr>\n		        <tr>\n		          <td>0x7 \u2013 Actuator Measurement Response</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		        </tr>\n		        <tr>\n		          <td>0x8 \u2013 Actuator Set Pilot Wire Mode</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		        </tr>\n		        <tr>\n		          <td>0x9 \u2013 Actuator Pilot Wire Mode Query</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		        </tr>\n		        <tr>\n		          <td>0xA \u2013 Actuator Pilot Wire Mode Response</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		        </tr>\n		        <tr>\n		          <td>0xB \u2013 Actuator Set External Interface Settings</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		        </tr>\n		        <tr>\n		          <td>0xC \u2013 Actuator External Interface Settings Query</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		        </tr>\n		        <tr>\n		          <td>0xD \u2013 Actuator External Interface Settings Response</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">-</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		          <td style="background-color:#FFFFFF">X</td>\n		        </tr>\n		      </table>\n		      <br/>',
  ref: "d2-01-00",
  originalIndex: 153,
  eep: "d2-01-0d",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: [
    "ID-RF"
  ]
};

// ../eep-transcoder/eep/d2-01-0e.js
var d2010e = {
  number: "0x0E",
  title: "Type 0x0E",
  status: "released",
  description: "",
  originalIndex: 154,
  eep: "d2-01-0e",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: ["ID-RF"]
};

// ../eep-transcoder/eep/d2-01-0f.js
var d2010f = {
  $t: "",
  number: "0x0F",
  title: "Type 0x0F",
  status: "released",
  description: '\n		      <br/>\n		      <br/>\n		      <span style="border-bottom:2px groove #000000;">Description see TYPE 0x0D</span>\n		      <br/>\n		      <br/>',
  ref: "d2-01-00",
  originalIndex: 155,
  eep: "d2-01-0f",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: [
    "ID-RF"
  ]
};

// ../eep-transcoder/eep/d2-01-10.js
var d20110 = {
  $t: "",
  number: "0x10",
  title: "Type 0x10 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 156,
  eep: "d2-01-10",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-11.js
var d20111 = {
  $t: "",
  number: "0x11",
  title: "Type 0x11 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-01-00",
  originalIndex: 157,
  eep: "d2-01-11",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: []
};

// ../eep-transcoder/eep/d2-01-12.js
var d20112 = {
  $t: "",
  number: "0x12",
  title: "Type 0x12",
  status: "released",
  description: '\n		      <br/>\n		      <br/>\n		      <span style="border-bottom:2px groove #000000;">Description see TYPE 0x0D</span>\n		      <br/>\n		      <br/>',
  ref: "d2-01-00",
  originalIndex: 158,
  eep: "d2-01-12",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Electronic switches and dimmers with Energy Measurement and Local Control",
  func_number: "0x01",
  submitter: [
    "ID-RF"
  ]
};

// ../eep-transcoder/eep/d2-02-00.js
var d20200 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: "",
  case: [{
    title: "CMD 0x1 - Sensor Measurement",
    description: "This message is sent by a sensor if one of the following events occurs:\n                <br/>\n                <br/>- Measurement results trigger an automated transmission (see Actuator Set Measurement message)\n                <br/>\n                <br/>- Message Actuator Measurement Query has been received\n                <br/>\n                <br/>Response Timing: None\n                <br/>\n                <br/>\n                <img>graphics/EEP_D2-02-xx_CMD_01.png</img>\n                <br/>\n                <br/>",
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x01",
          description: "ID 01"
        }
      }
    }, {
      data: "Measurement type",
      shortcut: "type",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "Temperature (0\u202665535: -40 to +120\xB0C)"
        }, {
          value: "0x01",
          description: "Illumination (0\u202665535: 0 to 2047lx)"
        }, {
          value: "0x02",
          description: "Occupancy (0: not detected; 1: detected)"
        }, {
          value: "0x03",
          description: "Smoke\n                      <br/>The following content applies for the value in DB_0 and DB_1:\n                      <br/>0x00 - No smoke detected\n                      <br/>0x01 - Smoke detected via ionization chamber\n                      <br/>0x02 - Smoke detected via optical chamber\n                      <br/>0x03 - Smoke detected via both chambers\n                      <br/>"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "11",
      bitsize: "5"
    }, {
      data: "Measurement value (2 bytes)",
      shortcut: "MV",
      description: "...",
      info: {},
      bitoffs: "16",
      bitsize: "16",
      range: {
        min: "0",
        max: "65535"
      },
      unit: "N/A"
    }]
  }, {
    title: "CMD 0x2 - Sensor Test/Trigger",
    description: "This message is sent to a sensor.\n              It causes the sensor to enter self-test mode or trigger an alarm (if supported).\n                <br/>\n                <br/>Response Timing: None\n                <br/>\n                <br/>\n                <img>graphics/EEP_D2-02-xx_CMD_02.png</img>\n                <br/>",
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x02",
          description: "ID 02"
        }
      }
    }, {
      data: "Self-test",
      shortcut: "ST",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Self-test mode"
        }, {
          value: "0b1",
          description: "Normal operation"
        }]
      }
    }, {
      data: "Trigger alarm",
      shortcut: "TA",
      description: {},
      info: {},
      bitoffs: "9",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Trigger alarm"
        }, {
          value: "0b1",
          description: "Normal operation"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "10",
      bitsize: "6"
    }]
  }, {
    title: "CMD 0x3 - Actuator Set Measurement",
    description: "This message is sent to a sensor. It configures the measurement behaviour of the sensor.\n                <br/>\n                <br/>Response Timing: None\n                <br/>\n                <br/>\n                <img>graphics/EEP_D2-02-xx_CMD_03.png</img>",
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x03",
          description: "ID 03"
        }
      }
    }, {
      data: "Report measurement",
      shortcut: "RM",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0b0",
          description: "Report measurement: query only"
        }, {
          value: "0b1",
          description: "Report measurement: query / auto reporting"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "9",
      bitsize: "7"
    }, {
      data: "Measurement delta to be reported",
      shortcut: "MD",
      description: {},
      info: {},
      spread: [
        {
          bitoffs: "24",
          bitsize: "8"
        },
        {
          bitoffs: "16",
          bitsize: "4"
        }
      ],
      range: {
        min: "0",
        max: "4095"
      },
      scale: {
        min: "0",
        max: "4095"
      },
      unit: {
        ref: "UN"
      }
    }, {
      reserved: {},
      bitoffs: "20",
      bitsize: "1"
    }, {
      data: "Unit",
      shortcut: "UN",
      description: {},
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x00",
          description: "Temperature (\xB0C)",
          unit: "\xB0C"
        }, {
          value: "0x01",
          description: "Illumination (lx)",
          unit: "lx"
        }, {
          min: "0x02",
          max: "0x07",
          description: "Not used",
          unit: ""
        }]
      }
    }, {
      data: "Maximum time between two subsequent Actuator",
      shortcut: "MAT",
      description: "Measurement Response messages [10s]",
      info: {},
      bitoffs: "32",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "10",
        max: "2550"
      },
      unit: "s"
    }, {
      data: "Minimum time between two subsequent Actuator",
      shortcut: "MIT",
      description: "Measurement Response messages [s]",
      info: {},
      bitoffs: "40",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "255"
      },
      unit: "s"
    }]
  }, {
    title: "CMD 0x4 - Sensor Measurement Query",
    description: "This message is sent to a sensor. The sensor replies with an Sensor Measurement message.\n                <br/>\n                <br/>Response Timing:\n                <br/>A Sensor Measurement message shall be received within a maximum of\n                300ms from the time of transmission of this message.\n                <br/>In case no such response is received within this time frame the action\n                shall be treated as completed without result.\n                <br/>\n                <img>graphics/EEP_D2-02-xx_CMD_04.png</img>",
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x04",
          description: "ID 04"
        }
      }
    }, {
      data: "Query",
      shortcut: "qu",
      description: {},
      info: {},
      bitoffs: "8",
      bitsize: "3",
      enum: {
        item: [{
          value: "0x0",
          description: "Query temperature"
        }, {
          value: "0x1",
          description: "Query illumination"
        }, {
          value: "0x2",
          description: "Query occupancy"
        }, {
          value: "0x3",
          description: "Query smoke"
        }, {
          min: "0x4",
          max: "0x7",
          description: "Not used"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "11",
      bitsize: "5"
    }]
  }],
  originalIndex: 159,
  eep: "d2-02-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Sensors for Temperature, Illumination, Occupancy And Smoke",
  func_number: "0x02",
  submitter: [
    "MSR-Office"
  ]
};

// ../eep-transcoder/eep/d2-02-01.js
var d20201 = {
  $t: "",
  number: "0x01",
  title: "Type 0x01 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-02-00",
  originalIndex: 160,
  eep: "d2-02-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Sensors for Temperature, Illumination, Occupancy And Smoke",
  func_number: "0x02",
  submitter: []
};

// ../eep-transcoder/eep/d2-02-02.js
var d20202 = {
  $t: "",
  number: "0x02",
  title: "Type 0x02 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-02-00",
  originalIndex: 161,
  eep: "d2-02-02",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Sensors for Temperature, Illumination, Occupancy And Smoke",
  func_number: "0x02",
  submitter: []
};

// ../eep-transcoder/eep/d2-03-00.js
var d20300 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: '\n              <br/>\n              <br/>\n                <b>EEP Properties:</b>\n                <br/>DATA EXCHANGE\n                <br/>Direction: unidirectional\n                <br/>Addressing: broadcast\n                <br/>Communication trigger: event-triggered\n                <br/>Communication interval: N/A\n                <br/>Trigger event: N/A\n                <br/>Tx delay: N/A\n                <br/>Rx timeout : N/A\n                <br/>\n                <br/>TEACH-IN\n                <br/>Teach-in method: Universal teach-in (UTE) + Secure Teach-in (for secure communication)\n                <br/>\n                <br/>SECURITY\n                <br/>Encryption supported: yes\n                <br/>\n                <br/>\n                <br/>\n                <b>EEP Family Table:</b>\n                <br/><br/>\n            <table>\n              <tr>\n                <th>Supported function</th>\n                <th>Type 00</th>\n              </tr>\n              <tr>\n                <td>2 Rocker Switch</td>\n                <td style="background-color:#FFFFFF">X</td>\n              </tr>\n            </table>',
  case: [{
    description: 'The encrypted telegram has the R-ORG 0x30. The payload (4 bits) is encrypted.\n              That telegram can be repeated. After decryption and the authentication of the CMAC,\n              the telegram turns into a non-encrypted EnOcean telegram with the R-ORG 0x32.\n              The payload will be expanded to 8 bits (4 MSB set to zero) and can then be\n              interpreted as described in the telegram definition table.\n                <br/>\n                <br/>The decrypted telegram may not be repeated as the information is not secure anymore.\n              The following table provides information about the conversion between the profiles\n              D2-03-00 and F6-02-01:\n                <br/>\n                <br/>\n                <table>\n                  <tr>\n                    <th>D2-03-00 DATA</th>\n                    <th>F6-02-01 DATA</th>\n                    <th>F6-02-01 STATUS</th>\n                  </tr>\n                  <tr>\n                    <td>0...4</td>\n                    <td style="background-color:#F1FFB7">-</td>\n                    <td style="background-color:#F1FFB7">-</td>\n                  </tr>\n                  <tr>\n                    <td>5</td>\n                    <td style="background-color:#F1FFB7">0x17</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>6</td>\n                    <td style="background-color:#F1FFB7">0x70</td>\n                    <td style="background-color:#F1FFB7">0x20</td>\n                  </tr>\n                  <tr>\n                    <td>7</td>\n                    <td style="background-color:#F1FFB7">0x37</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>8</td>\n                    <td style="background-color:#F1FFB7">0x10</td>\n                    <td style="background-color:#F1FFB7">0x20</td>\n                  </tr>\n                  <tr>\n                    <td>9</td>\n                    <td style="background-color:#F1FFB7">0x15</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>10</td>\n                    <td style="background-color:#F1FFB7">0x35</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>11</td>\n                    <td style="background-color:#F1FFB7">0x50</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>12</td>\n                    <td style="background-color:#F1FFB7">0x70</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>13</td>\n                    <td style="background-color:#F1FFB7">0x10</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>14</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                    <td style="background-color:#F1FFB7">0x30</td>\n                  </tr>\n                  <tr>\n                    <td>15</td>\n                    <td style="background-color:#F1FFB7">bxxx0xxxx</td>\n                    <td style="background-color:#F1FFB7">0x20</td>\n                  </tr>\n                </table>\n                <br/>\n                <br/>\n                <br/>',
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Rocker Information",
      shortcut: "RI2",
      description: "Information about pressed rockers (similar to RPS profiles)",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: [{
          min: "0",
          max: "4",
          description: "Reserved"
        }, {
          value: "5",
          description: "Button A1 + B0 pressed, energy bow pressed"
        }, {
          value: "6",
          description: "3 or 4 buttons pressed, energy bow pressed"
        }, {
          value: "7",
          description: "Button A0 + B0 pressed, energy bow pressed"
        }, {
          value: "8",
          description: "No buttons pressed, energy bow pressed"
        }, {
          value: "9",
          description: "Button A1 + B1 pressed, energy bow pressed"
        }, {
          value: "10",
          description: "Button A0 + B1 pressed, energy bow pressed"
        }, {
          value: "11",
          description: "Button B1 pressed, energy bow pressed"
        }, {
          value: "12",
          description: "Button B0 pressed, energy bow pressed"
        }, {
          value: "13",
          description: "Button A1 pressed, energy bow pressed"
        }, {
          value: "14",
          description: "Button A0 pressed, energy bow pressed"
        }, {
          value: "15",
          description: "Energy bow released"
        }]
      }
    }]
  }],
  originalIndex: 162,
  eep: "d2-03-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Light, Switching + Blind Control",
  func_number: "0x03",
  submitter: [
    "EnOcean GmbH"
  ]
};

// ../eep-transcoder/eep/d2-03-10.js
var d20310 = {
  number: "0x10",
  title: "Mechanical Handle",
  status: "released",
  description: '\n              <br/>\n              <br/>This document contains the description of\n              <span style="border-bottom:2px groove #000000;">decrypted</span> mechanical handle data.\n              The mechanical handle profile must be redefined because there is no\n              status field in EnOcean security available.\n              <br/>\n              <br/>\n              <b>EEP Properties:</b>\n              <br/>DATA EXCHANGE\n              <br/>Direction: unidirectional\n              <br/>Addressing: broadcast\n              <br/>Communication trigger: event-triggered\n              <br/>Communication interval: N/A\n              <br/>Trigger event: rotate mechanical handle\n              <br/>Tx delay: N/A\n              <br/>Rx timeout: N/A\n              <br/>\n              <br/>TEACH-IN\n              <br/>Teach-in method: Secure Teach-in, followed by special RPS teach-in\n              sequence: Mechanical handle (closed => opened => closed within 2s)\n              <br/>\n              <br/>SECURITY\n              <br/>Encryption supported: yes\n              <br/>Security level format:',
  case: [{
    datafield: [{
      data: "Window handle, decrypted data",
      shortcut: "WIN",
      description: "Movement of the window handle",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: [{
          value: "0b00000001",
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_01.png</img>'
        }, {
          value: "0b00000010",
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_02.png</img>'
        }, {
          value: "0b00000011",
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_03.png</img>'
        }, {
          value: "0b00000100",
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_04.png</img>'
        }, {
          value: "0b00000011",
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_05.png</img>'
        }, {
          value: "0b00000010",
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_06.png</img>'
        }, {
          value: "0b00000011",
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_07.png</img>'
        }, {
          value: "0b00000100",
          description: '<br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_08.png</img>'
        }]
      }
    }]
  }],
  originalIndex: 163,
  eep: "d2-03-10",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Light, Switching + Blind Control",
  func_number: "0x03",
  submitter: [
    "Eltako"
  ]
};

// ../eep-transcoder/eep/d2-03-20.js
var d20320 = {
  number: "0x20",
  title: "Beacon with Vibration Detection",
  status: "released",
  description: '\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Description</span>\n              <br/>\n              This profile is defined for the use in beacon devices.\n              Such devices transmit if the telegram was triggered by a vibration or the timer.\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Data exchange</span>\n              <br/>Direction: unidirectional\n              <br/>Addressing: broadcast\n              <br/>Communication trigger: event- & time-triggered\n              <br/>Communication interval: -\n              <br/>Trigger event: Vibration (movement), timer\n              <br/>Tx delay: -\n              <br/>Rx timeout: -\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Teach-in</span>\n              <br/>Teach-in method: N/A\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Security</span>\n              <br/>Encryption supported: no\n              <br/>Security level format: -\n              <br/>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Appendix</span>\n              <br/>\n              This beacon device can send a radio telegram at a prescribed timing.\n              The receiver can detect the beacon device with this transmission.\n              This device, when attached to a human body, can also be made into a\n              wide variety of beacon-based systems, which keep people within the\n              safe area, or keep them out of the danger zone.\n              <br/><br/>\n              This device can replace a battery with a vibration power generator.\n              The beacon device harvests power from human walking motion and\n              activates the radio transmitter circuit; it does not require\n              batteries of any kind, enabling maintenance-free operation in many\n              applications.\n              <br/><br/>\n              The product to be immediately released comes with no switches, and\n              the future product, to follow soon, will be equipped with pushbuttons\n              for wider application possibilities.',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "1",
      bitsize: "7"
    }, {
      data: "Energy Supply",
      shortcut: "ES",
      description: "Defines the energy source for the transmission",
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Battery supply"
        }, {
          value: "1",
          description: "Vibration generator supply"
        }]
      }
    }]
  }],
  originalIndex: 164,
  eep: "d2-03-20",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Light, Switching + Blind Control",
  func_number: "0x03",
  submitter: [
    "Star Micronics Co., LTD."
  ]
};

// ../eep-transcoder/eep/d2-04-00.js
var d20400 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: "",
  case: [{
    description: "The manufacturer will indicate emission rates versus battery autonomy and day night status.\n                <br/>\n                <br/>",
    datafield: [{
      data: "CO2",
      shortcut: "CO2",
      description: "Concentration (linear), 1 LSB = 7.84 ppm\n                  <br/>Or\n                  <br/>Concentration (linear), 1 LSB = 19.6 ppm",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "2000 (or 5000)"
      },
      unit: "ppm"
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Rel. Humidity (linear), 1 LSB = 0.5 %",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "200"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature (linear), 1 LSB = 0.2 \xB0C",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+51"
      },
      unit: "\xB0C"
    }, {
      data: "Day/Night",
      shortcut: "DN",
      description: "...",
      info: {},
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Day"
        }, {
          value: "1",
          description: "Night"
        }]
      }
    }, {
      data: "Battery autonomy",
      shortcut: "BA",
      description: "Battery autonomy",
      info: {},
      bitoffs: "25",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "100 - 87.5 %"
        }, {
          value: "1",
          description: "87.5 - 75 %"
        }, {
          value: "2",
          description: "75 - 62.5 %"
        }, {
          value: "3",
          description: "62.5 - 50 %"
        }, {
          value: "4",
          description: "50 - 37.5 %"
        }, {
          value: "5",
          description: "37.5 - 25 %"
        }, {
          value: "6",
          description: "25 - 12.5 %"
        }, {
          value: "7",
          description: "12.5 - 0 %"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "28",
      bitsize: "4"
    }]
  }],
  originalIndex: 165,
  eep: "d2-04-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: [
    "NanoSense"
  ]
};

// ../eep-transcoder/eep/d2-04-01.js
var d20401 = {
  $t: "",
  number: "0x01",
  title: "Type 0x01 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 166,
  eep: "d2-04-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-02.js
var d20402 = {
  $t: "",
  number: "0x02",
  title: "Type 0x02 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 167,
  eep: "d2-04-02",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-03.js
var d20403 = {
  $t: "",
  number: "0x03",
  title: "Type 0x03 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 168,
  eep: "d2-04-03",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-04.js
var d20404 = {
  $t: "",
  number: "0x04",
  title: "Type 0x04 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 169,
  eep: "d2-04-04",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-05.js
var d20405 = {
  $t: "",
  number: "0x05",
  title: "Type 0x05 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 170,
  eep: "d2-04-05",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-06.js
var d20406 = {
  $t: "",
  number: "0x06",
  title: "Type 0x06 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 171,
  eep: "d2-04-06",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-07.js
var d20407 = {
  $t: "",
  number: "0x07",
  title: "Type 0x07 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 172,
  eep: "d2-04-07",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-08.js
var d20408 = {
  $t: "",
  number: "0x08",
  title: "Type 0x08 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 173,
  eep: "d2-04-08",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-09.js
var d20409 = {
  $t: "",
  number: "0x09",
  title: "Type 0x09 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 174,
  eep: "d2-04-09",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-10.js
var d20410 = {
  $t: "",
  number: "0x10",
  title: "Type 0x10 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 175,
  eep: "d2-04-10",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-1a.js
var d2041a = {
  $t: "",
  number: "0x1A",
  title: "Type 0x1A (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 176,
  eep: "d2-04-1a",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-1b.js
var d2041b = {
  $t: "",
  number: "0x1B",
  title: "Type 0x1B (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 177,
  eep: "d2-04-1b",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-1c.js
var d2041c = {
  $t: "",
  number: "0x1C",
  title: "Type 0x1C (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 178,
  eep: "d2-04-1c",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-1d.js
var d2041d = {
  $t: "",
  number: "0x1D",
  title: "Type 0x1D (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 179,
  eep: "d2-04-1d",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-04-1e.js
var d2041e = {
  $t: "",
  number: "0x1E",
  title: "Type 0x1E (description: see table)",
  status: "released",
  description: "",
  ref: "d2-04-00",
  originalIndex: 180,
  eep: "d2-04-1e",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "CO2, Humidity, Temperature, Day/Night and Autonomy",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/d2-05-00.js
var d20500 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: "",
  case: [{
    title: "CMD 1 - Go to Position and Angle",
    description: "Once the actuator is configured either by the \u201CSet Parameters\u201D command\n              or through manual configuration (using local buttons) the position\n              of the blinds can be controlled with this command.\n              <br/>\n              When the actuator is set to \u201Cblockage\u201D mode, neither local nor\n              central positioning and configuration commands will be executed.\n              This mode is intended for putting the device temporarily out of\n              service, e.g. for a maintenance operation.\n              <br/>\n              When the actuator is set to the \u201Calarm\u201D mode neither local nor\n              central positioning and configuration commands will be executed.\n              Before entering the \u201Calarm\u201D mode, the actuator will execute the\n              \u201Calarm action\u201D as configured by the \u201CSet parameter\u201D command.\n              <br/>\n              When this command is sent with the \u201Cdeblockage\u201D option, the actuator\n              terminates the \u201Calarm\u201D or \u201Cblockage\u201D mode and enters the normal mode.\n              <br/>\n              <br/>\n              Exemplary illustration of data bytes 0 ... 3:\n              <br/>\n              <img>graphics/D2-05-xx_00.png</img>\n              <br/>",
    condition: {
      datafield: {
        bitoffs: "28",
        bitsize: "4",
        value: "0x01"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "20",
      bitsize: "1"
    }, {
      data: "Position",
      shortcut: "POS",
      description: "Vertical position",
      info: {},
      bitoffs: "1",
      bitsize: "7",
      enum: {
        item: [{
          min: "0",
          max: "100",
          scale: {
            min: "0",
            max: "100"
          },
          unit: "%"
        }, {
          value: "127",
          description: "Do not change"
        }]
      }
    }, {
      data: "Angle",
      shortcut: "ANG",
      description: "Rotation angle",
      info: {},
      bitoffs: "9",
      bitsize: "7",
      enum: {
        item: [{
          min: "0",
          max: "100",
          scale: {
            min: "0",
            max: "100"
          },
          unit: "%"
        }, {
          value: "127",
          description: "Do not change"
        }]
      }
    }, {
      data: "Repositioning",
      shortcut: "REPO",
      description: "How to adjust the internal positioning tracker\n                before going to the new position",
      info: {},
      bitoffs: "17",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Go directly to POS/ANG",
          info: {}
        }, {
          value: "1",
          description: "Go up (0%), then to POS/ANG"
        }, {
          value: "2",
          description: "Go down (100%), then to POS/ANG"
        }, {
          value: "3 ... 7",
          description: "Reserved"
        }]
      }
    }, {
      data: "Locking modes",
      shortcut: "LOCK",
      description: "Set/reset locking modes",
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Do not change",
          info: {}
        }, {
          value: "1",
          description: "Set blockage mode"
        }, {
          value: "2",
          description: "Set alarm mode"
        }, {
          value: "3 ... 6",
          description: "Reserved"
        }, {
          value: "7",
          description: "Deblockage"
        }]
      }
    }, {
      data: "Channel",
      shortcut: "CHN",
      description: "Channel address",
      info: {},
      bitoffs: "24",
      bitsize: "4",
      enum: {
        item: {
          value: "0",
          description: "Channel 1"
        }
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "28",
      bitsize: "4",
      enum: {
        item: {
          value: "1",
          description: "Goto command"
        }
      }
    }]
  }, {
    title: "CMD 2 - Stop",
    description: "This command immediately stops a running blind motor. It has no\n              effect when the actuator is in \u201Cblockage\u201D or \u201Calarm\u201D mode,\n              i.e. it will not stop an eventual \u201Cgo up\u201D or \u201Cgo down\u201D alarm action.\n              <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x02"
      }
    },
    datafield: [{
      data: "Channel",
      shortcut: "CHN",
      description: "Channel address",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: {
        item: {
          value: "0",
          description: "Channel 1"
        }
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "2",
          description: "Stop command"
        }
      }
    }]
  }, {
    title: "CMD 3 - Query Position and Angle",
    description: "This command requests the actuator to return a \u201Creply\u201D command.\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x03"
      }
    },
    datafield: [{
      data: "Channel",
      shortcut: "CHN",
      description: "Channel address",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: {
        item: {
          value: "0",
          description: "Channel 1"
        }
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "3",
          description: "Query command"
        }
      }
    }]
  }, {
    title: "CMD 4 - Reply Position and Angle",
    description: "Either upon request (\u201CQuery\u201D command) or after an internal trigger\n              (see EEP Properties) the actuator sends this command to inform\n              about its current state.\n              <br/>",
    condition: {
      datafield: {
        bitoffs: "28",
        bitsize: "4",
        value: "0x04"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "5"
    }, {
      data: "Position",
      shortcut: "POS",
      description: "Current vertical position",
      info: {},
      bitoffs: "1",
      bitsize: "7",
      enum: {
        item: [{
          min: "0",
          max: "100",
          scale: {
            min: "0",
            max: "100"
          },
          unit: "%"
        }, {
          value: "127",
          description: "Position unknown, will be known<br/> after the next goto cmd"
        }]
      }
    }, {
      data: "Angle",
      shortcut: "ANG",
      description: "Current rotation angle",
      info: {},
      bitoffs: "9",
      bitsize: "7",
      enum: {
        item: [{
          min: "0",
          max: "100",
          scale: {
            min: "0",
            max: "100"
          },
          unit: "%"
        }, {
          value: "127",
          description: "Angle unknown, will be known<br/> after the\n                    next goto cmd"
        }]
      }
    }, {
      data: "Locking modes",
      shortcut: "LOCK",
      description: "Current locking mode",
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Normal (no lock)",
          info: {}
        }, {
          value: "1",
          description: "Blockage mode"
        }, {
          value: "2",
          description: "Alarm mode"
        }, {
          value: "3 ... 7",
          description: "Reserved"
        }]
      }
    }, {
      data: "Channel",
      shortcut: "CHN",
      description: "Channel address",
      info: {},
      bitoffs: "24",
      bitsize: "4",
      enum: {
        item: {
          value: "0",
          description: "Channel 1"
        }
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "28",
      bitsize: "4",
      enum: {
        item: {
          value: "4",
          description: "Reply command"
        }
      }
    }]
  }, {
    title: "CMD 5 - Set parameters",
    description: "This command sets one or multiple configuration parameters of the\n              actuator. When a parameter value is set to \u201C-> no change\u201C this\n              parameter will not be modified. The VERT and ROT parameters describe\n              the duration needed by the motor for a full run of the blind, or\n              for a complete turn of the slats, respectively.\n              They have to be measured on site and assigned to the actuator.\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "36",
        bitsize: "4",
        value: "0x05"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "5"
    }, {
      data: "Set vertical",
      shortcut: "VERT",
      description: "Measured duration of a vertical run",
      info: {},
      bitoffs: "1",
      bitsize: "15",
      enum: {
        item: [{
          min: "500",
          max: "30000",
          scale: {
            min: "5000",
            max: "300000"
          },
          unit: "ms"
        }, {
          value: "0 ... 499",
          description: "Reserved"
        }, {
          value: "32767 (0x7FFF)",
          description: "-> No change"
        }]
      }
    }, {
      data: "Set rotation",
      shortcut: "ROT",
      description: "Measured duration of rotation",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: [{
          min: "1",
          max: "254",
          scale: {
            min: "10",
            max: "2540"
          },
          unit: "ms"
        }, {
          value: "0",
          description: "No rotation"
        }, {
          value: "255",
          description: "-> No change"
        }]
      }
    }, {
      data: "Set alarm action",
      shortcut: "AA",
      description: "Besides locking all other commands entering the\n                alarm mode results in",
      info: {},
      bitoffs: "29",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No action",
          info: {}
        }, {
          value: "1",
          description: "Immediate stop"
        }, {
          value: "2",
          description: "Go up (0%)"
        }, {
          value: "3",
          description: "Go down (100%)"
        }, {
          value: "4 ... 6",
          description: "Reserved"
        }, {
          value: "7",
          description: "-> No change"
        }]
      }
    }, {
      data: "Channel",
      shortcut: "CHN",
      description: "Channel address",
      info: {},
      bitoffs: "32",
      bitsize: "4",
      enum: {
        item: {
          value: "0",
          description: "Channel 1"
        }
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "36",
      bitsize: "4",
      enum: {
        item: {
          value: "5",
          description: "Set parameters command"
        }
      }
    }]
  }],
  originalIndex: 181,
  eep: "d2-05-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Blinds Control for Position and Angle",
  func_number: "0x05",
  submitter: [
    "AWAG Elektrotechnik AG"
  ]
};

// ../eep-transcoder/eep/d2-06-01.js
var d20601 = {
  number: "0x01",
  title: "Alarm, Position Sensor, Vacation Mode, Optional Sensors",
  status: "released",
  description: '\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Data exchange</span>\n            <br/>Direction: bidirectional\n            <br/>Addressing: broadcast\n            <br/>Communication trigger: event- & time-triggered\n            <br/>Communication interval: Time-Triggered: Default is 20 Minutes; Event-Triggered\n            <br/>Trigger event: Alarm, Handle Movement, Window Movement, Button Presses\n            <br/>Tx delay: 500 ms\n            <br/>Rx timeout: 100 ms\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Teach-in</span>\n            <br/>Teach-in method: Universal teach-in (UTE)\n            <br/>\n            <br/>\n            <span style="border-bottom:2px groove #000000;">Security</span>\n            <br/>Encryption supported: no\n            <br/>Security level format: -\n            <br/>\n            <br/><span style="border-bottom:2px groove #000000;">Product Description</span>\n            <br/>\n            <br/>The device represented by this EEP is a \u201CMulti-Sensor Window Handle\n            with Alarm Functionality\u201D. It is powered by two 1.5V AA batteries.\n            <br/>\n            <br/>It can be equipped with the following set of features:\n            <br/>- Alarm Sensor\n            <br/>- Handle Position Sensor\n            <br/>- Window Position Sensor\n            <br/>- Two General Purpose Buttons\n            <br/>- Temperature Sensor\n            <br/>- Humidity Sensor\n            <br/>- Illumination Sensor\n            <br/>- Motion Sensor\n            <br/>- Vacation Mode\n            <br/>- Battery Level Measurement\n            <br/>- Buzzer\n            <br/>- Two LEDs\n            <br/>\n            <br/>\n            Details to all features are listed below.\n            <br/>\n            <br/>\n            For pairing the bidirectional UTE method is used.\n            <br/>\n            <br/>\n            The device transmits the actual sensor values periodically (dDefault:\n            20 minutes) or on an event like \u201CHandle Movement\u201D or \u201CAlarm\u201D.\n            <br/>\n            <br/>\n            After each transmission of a packet the radio part of the handle is\n            in receive mode for a certain amount of time (default: 500 ms) and\n            accepts then messages from a paired Controller/Gateway/\u2026 .\n            For normal operation it is not necessary to send data to the handle.\n            It is just needed to make some configurations, get log data or\n            control some parts of the handle.\n            <br/>\n            <br/>\n            Because it is possible to have all possible permutations of the\n            handle features out in the market, the EEP approach presented in\n            this document is used. The variety of handle-products with different\n            equipped features does not fit well to the EEP family approach\n            preferred in the EnOcean world.\n            <br/>\n            <br/><span style="border-bottom:2px groove #000000;">Feature Description</span>\n            <br/>\n            The handle may have all or a subset of the features described here.\n            If a feature is not available (e.g. the sensor is not equipped),\n            then this will be marked in the radio telegram (see detailed tables below).\n            <br/>\n            <br/>\n            <b>Burglary Alarm Sensor</b><br/>\n            The handle can detect if someone tries to commit burglary on the\n            window the handle is mounted on. The Burglary Alarm Sensor is\n            automatically enabled/disabled each time the window is closed/opened.\n            If an alarm is detected, a radio packet is send with \u201CBurglary Alarm\n            Triggered\u201D flag set and (if handle is equipped with a buzzer) a local\n            alarm sound is generated by the internal buzzer for a certain amount\n            of time (180 s). During the alarm time a repeated \u201CBurglary Alarm On\u201D\n            is send every 15 seconds + Random Offset (0\u20267 seconds).\n            <br/>\n            <br/>\n            <b>Protection Plus Alarm Sensor</b><br/>\n            Protection Plus is a feature, which generates an alarm every time the\n            handle is moved. Due to security reasons, the detailed documentation\n            about this feature is available from SODA GmbH only under NDA.\n            <br/>\n            <br/>\n            <b>Handle Position</b><br/>\n            The position of the handle is detected and transmitted on every change.\n            <br/>\n            <br/>\n            <b>Window Position</b><br/>\n            It is possible to detect if the window is tilted or not tilted.\n            A packet is send on every change.\n            <br/>\n            <br/>\n            <b>General Purpose Buttons</b><br/>\n            There are two buttons on the handle which can be used as general\n            purpose buttons to control blinds/shutters, lights, etc. <br/>\n            A packet is send when a button is pressed and again when it is released.\n            <br/>\n            <br/>\n            <b>Temperature Sensor, Humidity Sensor, Brightness Sensor</b><br/>\n            The environmental sensors are updated periodically (adjustable,\n            default: 20 minutes) and after this a packet with the updated values\n            is send.\n            <br/>\n            <br/>\n            <b>Motion Sensor</b><br/>\n            The handle can be equipped with a PIR Motion sensor which triggers a\n            packet every time a motion change is detected.\n            <br/>\n            <br/>\n            <b>Vacation Mode</b><br/>\n            If the Vacation Mode is enabled, the red LEDs on the sides of the\n            handle light up every few seconds. This signalizes that the alarm\n            monitoring is active and should be daunting for potential burglars.<br/>\n            The Vacation Mode can be enabled/disabled by a radio command or by a\n            button press locally on the handle. If it is activated locally, a\n            radio packet is sent out to signalize the change to a paired gateway.\n            <br/>\n            <br/>\n            <b>Battery Monitor</b><br/>\n            The handle monitors its battery level and transmits the state of the\n            battery.\n            <br/>\n            <br/>\n            <b>Battery Low Click</b><br/>\n            If enabled, the handle also makes some click noises when the battery\n            level is critical.\n            <br/>\n            <br/>\n            <b>Handle Closed Click</b><br/>\n            The handle generates a click sound every time the handle is closed\n            (put in downward position). This signalizes the activation of the\n            alarm monitoring and gives an acoustic feedback to the user. This\n            click sound can be enabled or disabled by a radio command.\n            <br/>\n            <br/><span style="border-bottom:2px groove #000000;">Communication Example</span>\n            <br/><img>graphics/D2-06-01_01.png</img>\n            <br/>\n            <br/><span style="border-bottom:2px groove #000000;">Telegram Definition</span>\n            <br/>\n            <br/>The device uses different types of messages for bidirectional\n            communication. The MSB of the VLD payload defines the type of message\n            as shown below in the first table. The different message types are\n            listed in the second table. A detailed description of each message\n            type is then followed in separate tables.\n            <br/>\n            <br/>\n            <img>graphics/D2-06-01_02.png</img>',
  case: [{
    title: "Message Type 0x00: Sensor Values",
    description: "<img>graphics/D2-06-01_MT00.png</img>\n              <br/>",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x00"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "77",
      bitsize: "3"
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Descriptor of this message",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x00",
          description: "Message Type Sensor Values"
        }
      }
    }, {
      data: "Burglary Alarm",
      shortcut: "BAL",
      description: "Burglary Alarm Trigger Signal",
      info: {},
      bitoffs: "8",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x0",
          description: "Burglary Alarm Not Triggered"
        }, {
          value: "0x1",
          description: "Burglary Alarm Triggered"
        }, {
          min: "0x2",
          max: "0xD",
          description: "Reserved"
        }, {
          value: "0xE",
          description: "Supported + Invalid",
          info: {}
        }, {
          value: "0xF",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Protection Plus Alarm",
      shortcut: "PPAL",
      description: "Protection Plus Alarm Trigger Signal",
      info: {},
      bitoffs: "12",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x0",
          description: "Protection Plus Alarm Not Triggered"
        }, {
          value: "0x1",
          description: "Protection Plus Alarm Triggered"
        }, {
          min: "0x2",
          max: "0xD",
          description: "Reserved"
        }, {
          value: "0xE",
          description: "Supported + Invalid"
        }, {
          value: "0xF",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Handle Position",
      shortcut: "HP",
      description: "Position of Handle",
      info: {},
      bitoffs: "16",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x0",
          description: "Handle Position Undefined"
        }, {
          value: "0x1",
          description: "Handle Up"
        }, {
          value: "0x2",
          description: "Handle Down"
        }, {
          value: "0x3",
          description: "Handle Left"
        }, {
          value: "0x4",
          description: "Handle Right"
        }, {
          min: "0x5",
          max: "0xD",
          description: "Reserved"
        }, {
          value: "0xE",
          description: "Supported + Invalid",
          info: {}
        }, {
          value: "0xF",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Window State",
      shortcut: "WS",
      description: "State of Window",
      info: {},
      bitoffs: "20",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x0",
          description: "Window State Undefined"
        }, {
          value: "0x1",
          description: "Window Not Tilted"
        }, {
          value: "0x2",
          description: "Window Tilted"
        }, {
          min: "0x3",
          max: "0xD",
          description: "Reserved"
        }, {
          value: "0xE",
          description: "Supported + Invalid",
          info: {}
        }, {
          value: "0xF",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Button Right",
      shortcut: "BR",
      description: "Button Right Activities",
      info: {},
      bitoffs: "24",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x0",
          description: "No Change"
        }, {
          value: "0x1",
          description: "Button Pressed"
        }, {
          value: "0x2",
          description: "Button Released"
        }, {
          min: "0x3",
          max: "0xD",
          description: "Reserved"
        }, {
          value: "0xE",
          description: "Supported + Invalid"
        }, {
          value: "0xF",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Button Left",
      shortcut: "BL",
      description: "Button Left Activities",
      info: {},
      bitoffs: "28",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x0",
          description: "No Change"
        }, {
          value: "0x1",
          description: "Button Pressed"
        }, {
          value: "0x2",
          description: "Button Released"
        }, {
          min: "0x3",
          max: "0xD",
          description: "Reserved"
        }, {
          value: "0xE",
          description: "Supported + Invalid"
        }, {
          value: "0xF",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Motion",
      shortcut: "M",
      description: "Motion sensing like typical PIR sensors",
      info: {},
      bitoffs: "32",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x0",
          description: "Motion Not Triggered"
        }, {
          value: "0x1",
          description: "Motion Triggered"
        }, {
          min: "0x2",
          max: "0xD",
          description: "Reserved"
        }, {
          value: "0xE",
          description: "Supported + Invalid"
        }, {
          value: "0xF",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Vacation Mode",
      shortcut: "V",
      description: "If Vacation Mode is active, the LEDs of<br/>\n                the handle light up every few seconds.<br/><br/>\n                Vacation Mode can be activated remotely<br/>\n                by a radio command or locally by a<br/>\n                button press at the handle",
      info: {},
      bitoffs: "36",
      bitsize: "4",
      enum: {
        item: [{
          value: "0x0",
          description: "No Change"
        }, {
          value: "0x1",
          description: "Vacation Mode Locally Switched On"
        }, {
          value: "0x2",
          description: "Vacation Mode Locally Switched Off"
        }, {
          min: "0x3",
          max: "0xD",
          description: "Reserved"
        }, {
          value: "0xE",
          description: "Supported + Invalid"
        }, {
          value: "0xF",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "T",
      description: "Measurement of Temperature in linear<br/>\n                0.32 \xB0C steps",
      info: {},
      bitoffs: "40",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "250",
          scale: {
            min: "-20",
            max: "+60"
          },
          unit: "\xB0C"
        }, {
          min: "251",
          max: "253",
          description: "Reserved"
        }, {
          value: "254",
          description: "Supported + Invalid"
        }, {
          value: "255",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Humidity",
      shortcut: "H",
      description: "Measurement of Relative Humidity in<br/>\n                linear 0.5 % steps",
      info: {},
      bitoffs: "48",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "200",
          scale: {
            min: "0",
            max: "100"
          },
          unit: "%"
        }, {
          min: "201",
          max: "253",
          description: "Reserved"
        }, {
          value: "254",
          description: "Supported + Invalid"
        }, {
          value: "255",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Illumination",
      shortcut: "I",
      description: "Illumination linear in 1 lx steps",
      info: {},
      bitoffs: "56",
      bitsize: "16",
      enum: {
        item: [{
          min: "0",
          max: "60000",
          scale: {
            min: "0",
            max: "60000"
          },
          unit: "lx"
        }, {
          value: "60001",
          description: "Over Range"
        }, {
          min: "60002",
          max: "65533",
          description: "Reserved"
        }, {
          value: "65534",
          description: "Supported + Invalid"
        }, {
          value: "65535",
          description: "Not Supported"
        }]
      }
    }, {
      data: "Battery State",
      shortcut: "BS",
      description: "State of the battery charge<br/>\n                in 5 % steps",
      info: {},
      bitoffs: "72",
      bitsize: "5",
      enum: {
        item: [{
          min: "0",
          max: "20",
          scale: {
            min: "0",
            max: "100"
          },
          unit: "%"
        }, {
          min: "21",
          max: "31",
          description: "Reserved"
        }]
      }
    }]
  }, {
    title: "Message Type 0x10: Configuration Report",
    description: "<img>graphics/D2-06-01_MT10.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x10"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "11",
      bitsize: "5"
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Descriptor of this message",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x10",
          description: "Message Type Configuration Report"
        }
      }
    }, {
      data: "Vacation Mode",
      shortcut: "VMR",
      description: "Status of Vacation Mode",
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "Vacation Mode is Off"
        }, {
          value: "0x1",
          description: "Vacation Mode is On"
        }]
      }
    }, {
      data: "Handle Closed Click",
      shortcut: "HCCR",
      description: "Status of Handle Closed Click Feature",
      info: {},
      bitoffs: "9",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "Handle Closed Click Feature is Disabled"
        }, {
          value: "0x1",
          description: "Handle Closed Click Feature is Enabled"
        }]
      }
    }, {
      data: "Battery Low Click",
      shortcut: "BLCR",
      description: "Status of Battery Low Click Feature",
      info: {},
      bitoffs: "10",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "Battery Low Click Feature is Disabled"
        }, {
          value: "0x1",
          description: "Battery Low Click Feature is Enabled"
        }]
      }
    }, {
      data: "Sensor Update Interval",
      shortcut: "SUIR",
      description: "Interval in seconds between the update<br/>\n                of the environmental sensors.<br/><br/>\n                After each update period a Sensor Value<br/>\n                packet (Message Type 0x00, see above)<br/>\n                is transmitted",
      info: {},
      bitoffs: "16",
      bitsize: "16",
      enum: {
        item: [{
          min: "0x0000",
          max: "0x0004",
          description: "Reserved"
        }, {
          min: "0x0005",
          max: "0xFFFF",
          scale: {
            min: "5",
            max: "65535"
          },
          unit: "s"
        }]
      }
    }, {
      data: "Vacation Blink Interval",
      shortcut: "VBIR",
      description: "Interval in seconds between the LED blinks<br/>\n                when Vacation Mode is activated",
      info: {},
      bitoffs: "32",
      bitsize: "8",
      enum: {
        item: [{
          min: "0x00",
          max: "0x02",
          description: "Reserved"
        }, {
          min: "0x03",
          max: "0xFF",
          scale: {
            min: "3",
            max: "255"
          },
          unit: "s"
        }]
      }
    }]
  }, {
    title: "Message Type 0x20: Log Data 01",
    description: "<img>graphics/D2-06-01_MT20.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x20"
      }
    },
    datafield: [{
      data: "Message Type",
      shortcut: "MT",
      description: "Descriptor of this message",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x20",
          description: "Message Type Log Data 01"
        }
      }
    }, {
      data: "Power Ons",
      shortcut: "PON",
      description: "Number of Power Ons",
      info: {},
      bitoffs: "8",
      bitsize: "32",
      enum: {
        item: {
          min: "0x00000000",
          max: "0xFFFFFFFF",
          description: {}
        }
      }
    }, {
      data: "Alarms",
      shortcut: "ALL",
      description: "Number of Alarms",
      info: {},
      bitoffs: "40",
      bitsize: "32",
      enum: {
        item: {
          min: "0x00000000",
          max: "0xFFFFFFFF",
          description: {}
        }
      }
    }]
  }, {
    title: "Message Type 0x21: Log Data 02",
    description: "<img>graphics/D2-06-01_MT21.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x21"
      }
    },
    datafield: [{
      data: "Message Type",
      shortcut: "MT",
      description: "Descriptor of this message",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x21",
          description: "Message Type Log Data 02"
        }
      }
    }, {
      data: "Handle Movements Closed",
      shortcut: "HMC",
      description: "Number of Handle Movements Closed",
      info: {},
      bitoffs: "8",
      bitsize: "32",
      enum: {
        item: {
          min: "0x00000000",
          max: "0xFFFFFFFF",
          description: {}
        }
      }
    }, {
      data: "Handle Movements Opened",
      shortcut: "HMO",
      description: "Number of Handle Movements Opened",
      info: {},
      bitoffs: "40",
      bitsize: "32",
      enum: {
        item: {
          min: "0x00000000",
          max: "0xFFFFFFFF",
          description: {}
        }
      }
    }, {
      data: "Handle Movements Tilted",
      shortcut: "HMT",
      description: "Number of Handle Movements Tilted",
      info: {},
      bitoffs: "72",
      bitsize: "32",
      enum: {
        item: {
          min: "0x00000000",
          max: "0xFFFFFFFF",
          description: {}
        }
      }
    }]
  }, {
    title: "Message Type 0x22: Log Data 03",
    description: "<img>graphics/D2-06-01_MT22.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x22"
      }
    },
    datafield: [{
      data: "Message Type",
      shortcut: "MT",
      description: "Descriptor of this message",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x22",
          description: "Message Type Log Data 03"
        }
      }
    }, {
      data: "Window Tilts",
      shortcut: "WT",
      description: "Number of Window Tilts",
      info: {},
      bitoffs: "8",
      bitsize: "32",
      enum: {
        item: {
          min: "0x00000000",
          max: "0xFFFFFFFF",
          description: {}
        }
      }
    }]
  }, {
    title: "Message Type 0x23: Log Data 04",
    description: "<img>graphics/D2-06-01_MT23.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x23"
      }
    },
    datafield: [{
      data: "Message Type",
      shortcut: "MT",
      description: "Descriptor of this message",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x23",
          description: "Message Type Log Data 04"
        }
      }
    }, {
      data: "Button Right Presses",
      shortcut: "BRP",
      description: "Number of Button Right Presses",
      info: {},
      bitoffs: "8",
      bitsize: "32",
      enum: {
        item: {
          min: "0x00000000",
          max: "0xFFFFFFFF",
          description: {}
        }
      }
    }, {
      data: "Button Left Presses",
      shortcut: "BLP",
      description: "Number of Button Left Presses",
      info: {},
      bitoffs: "40",
      bitsize: "32",
      enum: {
        item: {
          min: "0x00000000",
          max: "0xFFFFFFFF",
          description: {}
        }
      }
    }]
  }, {
    title: "Message Type 0x80: Control and Settings",
    description: "<img>graphics/D2-06-01_MT80.png</img>\n                <b>Notes:</b><br/>\n                The following settings are stored non volatile inside the handle\n                and only need to be send on a change request:<br/>\n                - Handle Closed Click Feature<br/>\n                - Battery Low Click Feature<br/>\n                - Sensor Update Interval<br/>\n                - Vacation Blink Interval<br/>\n                <br/>\n                It is possible to trigger several of the actions in one message;\n                e.g. if DB3.7 and DB3.6 both are set, the handle will transmit\n                the messages with the message types: 0x10, 0x20, 0x21, 0x22 and 0x23\n                <br/><br/>",
    condition: {
      datafield: {
        bitoffs: "0",
        bitsize: "8",
        value: "0x80"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "15",
      bitsize: "1"
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Descriptor of this message",
      info: {},
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x80",
          description: "Message Type Control and Settings"
        }
      }
    }, {
      data: "Get Configuration Settings",
      shortcut: "GCS",
      description: "Start Transmission of the Configuration<br/>\n                Settings (Message Type 0x10, see above)",
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "No Change"
        }, {
          value: "0x1",
          description: "Start Transmission"
        }]
      }
    }, {
      data: "Get Log Data",
      shortcut: "GLD",
      description: "Start Transmission of the Log Data Packets<br/>\n                (Message Type 0x2x, see above)",
      info: {},
      bitoffs: "9",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "No Change"
        }, {
          value: "0x1",
          description: "Start Transmission"
        }]
      }
    }, {
      data: "Vacation Mode",
      shortcut: "VMS",
      description: "Set Vacation Mode",
      info: {},
      bitoffs: "10",
      bitsize: "1",
      enum: {
        item: [{
          value: "0x0",
          description: "Switch Vacation Mode Off"
        }, {
          value: "0x1",
          description: "Switch Vacation Mode On"
        }]
      }
    }, {
      data: "Handle Closed Click",
      shortcut: "HCCS",
      description: "Set Handle Closed Click Feature",
      info: {},
      bitoffs: "11",
      bitsize: "2",
      enum: {
        item: [{
          value: "0x0",
          description: "No Change"
        }, {
          value: "0x1",
          description: "Disable Handle Closed Click Feature"
        }, {
          value: "0x2",
          description: "Enable Handle Closed Click Feature"
        }, {
          value: "0x3",
          description: "Reserved"
        }]
      }
    }, {
      data: "Battery Low Click",
      shortcut: "BLCS",
      description: "Set Battery Low Click Feature",
      info: {},
      bitoffs: "13",
      bitsize: "2",
      enum: {
        item: [{
          value: "0x0",
          description: "No Change"
        }, {
          value: "0x1",
          description: "Disable Battery Low Click Feature"
        }, {
          value: "0x2",
          description: "Enable Battery Low Click Feature"
        }, {
          value: "0x3",
          description: "Reserved"
        }]
      }
    }, {
      data: "Sensor Update Interval",
      shortcut: "SUIS",
      description: "Set Sensor Update Interval",
      info: {},
      bitoffs: "16",
      bitsize: "16",
      enum: {
        item: [{
          value: "0x0000",
          description: "No Change"
        }, {
          min: "0x0001",
          max: "0x0004",
          description: "Reserved"
        }, {
          min: "0x0005",
          max: "0xFFFF",
          scale: {
            min: "5",
            max: "65535"
          },
          unit: "s"
        }]
      }
    }, {
      data: "Vacation Blink Interval",
      shortcut: "VBIS",
      description: "Set Vacation Blink Interval",
      info: {},
      bitoffs: "32",
      bitsize: "8",
      enum: {
        item: [{
          value: "0x00",
          description: "No Change"
        }, {
          min: "0x01",
          max: "0x02",
          description: "Reserved"
        }, {
          min: "0x03",
          max: "0xFF",
          scale: {
            min: "3",
            max: "255"
          },
          unit: "s"
        }]
      }
    }]
  }],
  originalIndex: 182,
  eep: "d2-06-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Multisensor Window Handle",
  func_number: "0x06",
  submitter: [
    "SODA GmbH"
  ]
};

// ../eep-transcoder/eep/d2-10-00.js
var d21000 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: "",
  case: [{
    title: "General Message",
    description: "<br/>\n              exemplary illustration of data bytes 0/1:\n              <br/>\n              <img>graphics/D2-10-xx_00.png</img>\n              <br/>",
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "2"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "0",
          description: "General Message"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "Information request classifier",
      shortcut: "IRC",
      description: "Defines the type of information request",
      info: {},
      bitoffs: "10",
      bitsize: "3",
      enum: [{
        item: {
          value: "7",
          description: "Reserved"
        }
      }, {
        item: {
          value: "6",
          description: "Reserved"
        }
      }, {
        item: {
          value: "5",
          description: "Reserved"
        }
      }, {
        item: {
          value: "4",
          description: "Time program request"
        }
      }, {
        item: {
          value: "3",
          description: "Room control setup request"
        }
      }, {
        item: {
          value: "2",
          description: "Configuration request"
        }
      }, {
        item: {
          value: "1",
          description: "Data request"
        }
      }, {
        item: {
          value: "0",
          description: "Acknowledge request"
        }
      }]
    }, {
      data: "Feedback classifier",
      shortcut: "FBC",
      description: "Defines the type of feedback",
      info: {},
      bitoffs: "13",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Message repetition request"
        }
      }, {
        item: {
          value: "1",
          description: "Telegram repetition request"
        }
      }, {
        item: {
          value: "0",
          description: "Acknowledge / heartbeat"
        }
      }]
    }, {
      data: "General message type",
      shortcut: "GMT",
      description: "Indicates if the general message is a feedback or\n                an information request",
      info: {},
      bitoffs: "15",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Information request"
        }
      }, {
        item: {
          value: "0",
          description: "Feedback"
        }
      }]
    }]
  }, {
    title: "Data Message",
    description: "",
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "26",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "32",
      bitsize: "1"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "1",
          description: "Data Message"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Measured humidity",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Humidity validity flag",
      shortcut: "HVF",
      description: "Indicates if the value for humidity is valid",
      info: {},
      bitoffs: "16",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Fan speed control",
      shortcut: "FS",
      description: "Fan speed",
      info: {},
      bitoffs: "17",
      bitsize: "7",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Fan speed validity flag",
      shortcut: "FSV",
      description: "Indicates if the fan speed value is valid",
      info: {},
      bitoffs: "24",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Fan speed mode",
      shortcut: "FSM",
      description: "Defines the mode the fan runs in",
      info: {},
      bitoffs: "25",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Individual fan speed control"
        }
      }, {
        item: {
          value: "0",
          description: "Central fan speed control"
        }
      }]
    }, {
      data: "Custom warning 2",
      shortcut: "CW2",
      description: "Flag for an application specific warning",
      info: {},
      bitoffs: "27",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "True"
        }
      }, {
        item: {
          value: "0",
          description: "False"
        }
      }]
    }, {
      data: "Custom warning 1",
      shortcut: "CW1",
      description: "Flag for an application specific warning",
      info: {},
      bitoffs: "28",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "True"
        }
      }, {
        item: {
          value: "0",
          description: "False"
        }
      }]
    }, {
      data: "Mold warning",
      shortcut: "MW",
      description: "Flag for an application depending mold warning",
      info: {},
      bitoffs: "29",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "True"
        }
      }, {
        item: {
          value: "0",
          description: "False"
        }
      }]
    }, {
      data: "Window open detection",
      shortcut: "WOD",
      description: "Indicates if an open window is detected",
      info: {},
      bitoffs: "30",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Open"
        }
      }, {
        item: {
          value: "1",
          description: "Closed"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Battery status",
      shortcut: "BS",
      description: "Battery status",
      info: {},
      bitoffs: "33",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Critical"
        }
      }, {
        item: {
          value: "2",
          description: "Low"
        }
      }, {
        item: {
          value: "1",
          description: "Good"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Solar-powered status",
      shortcut: "SPS",
      description: "Indicates if the device is powered by its solar cell",
      info: {},
      bitoffs: "35",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Not solar-powered"
        }
      }, {
        item: {
          value: "0",
          description: "Solar-powered"
        }
      }]
    }, {
      data: "PIR status",
      shortcut: "PIR",
      description: "Indicates if the PIR detected a movement",
      info: {},
      bitoffs: "36",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Locked"
        }
      }, {
        item: {
          value: "2",
          description: "Movement detected"
        }
      }, {
        item: {
          value: "1",
          description: "No movement detected"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Occupancy button status",
      shortcut: "OBS",
      description: "Indicates if the occupancy button was pressed and its occupancy status",
      info: {},
      bitoffs: "38",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Button pressed and unoccupied"
        }
      }, {
        item: {
          value: "1",
          description: "Button pressed and occupied"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Cooling",
      shortcut: "COO",
      description: "Recent cooling operation status",
      info: {},
      bitoffs: "40",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Automatic"
        }
      }, {
        item: {
          value: "2",
          description: "Off"
        }
      }, {
        item: {
          value: "1",
          description: "On"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Heating",
      shortcut: "HEA",
      description: "Recent heating operation status",
      info: {},
      bitoffs: "42",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Automatic"
        }
      }, {
        item: {
          value: "2",
          description: "Off"
        }
      }, {
        item: {
          value: "1",
          description: "On"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Room control mode",
      shortcut: "RCM",
      description: "Recent room control mode",
      info: {},
      bitoffs: "44",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Building protection"
        }
      }, {
        item: {
          value: "2",
          description: "Pre-comfort"
        }
      }, {
        item: {
          value: "1",
          description: "Economy"
        }
      }, {
        item: {
          value: "0",
          description: "Comfort"
        }
      }]
    }, {
      data: "Temperature set point validity",
      shortcut: "SPV",
      description: "Indicates if the temperature set point value is valid",
      info: {},
      bitoffs: "46",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature validity",
      shortcut: "TPV",
      description: "Indicates if the temperature value is valid",
      info: {},
      bitoffs: "47",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature set point",
      shortcut: "TSP",
      description: "Recent temperature set point",
      info: {},
      bitoffs: "48",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Recent room temperature",
      info: {},
      bitoffs: "56",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }, {
    title: "Configuration Message",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "23",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "54",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "61",
      bitsize: "2"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "2",
          description: "Configuration Message"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "PIR status lock",
      shortcut: "PSL",
      description: "Indicates if the PIR status is transmitted or kept inside the room control panel",
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Temperature scale lock",
      shortcut: "TSL",
      description: "Indicates if the temperature scale can be changed at the room control panel",
      info: {},
      bitoffs: "9",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Display content lock",
      shortcut: "DCL",
      description: "Indicates if the display content can be changed at the room control panel",
      info: {},
      bitoffs: "10",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Date / time lock",
      shortcut: "DTL",
      description: "Indicates if date and time can be changed at the room control panel",
      info: {},
      bitoffs: "11",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Time program lock",
      shortcut: "TPL",
      description: "Indicates if the time program can be changed at the room control panel",
      info: {},
      bitoffs: "12",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Occupancy button lock",
      shortcut: "OBL",
      description: "Indicates if the occupancy status can be changed at the room control panel",
      info: {},
      bitoffs: "13",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Temperature set point lock",
      shortcut: "SPL",
      description: "Indicates if the temperature set point can be changed at the room control panel",
      info: {},
      bitoffs: "14",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Fan speed lock",
      shortcut: "FSL",
      description: "Indicates if the fan speed can be changed at the room control panel",
      info: {},
      bitoffs: "15",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Radio communication interval",
      shortcut: "RCI",
      description: "Defines the longest time between two consecutive telegrams (clock-based communication)",
      info: {},
      bitoffs: "16",
      bitsize: "6",
      enum: [{
        item: {
          value: "63",
          description: "24 hours"
        }
      }, {
        item: {
          value: "62",
          description: "12 hours"
        }
      }, {
        item: {
          value: "61",
          description: "3 hours"
        }
      }, {
        item: {
          min: "1",
          max: "60",
          description: "1...60 min"
        }
      }, {
        item: {
          value: "0",
          description: "No communication interval"
        }
      }]
    }, {
      data: "Key lock",
      shortcut: "KL",
      description: "Indicates if all buttons on the device are locked",
      info: {},
      bitoffs: "22",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Display content",
      shortcut: "DC",
      description: "Defines the main display content",
      info: {},
      bitoffs: "24",
      bitsize: "3",
      enum: [{
        item: {
          value: "7",
          description: "Humidity"
        }
      }, {
        item: {
          value: "6",
          description: "Display off"
        }
      }, {
        item: {
          value: "5",
          description: "Temperature set point"
        }
      }, {
        item: {
          value: "4",
          description: "Room temperature (external)"
        }
      }, {
        item: {
          value: "3",
          description: "Room temperature (internal)"
        }
      }, {
        item: {
          value: "2",
          description: "Time"
        }
      }, {
        item: {
          value: "1",
          description: "Default"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature scale",
      shortcut: "TS",
      description: "Defines the used temperature scale for the room control panel display and menus",
      info: {},
      bitoffs: "27",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "\xB0 Fahrenheit"
        }
      }, {
        item: {
          value: "2",
          description: "\xB0 Celsius"
        }
      }, {
        item: {
          value: "1",
          description: "Default"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Daylight saving time flag",
      shortcut: "DST",
      description: "Indicates if daylight saving time is supported",
      info: {},
      bitoffs: "29",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Not supported"
        }
      }, {
        item: {
          value: "0",
          description: "Supported"
        }
      }]
    }, {
      data: "Time notation",
      shortcut: "TN",
      description: "Defines the used time notation",
      info: {},
      bitoffs: "30",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "12 h"
        }
      }, {
        item: {
          value: "2",
          description: "24 h"
        }
      }, {
        item: {
          value: "1",
          description: "Default"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Day",
      shortcut: "DAY",
      description: "Date format: YYYY/MM/DD",
      info: {},
      bitoffs: "32",
      bitsize: "5",
      range: {
        min: "1",
        max: "31"
      },
      scale: {
        min: "1",
        max: "31"
      },
      unit: "day"
    }, {
      data: "Month",
      shortcut: "MON",
      description: "Date format: YYYY/MM/DD",
      info: {},
      bitoffs: "37",
      bitsize: "4",
      range: {
        min: "1",
        max: "12"
      },
      scale: {
        min: "1",
        max: "12"
      },
      unit: "mon"
    }, {
      data: "Year",
      shortcut: "YR",
      description: "Date format: YYYY/MM/DD <br/>year = 2000 + x",
      info: {},
      bitoffs: "41",
      bitsize: "7",
      range: {
        min: "0",
        max: "127"
      },
      scale: {
        min: "2000",
        max: "2127"
      },
      unit: "year"
    }, {
      data: "Minute",
      shortcut: "MIN",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "48",
      bitsize: "6",
      range: {
        min: "0",
        max: "59"
      },
      scale: {
        min: "0",
        max: "59"
      },
      unit: "min"
    }, {
      data: "Hour",
      shortcut: "HR",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "56",
      bitsize: "5",
      range: {
        min: "0",
        max: "23"
      },
      scale: {
        min: "0",
        max: "23"
      },
      unit: "h"
    }, {
      data: "Date / time update flag",
      shortcut: "DTU",
      description: "Indicates if an update of date or time is provided",
      info: {},
      bitoffs: "63",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Update"
        }
      }, {
        item: {
          value: "0",
          description: "No update"
        }
      }]
    }]
  }, {
    title: "Room Control Setup",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "40",
      bitsize: "4"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "3",
          description: "Room Control Setup"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "Temperature set point building protection mode",
      shortcut: "SPB",
      description: "Temperature set point building protection mode",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature set point pre-comfort mode",
      shortcut: "SPP",
      description: "Temperature set point pre-comfort mode",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature set point economy mode",
      shortcut: "SPE",
      description: "Temperature set point economy mode",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature set point comfort mode",
      shortcut: "SPC",
      description: "Temperature set point comfort mode",
      info: {},
      bitoffs: "32",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature set point flag building protection mode",
      shortcut: "SFB",
      description: "Indicates if a temperature set point for the building protection mode is provided",
      info: {},
      bitoffs: "44",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature set point flag pre-comfort mode",
      shortcut: "SFP",
      description: "Indicates if a temperature set point for the pre-comfort mode is provided",
      info: {},
      bitoffs: "45",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature set point flag economy mode",
      shortcut: "SFE",
      description: "Indicates if a temperature set point for the economy mode is provided",
      info: {},
      bitoffs: "46",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature set point flag comfort mode",
      shortcut: "SFC",
      description: "Indicates if a temperature set point for the comfort mode is provided",
      info: {},
      bitoffs: "47",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }]
  }, {
    title: "Time Program Setup",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "32",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "46",
      bitsize: "1"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "4",
          description: "Time Program Setup"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "End time: Minute",
      shortcut: "ETM",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "10",
      bitsize: "6",
      range: {
        min: "0",
        max: "59"
      },
      scale: {
        min: "0",
        max: "59"
      },
      unit: "1"
    }, {
      data: "End time: Hour",
      shortcut: "ETH",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "19",
      bitsize: "5",
      range: {
        min: "0",
        max: "23"
      },
      scale: {
        min: "0",
        max: "23"
      },
      unit: "1"
    }, {
      data: "Start time: Minute",
      shortcut: "STM",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "26",
      bitsize: "6",
      range: {
        min: "0",
        max: "59"
      },
      scale: {
        min: "0",
        max: "59"
      },
      unit: "1"
    }, {
      data: "Start time: Hour",
      shortcut: "STH",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "35",
      bitsize: "5",
      range: {
        min: "0",
        max: "23"
      },
      scale: {
        min: "0",
        max: "23"
      },
      unit: "1"
    }, {
      data: "Period",
      shortcut: "PER",
      description: "Assigned period of time (weekdays) for the provided schedule time",
      info: {},
      bitoffs: "40",
      bitsize: "4",
      enum: [{
        item: {
          value: "15",
          description: "Friday - Monday"
        }
      }, {
        item: {
          value: "14",
          description: "Friday - Sunday"
        }
      }, {
        item: {
          value: "13",
          description: "Thursday - Friday"
        }
      }, {
        item: {
          value: "12",
          description: "Wednesday - Friday"
        }
      }, {
        item: {
          value: "11",
          description: "Tuesday - Thursday"
        }
      }, {
        item: {
          value: "10",
          description: "Monday - Wednesday"
        }
      }, {
        item: {
          value: "9",
          description: "Sunday"
        }
      }, {
        item: {
          value: "8",
          description: "Saturday"
        }
      }, {
        item: {
          value: "7",
          description: "Friday"
        }
      }, {
        item: {
          value: "6",
          description: "Thursday"
        }
      }, {
        item: {
          value: "5",
          description: "Wednesday"
        }
      }, {
        item: {
          value: "4",
          description: "Tuesday"
        }
      }, {
        item: {
          value: "3",
          description: "Monday"
        }
      }, {
        item: {
          value: "2",
          description: "Saturday - Sunday"
        }
      }, {
        item: {
          value: "1",
          description: "Monday - Friday"
        }
      }, {
        item: {
          value: "0",
          description: "Monday - Sunday"
        }
      }]
    }, {
      data: "Room control mode",
      shortcut: "RCM",
      description: "Assigned room control mode for the provided schedule time",
      info: {},
      bitoffs: "44",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Building protection"
        }
      }, {
        item: {
          value: "2",
          description: "Pre-comfort"
        }
      }, {
        item: {
          value: "1",
          description: "Economy"
        }
      }, {
        item: {
          value: "0",
          description: "Comfort"
        }
      }]
    }, {
      data: "Time program deletion",
      shortcut: "TPD",
      description: "Deletes the stored time program",
      info: {},
      bitoffs: "47",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Deletion"
        }
      }, {
        item: {
          value: "0",
          description: "No deletion"
        }
      }]
    }]
  }],
  originalIndex: 183,
  eep: "d2-10-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Room Control Panels with Temperature & Fan Speed Control, Room Status Information and Time Program",
  func_number: "0x10",
  submitter: [
    "Kieback&Peter GmbH & CO KG"
  ]
};

// ../eep-transcoder/eep/d2-10-01.js
var d21001 = {
  number: "0x01",
  title: "Type 0x01",
  status: "released",
  description: "",
  case: [{
    title: "General Message",
    description: "<br/>exemplary illustration of data bytes 0/1:\n                <br/>\n                <img>graphics/D2-10-xx_00.png</img>\n                <br/>",
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "2"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "0",
          description: "General Message"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "Information request classifier",
      shortcut: "IRC",
      description: "Defines the type of information request",
      info: {},
      bitoffs: "10",
      bitsize: "3",
      enum: [{
        item: {
          value: "7",
          description: "Reserved"
        }
      }, {
        item: {
          value: "6",
          description: "Reserved"
        }
      }, {
        item: {
          value: "5",
          description: "Reserved"
        }
      }, {
        item: {
          value: "4",
          description: "Time program request"
        }
      }, {
        item: {
          value: "3",
          description: "Room control setup request"
        }
      }, {
        item: {
          value: "2",
          description: "Configuration request"
        }
      }, {
        item: {
          value: "1",
          description: "Data request"
        }
      }, {
        item: {
          value: "0",
          description: "Acknowledge request"
        }
      }]
    }, {
      data: "Feedback classifier",
      shortcut: "FBC",
      description: "Defines the type of feedback",
      info: {},
      bitoffs: "13",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Message repetition request"
        }
      }, {
        item: {
          value: "1",
          description: "Telegram repetition request"
        }
      }, {
        item: {
          value: "0",
          description: "Acknowledge / heartbeat"
        }
      }]
    }, {
      data: "General message type",
      shortcut: "GMT",
      description: "Indicates if the general message is a feedback or\n                an information request",
      info: {},
      bitoffs: "15",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Information request"
        }
      }, {
        item: {
          value: "0",
          description: "Feedback"
        }
      }]
    }]
  }, {
    title: "Data Message",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "17",
      bitsize: "7"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "25",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "26",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "32",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "35",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "36",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "40",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "42",
      bitsize: "2"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "1",
          description: "Data Message"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "Custom warning 2",
      shortcut: "CW2",
      description: "Flag for an application specific warning",
      info: {},
      bitoffs: "27",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "True"
        }
      }, {
        item: {
          value: "0",
          description: "False"
        }
      }]
    }, {
      data: "Custom warning 1",
      shortcut: "CW1",
      description: "Flag for an application specific warning",
      info: {},
      bitoffs: "28",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "True"
        }
      }, {
        item: {
          value: "0",
          description: "False"
        }
      }]
    }, {
      data: "Window open detection",
      shortcut: "WOD",
      description: "Indicates if an open window is detected",
      info: {},
      bitoffs: "30",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Open"
        }
      }, {
        item: {
          value: "1",
          description: "Closed"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Battery status",
      shortcut: "BS",
      description: "Battery status",
      info: {},
      bitoffs: "33",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Critical"
        }
      }, {
        item: {
          value: "2",
          description: "Low"
        }
      }, {
        item: {
          value: "1",
          description: "Good"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Occupancy button status",
      shortcut: "OBS",
      description: "Indicates if the occupancy button was pressed and its occupancy status",
      info: {},
      bitoffs: "38",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Button pressed and unoccupied"
        }
      }, {
        item: {
          value: "1",
          description: "Button pressed and occupied"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Room control mode",
      shortcut: "RCM",
      description: "Recent room control mode",
      info: {},
      bitoffs: "44",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Building protection"
        }
      }, {
        item: {
          value: "2",
          description: "Pre-comfort"
        }
      }, {
        item: {
          value: "1",
          description: "Economy"
        }
      }, {
        item: {
          value: "0",
          description: "Comfort"
        }
      }]
    }, {
      data: "Temperature set point validity",
      shortcut: "SPV",
      description: "Indicates if the temperature set point value is valid",
      info: {},
      bitoffs: "46",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature validity",
      shortcut: "TPV",
      description: "Indicates if the temperature value is valid",
      info: {},
      bitoffs: "47",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature set point",
      shortcut: "TSP",
      description: "Recent temperature set point",
      info: {},
      bitoffs: "48",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Recent room temperature",
      info: {},
      bitoffs: "56",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }, {
    title: "Configuration Message",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "15",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "23",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "54",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "61",
      bitsize: "2"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "2",
          description: "Configuration Message"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "Temperature scale lock",
      shortcut: "TSL",
      description: "Indicates if the temperature scale can be changed at the room control panel",
      info: {},
      bitoffs: "9",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Display content lock",
      shortcut: "DCL",
      description: "Indicates if the display content can be changed at the room control panel",
      info: {},
      bitoffs: "10",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Date / time lock",
      shortcut: "DTL",
      description: "Indicates if date and time can be changed at the room control panel",
      info: {},
      bitoffs: "11",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Time program lock",
      shortcut: "TPL",
      description: "Indicates if the time program can be changed at the room control panel",
      info: {},
      bitoffs: "12",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Occupancy button lock",
      shortcut: "OBL",
      description: "Indicates if the occupancy status can be changed at the room control panel",
      info: {},
      bitoffs: "13",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Temperature set point lock",
      shortcut: "SPL",
      description: "Indicates if the temperature set point can be changed at the room control panel",
      info: {},
      bitoffs: "14",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Radio communication interval",
      shortcut: "RCI",
      description: "Defines the longest time between two consecutive telegrams (clock-based communication)",
      info: {},
      bitoffs: "16",
      bitsize: "6",
      enum: [{
        item: {
          value: "63",
          description: "24 hours"
        }
      }, {
        item: {
          value: "62",
          description: "12 hours"
        }
      }, {
        item: {
          value: "61",
          description: "3 hours"
        }
      }, {
        item: {
          min: "1",
          max: "60",
          description: "1...60 min"
        }
      }, {
        item: {
          value: "0",
          description: "No communication interval"
        }
      }]
    }, {
      data: "Key lock",
      shortcut: "KL",
      description: "Indicates if all buttons on the device are locked",
      info: {},
      bitoffs: "22",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Display content",
      shortcut: "DC",
      description: "Defines the main display content",
      info: {},
      bitoffs: "24",
      bitsize: "3",
      enum: [{
        item: {
          value: "7",
          description: "Humidity"
        }
      }, {
        item: {
          value: "6",
          description: "Display off"
        }
      }, {
        item: {
          value: "5",
          description: "Temperature set point"
        }
      }, {
        item: {
          value: "4",
          description: "Room temperature (external)"
        }
      }, {
        item: {
          value: "3",
          description: "Room temperature (internal)"
        }
      }, {
        item: {
          value: "2",
          description: "Time"
        }
      }, {
        item: {
          value: "1",
          description: "Default"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature scale",
      shortcut: "TS",
      description: "Defines the used temperature scale for the room control panel display and menus",
      info: {},
      bitoffs: "27",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "\xB0 Fahrenheit"
        }
      }, {
        item: {
          value: "2",
          description: "\xB0 Celsius"
        }
      }, {
        item: {
          value: "1",
          description: "Default"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Daylight saving time flag",
      shortcut: "DST",
      description: "Indicates if daylight saving time is supported",
      info: {},
      bitoffs: "29",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Not supported"
        }
      }, {
        item: {
          value: "0",
          description: "Supported"
        }
      }]
    }, {
      data: "Time notation",
      shortcut: "TN",
      description: "Defines the used time notation",
      info: {},
      bitoffs: "30",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "12 h"
        }
      }, {
        item: {
          value: "2",
          description: "24 h"
        }
      }, {
        item: {
          value: "1",
          description: "Default"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Day",
      shortcut: "DAY",
      description: "Date format: YYYY/MM/DD",
      info: {},
      bitoffs: "32",
      bitsize: "5",
      range: {
        min: "1",
        max: "31"
      },
      scale: {
        min: "1",
        max: "31"
      },
      unit: "day"
    }, {
      data: "Month",
      shortcut: "MON",
      description: "Date format: YYYY/MM/DD",
      info: {},
      bitoffs: "37",
      bitsize: "4",
      range: {
        min: "1",
        max: "12"
      },
      scale: {
        min: "1",
        max: "12"
      },
      unit: "mon"
    }, {
      data: "Year",
      shortcut: "YR",
      description: "Date format: YYYY/MM/DD\n                  <br/>year = 2000 + x",
      info: {},
      bitoffs: "41",
      bitsize: "7",
      range: {
        min: "0",
        max: "127"
      },
      scale: {
        min: "2000",
        max: "2127"
      },
      unit: "year"
    }, {
      data: "Minute",
      shortcut: "MIN",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "48",
      bitsize: "6",
      range: {
        min: "0",
        max: "59"
      },
      scale: {
        min: "0",
        max: "59"
      },
      unit: "min"
    }, {
      data: "Hour",
      shortcut: "HR",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "56",
      bitsize: "5",
      range: {
        min: "0",
        max: "23"
      },
      scale: {
        min: "0",
        max: "23"
      },
      unit: "h"
    }, {
      data: "Date / time update flag",
      shortcut: "DTU",
      description: "Indicates if an update of date or time is provided",
      info: {},
      bitoffs: "63",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Update"
        }
      }, {
        item: {
          value: "0",
          description: "No update"
        }
      }]
    }]
  }, {
    title: "Room Control Setup",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "40",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "45",
      bitsize: "1"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "3",
          description: "Room Control Setup"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "Temperature set point building protection mode",
      shortcut: "SPB",
      description: "Temperature set point building protection mode",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature set point economy mode",
      shortcut: "SPE",
      description: "Temperature set point economy mode",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature set point comfort mode",
      shortcut: "SPC",
      description: "Temperature set point comfort mode",
      info: {},
      bitoffs: "32",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature set point flag building protection mode",
      shortcut: "SFB",
      description: "Indicates if a temperature set point for the building protection mode is provided",
      info: {},
      bitoffs: "44",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature set point flag economy mode",
      shortcut: "SFE",
      description: "Indicates if a temperature set point for the economy mode is provided",
      info: {},
      bitoffs: "46",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature set point flag comfort mode",
      shortcut: "SFC",
      description: "Indicates if a temperature set point for the comfort mode is provided",
      info: {},
      bitoffs: "47",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }]
  }, {
    title: "Time Program Setup",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "32",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "46",
      bitsize: "1"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "4",
          description: "Time Program Setup"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "End time: Minute",
      shortcut: "ETM",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "10",
      bitsize: "6",
      range: {
        min: "0",
        max: "59"
      },
      scale: {
        min: "0",
        max: "59"
      },
      unit: "1"
    }, {
      data: "End time: Hour",
      shortcut: "ETH",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "19",
      bitsize: "5",
      range: {
        min: "0",
        max: "23"
      },
      scale: {
        min: "0",
        max: "23"
      },
      unit: "1"
    }, {
      data: "Start time: Minute",
      shortcut: "STM",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "26",
      bitsize: "6",
      range: {
        min: "0",
        max: "59"
      },
      scale: {
        min: "0",
        max: "59"
      },
      unit: "1"
    }, {
      data: "Start time: Hour",
      shortcut: "STH",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "35",
      bitsize: "5",
      range: {
        min: "0",
        max: "23"
      },
      scale: {
        min: "0",
        max: "23"
      },
      unit: "1"
    }, {
      data: "Period",
      shortcut: "PER",
      description: "Assigned period of time (weekdays) for the provided schedule time",
      info: {},
      bitoffs: "40",
      bitsize: "4",
      enum: [{
        item: {
          value: "15",
          description: "Friday - Monday"
        }
      }, {
        item: {
          value: "14",
          description: "Friday - Sunday"
        }
      }, {
        item: {
          value: "13",
          description: "Thursday - Friday"
        }
      }, {
        item: {
          value: "12",
          description: "Wednesday - Friday"
        }
      }, {
        item: {
          value: "11",
          description: "Tuesday - Thursday"
        }
      }, {
        item: {
          value: "10",
          description: "Monday - Wednesday"
        }
      }, {
        item: {
          value: "9",
          description: "Sunday"
        }
      }, {
        item: {
          value: "8",
          description: "Saturday"
        }
      }, {
        item: {
          value: "7",
          description: "Friday"
        }
      }, {
        item: {
          value: "6",
          description: "Thursday"
        }
      }, {
        item: {
          value: "5",
          description: "Wednesday"
        }
      }, {
        item: {
          value: "4",
          description: "Tuesday"
        }
      }, {
        item: {
          value: "3",
          description: "Monday"
        }
      }, {
        item: {
          value: "2",
          description: "Saturday - Sunday"
        }
      }, {
        item: {
          value: "1",
          description: "Monday - Friday"
        }
      }, {
        item: {
          value: "0",
          description: "Monday - Sunday"
        }
      }]
    }, {
      data: "Room control mode",
      shortcut: "RCM",
      description: "Assigned room control mode for the provided schedule time",
      info: {},
      bitoffs: "44",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Building protection"
        }
      }, {
        item: {
          value: "2",
          description: "Pre-comfort"
        }
      }, {
        item: {
          value: "1",
          description: "Economy"
        }
      }, {
        item: {
          value: "0",
          description: "Comfort"
        }
      }]
    }, {
      data: "Time program deletion",
      shortcut: "TPD",
      description: "Deletes the stored time program",
      info: {},
      bitoffs: "47",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Deletion"
        }
      }, {
        item: {
          value: "0",
          description: "No deletion"
        }
      }]
    }]
  }],
  originalIndex: 184,
  eep: "d2-10-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Room Control Panels with Temperature & Fan Speed Control, Room Status Information and Time Program",
  func_number: "0x10",
  submitter: [
    "Kieback&Peter GmbH & CO KG"
  ]
};

// ../eep-transcoder/eep/d2-10-02.js
var d21002 = {
  number: "0x02",
  title: "Type 0x02",
  status: "released",
  description: "",
  case: [{
    title: "General Message",
    description: "<br/>exemplary illustration of data bytes 0/1:\n                <br/>\n                <img>graphics/D2-10-xx_00.png</img>\n                <br/>",
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "2"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "0",
          description: "General Message"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "Information request classifier",
      shortcut: "IRC",
      description: "Defines the type of information request",
      info: {},
      bitoffs: "10",
      bitsize: "3",
      enum: [{
        item: {
          value: "7",
          description: "Reserved"
        }
      }, {
        item: {
          value: "6",
          description: "Reserved"
        }
      }, {
        item: {
          value: "5",
          description: "Reserved"
        }
      }, {
        item: {
          value: "4",
          description: "Time program request"
        }
      }, {
        item: {
          value: "3",
          description: "Room control setup request"
        }
      }, {
        item: {
          value: "2",
          description: "Configuration request"
        }
      }, {
        item: {
          value: "1",
          description: "Data request"
        }
      }, {
        item: {
          value: "0",
          description: "Acknowledge request"
        }
      }]
    }, {
      data: "Feedback classifier",
      shortcut: "FBC",
      description: "Defines the type of feedback",
      info: {},
      bitoffs: "13",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Message repetition request"
        }
      }, {
        item: {
          value: "1",
          description: "Telegram repetition request"
        }
      }, {
        item: {
          value: "0",
          description: "Acknowledge / heartbeat"
        }
      }]
    }, {
      data: "General message type",
      shortcut: "GMT",
      description: "Indicates if the general message is a feedback or\n                an information request",
      info: {},
      bitoffs: "15",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Information request"
        }
      }, {
        item: {
          value: "0",
          description: "Feedback"
        }
      }]
    }]
  }, {
    title: "Data Message",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "17",
      bitsize: "7"
    }, {
      reserved: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "25",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "26",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "29",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "32",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "40",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "42",
      bitsize: "2"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "1",
          description: "Data Message"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "Custom warning 2",
      shortcut: "CW2",
      description: "Flag for an application specific warning",
      info: {},
      bitoffs: "27",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "True"
        }
      }, {
        item: {
          value: "0",
          description: "False"
        }
      }]
    }, {
      data: "Custom warning 1",
      shortcut: "CW1",
      description: "Flag for an application specific warning",
      info: {},
      bitoffs: "28",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "True"
        }
      }, {
        item: {
          value: "0",
          description: "False"
        }
      }]
    }, {
      data: "Window open detection",
      shortcut: "WOD",
      description: "Indicates if an open window is detected",
      info: {},
      bitoffs: "30",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Open"
        }
      }, {
        item: {
          value: "1",
          description: "Closed"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Battery status",
      shortcut: "BS",
      description: "Battery status",
      info: {},
      bitoffs: "33",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Critical"
        }
      }, {
        item: {
          value: "2",
          description: "Low"
        }
      }, {
        item: {
          value: "1",
          description: "Good"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Solar-powered status",
      shortcut: "SPS",
      description: "Indicates if the device is powered by its solar cell",
      info: {},
      bitoffs: "35",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Not solar-powered"
        }
      }, {
        item: {
          value: "0",
          description: "Solar-powered"
        }
      }]
    }, {
      data: "PIR status",
      shortcut: "PIR",
      description: "Indicates if the PIR detected a movement",
      info: {},
      bitoffs: "36",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Locked"
        }
      }, {
        item: {
          value: "2",
          description: "Movement detected"
        }
      }, {
        item: {
          value: "1",
          description: "No movement detected"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Occupancy button status",
      shortcut: "OBS",
      description: "Indicates if the occupancy button was pressed and its occupancy status",
      info: {},
      bitoffs: "38",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Button pressed and unoccupied"
        }
      }, {
        item: {
          value: "1",
          description: "Button pressed and occupied"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Room control mode",
      shortcut: "RCM",
      description: "Recent room control mode",
      info: {},
      bitoffs: "44",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Building protection"
        }
      }, {
        item: {
          value: "2",
          description: "Pre-comfort"
        }
      }, {
        item: {
          value: "1",
          description: "Economy"
        }
      }, {
        item: {
          value: "0",
          description: "Comfort"
        }
      }]
    }, {
      data: "Temperature set point validity",
      shortcut: "SPV",
      description: "Indicates if the temperature set point value is valid",
      info: {},
      bitoffs: "46",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature validity",
      shortcut: "TPV",
      description: "Indicates if the temperature value is valid",
      info: {},
      bitoffs: "47",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature set point",
      shortcut: "TSP",
      description: "Recent temperature set point",
      info: {},
      bitoffs: "48",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Recent room temperature",
      info: {},
      bitoffs: "56",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }]
  }, {
    title: "Configuration Message",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "9",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "14",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "15",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "22",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "23",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "54",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "61",
      bitsize: "2"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "2",
          description: "Configuration Message"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "PIR status lock",
      shortcut: "PSL",
      description: "Indicates if the PIR status is transmitted or kept inside the room control panel",
      info: {},
      bitoffs: "8",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Display content lock",
      shortcut: "DCL",
      description: "Indicates if the display content can be changed at the room control panel",
      info: {},
      bitoffs: "10",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Date / time lock",
      shortcut: "DTL",
      description: "Indicates if date and time can be changed at the room control panel",
      info: {},
      bitoffs: "11",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Time program lock",
      shortcut: "TPL",
      description: "Indicates if the time program can be changed at the room control panel",
      info: {},
      bitoffs: "12",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Occupancy button lock",
      shortcut: "OBL",
      description: "Indicates if the occupancy status can be changed at the room control panel",
      info: {},
      bitoffs: "13",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Unlocked"
        }
      }, {
        item: {
          value: "0",
          description: "Locked"
        }
      }]
    }, {
      data: "Radio communication interval",
      shortcut: "RCI",
      description: "Defines the longest time between two consecutive telegrams (clock-based communication)",
      info: {},
      bitoffs: "16",
      bitsize: "6",
      enum: [{
        item: {
          value: "63",
          description: "24 hours"
        }
      }, {
        item: {
          value: "62",
          description: "12 hours"
        }
      }, {
        item: {
          value: "61",
          description: "3 hours"
        }
      }, {
        item: {
          min: "1",
          max: "60",
          description: "1...60 min"
        }
      }, {
        item: {
          value: "0",
          description: "No communication interval"
        }
      }]
    }, {
      data: "Display content",
      shortcut: "DC",
      description: "Defines the main display content",
      info: {},
      bitoffs: "24",
      bitsize: "3",
      enum: [{
        item: {
          value: "7",
          description: "Humidity"
        }
      }, {
        item: {
          value: "6",
          description: "Display off"
        }
      }, {
        item: {
          value: "5",
          description: "Temperature set point"
        }
      }, {
        item: {
          value: "4",
          description: "Room temperature (external)"
        }
      }, {
        item: {
          value: "3",
          description: "Room temperature (internal)"
        }
      }, {
        item: {
          value: "2",
          description: "Time"
        }
      }, {
        item: {
          value: "1",
          description: "Default"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature scale",
      shortcut: "TS",
      description: "Defines the used temperature scale for the room control panel display and menus",
      info: {},
      bitoffs: "27",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "\xB0 Fahrenheit"
        }
      }, {
        item: {
          value: "2",
          description: "\xB0 Celsius"
        }
      }, {
        item: {
          value: "1",
          description: "Default"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Daylight saving time flag",
      shortcut: "DST",
      description: "Indicates if daylight saving time is supported",
      info: {},
      bitoffs: "29",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Not supported"
        }
      }, {
        item: {
          value: "0",
          description: "Supported"
        }
      }]
    }, {
      data: "Time notation",
      shortcut: "TN",
      description: "Defines the used time notation",
      info: {},
      bitoffs: "30",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "12 h"
        }
      }, {
        item: {
          value: "2",
          description: "24 h"
        }
      }, {
        item: {
          value: "1",
          description: "Default"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Day",
      shortcut: "DAY",
      description: "Date format: YYYY/MM/DD",
      info: {},
      bitoffs: "32",
      bitsize: "5",
      range: {
        min: "1",
        max: "31"
      },
      scale: {
        min: "1",
        max: "31"
      },
      unit: "day"
    }, {
      data: "Month",
      shortcut: "MON",
      description: "Date format: YYYY/MM/DD",
      info: {},
      bitoffs: "37",
      bitsize: "4",
      range: {
        min: "1",
        max: "12"
      },
      scale: {
        min: "1",
        max: "12"
      },
      unit: "mon"
    }, {
      data: "Year",
      shortcut: "YR",
      description: "Date format: YYYY/MM/DD\n                  <br/>year = 2000 + x",
      info: {},
      bitoffs: "41",
      bitsize: "7",
      range: {
        min: "0",
        max: "127"
      },
      scale: {
        min: "2000",
        max: "2127"
      },
      unit: "year"
    }, {
      data: "Minute",
      shortcut: "MIN",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "48",
      bitsize: "6",
      range: {
        min: "0",
        max: "59"
      },
      scale: {
        min: "0",
        max: "59"
      },
      unit: "min"
    }, {
      data: "Hour",
      shortcut: "HR",
      description: "Time format: hh:mm",
      info: {},
      bitoffs: "56",
      bitsize: "5",
      range: {
        min: "0",
        max: "23"
      },
      scale: {
        min: "0",
        max: "23"
      },
      unit: "h"
    }, {
      data: "Date / time update flag",
      shortcut: "DTU",
      description: "Indicates if an update of date or time is provided",
      info: {},
      bitoffs: "63",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Update"
        }
      }, {
        item: {
          value: "0",
          description: "No update"
        }
      }]
    }]
  }, {
    title: "Room Control Setup",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "8"
    }, {
      reserved: {},
      bitoffs: "40",
      bitsize: "4"
    }, {
      reserved: {},
      bitoffs: "44",
      bitsize: "1"
    }, {
      reserved: {},
      bitoffs: "45",
      bitsize: "1"
    }, {
      data: "Message identifier",
      shortcut: "MID",
      description: "Defines the type of message",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: {
          value: "3",
          description: "Room Control Setup"
        }
      }
    }, {
      data: "Message continuation flag",
      shortcut: "MCF",
      description: "Indicates if another telegram has to be expected or if the message is complete",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: [{
        item: {
          value: "3",
          description: "Reserved"
        }
      }, {
        item: {
          value: "2",
          description: "Automatic message control"
        }
      }, {
        item: {
          value: "1",
          description: "Incomplete"
        }
      }, {
        item: {
          value: "0",
          description: "Complete"
        }
      }]
    }, {
      data: "Temperature set point economy mode",
      shortcut: "SPE",
      description: "Temperature set point economy mode",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature set point comfort mode",
      shortcut: "SPC",
      description: "Temperature set point comfort mode",
      info: {},
      bitoffs: "32",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Temperature set point flag economy mode",
      shortcut: "SFE",
      description: "Indicates if a temperature set point for the economy mode is provided",
      info: {},
      bitoffs: "46",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature set point flag comfort mode",
      shortcut: "SFC",
      description: "Indicates if a temperature set point for the comfort mode is provided",
      info: {},
      bitoffs: "47",
      bitsize: "1",
      enum: [{
        item: {
          value: "1",
          description: "Valid value"
        }
      }, {
        item: {
          value: "0",
          description: "No change"
        }
      }]
    }]
  }],
  originalIndex: 185,
  eep: "d2-10-02",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Room Control Panels with Temperature & Fan Speed Control, Room Status Information and Time Program",
  func_number: "0x10",
  submitter: [
    "Kieback&Peter GmbH & CO KG"
  ]
};

// ../eep-transcoder/eep/d2-11-01.js
var d21101 = {
  number: "0x01",
  title: "Type 0x01",
  status: "released",
  case: [{
    title: "Message type A / ID 0 (First switch press after sleep-mode, request new data)",
    description: "Direction: Sensor -> Gateway\n              <br/><br/>\n              <b>Bit 0.7</b> indicates which setpoint type is actual used at the device.\n              The difference is made at the visualization of the setpoint (real\n              temperature setpoint (24.5\xB0C) or setpoint shift (+ 3.0\xB0C)) and this\n              information is needed for interpreting the value of DB2 at Message\n              Type C (ID2).\n              <br/>\n              <img>graphics/D2-11-00_ID0.png</img>\n              <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x00"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "1",
      bitsize: "3"
    }, {
      data: "Setpoint type",
      shortcut: "SPT",
      description: "Setpoint type actual used by the device<br/>\n                (temperature correction / temperature setpoint)",
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Temperature correction"
        }, {
          value: "1",
          description: "Temperature setpoint"
        }]
      }
    }, {
      data: "Message ID",
      shortcut: "MID",
      description: "Message Type A, ID-0",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "ID-0"
        }
      }, {
        item: {
          value: "1",
          description: "ID-1"
        }
      }, {
        item: {
          value: "2",
          description: "ID-2"
        }
      }, {
        item: {
          min: "3",
          max: "15",
          description: "Reserved"
        }
      }]
    }]
  }, {
    title: "Message type B / ID 1 (Override device parameter, reply to data request)",
    description: "Direction: Gateway -> Sensor\n                <br/>\n                <br/>\n                <b>Bit 3.7</b> may be used for setting new setpoint type at the\n                device. If no change is needed mirroring Bit 0.7 of the last\n                received Message Type A is required.\n                <br/>\n                <br/>\n                <b>Byte 2</b> may be used for overwriting the actual setpoint\n                shift at the device (i.e. for resetting the setpoint shift at the\n                evening to default value). If no change is needed mirroring Byte 2\n                of the last received Message-Type C is required.\n                <br/>\n                <br/>\n                <b>Byte 1</b> may be used for setting new basesetpoint at the\n                device. If no change is needed mirroring Byte 1 of the last\n                received Message-Type C is required.\n                <br/>\n                <br/>\n                <b>Bit 0.7 \u2026 0.4</b> may be used for setting new valid setpoint\n                shift at the device. If no change is needed mirroring Bit0.7 \u2026 0.4\n                of the last received Message-Type C is required.\n                <br/>\n                <img>graphics/D2-11-00_ID1.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x01"
      }
    },
    datafield: [{
      data: "Set Setpoint type",
      shortcut: "SPT",
      description: "Set setpoint type to be used by the device",
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Temperature correction"
        }, {
          value: "1",
          description: "Temperature setpoint"
        }]
      }
    }, {
      data: "Display heating symbol",
      shortcut: "DHS",
      description: "Set/Clear heating symbol at the display",
      info: {},
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Heating symbol off"
        }, {
          value: "1",
          description: "Heating symbol on"
        }]
      }
    }, {
      data: "Display cooling symbol",
      shortcut: "DCS",
      description: "Set/Clear cooling symbol at the display",
      info: {},
      bitoffs: "2",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Cooling symbol off"
        }, {
          value: "1",
          description: "Cooling symbol on"
        }]
      }
    }, {
      data: "Display \u201Cwindow open\u201D symbol",
      shortcut: "SSW",
      description: "Set/Clear \u201Cwindow open\u201D symbol at the display",
      info: {},
      bitoffs: "3",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "\u201CWindow open\u201D symbol off"
        }, {
          value: "1",
          description: "\u201CWindow open\u201D symbol on"
        }]
      }
    }, {
      data: "Message ID",
      shortcut: "MID",
      description: "Message Type B, ID-1",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "ID-0"
        }
      }, {
        item: {
          value: "1",
          description: "ID-1"
        }
      }, {
        item: {
          value: "2",
          description: "ID-2"
        }
      }, {
        item: {
          min: "3",
          max: "15",
          description: "Reserved"
        }
      }]
    }, {
      data: "Temperature correction",
      shortcut: "OSO",
      description: "Override Setpoint offset (linear, min. - \u2026 max. +)\n                <br/>(valid temperature correction)",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      enum: {
        item: {
          min: "0",
          max: "255",
          scale: {
            min: "0",
            max: "255"
          },
          unit: "K"
        }
      }
    }, {
      data: "Basesetpoint",
      shortcut: "BSP",
      description: "Set basesetpoint for visualization of the\n                temperature setpoint",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "14",
          description: "Reserved"
        }, {
          min: "15",
          max: "30",
          scale: {
            min: "15",
            max: "30"
          },
          unit: "\xB0C"
        }, {
          min: "31",
          max: "255",
          description: "Reserved"
        }]
      }
    }, {
      data: "Valid temperature correction",
      shortcut: "COA",
      description: "Set valid temperature correction",
      info: {},
      bitoffs: "24",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Reserved"
        }, {
          value: "1",
          description: "-1 \u2026 +1 K"
        }, {
          value: "2",
          description: "-2 \u2026 +2 K"
        }, {
          value: "3",
          description: "-3 \u2026 +3 K"
        }, {
          value: "4",
          description: "-4 \u2026 +4 K"
        }, {
          value: "5",
          description: "-5 \u2026 +5 K"
        }, {
          value: "6",
          description: "-6 \u2026 +6 K"
        }, {
          value: "7",
          description: "-7 \u2026 +7 K"
        }, {
          value: "8",
          description: "-8 \u2026 +8 K"
        }, {
          value: "9",
          description: "-9 \u2026 +9 K"
        }, {
          value: "10",
          description: "-10 \u2026 +10 K"
        }, {
          min: "11",
          max: "15",
          description: "Reserved"
        }]
      }
    }, {
      data: "Fan Speed",
      shortcut: "OFS",
      description: "Override actual Fan Speed",
      info: {},
      bitoffs: "28",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Speed 0"
        }, {
          value: "2",
          description: "Speed 1"
        }, {
          value: "3",
          description: "Speed 2"
        }, {
          value: "4",
          description: "Speed 3"
        }, {
          min: "5",
          max: "6",
          description: "Reserved"
        }, {
          value: "7",
          description: "Not available"
        }]
      }
    }, {
      data: "Occupancy State",
      shortcut: "OOS",
      description: "Override actual Occupancy State",
      info: {},
      bitoffs: "31",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "State Unoccupied"
        }, {
          value: "1",
          description: "State Occupied"
        }]
      }
    }]
  }, {
    title: "Message type C / ID 2 (Transmit actual data)",
    description: "Direction: Sensor -> Gateway\n                <br/>\n                <br/>\n                <b>Bit 5.7</b> indicates which setpoint type is actual used at the\n                device. The difference is made at the visualization of the setpoint\n                (real temperature setpoint (24.5 \xB0C) or setpoint shift (+ 3.0 \xB0C))\n                and this information is needed for interpreting the value of DB2.\n                <br/>\n                <br/>\n                <b>Byte 4</b> transmits the actual measured temperature.\n                <br/>\n                <br/>\n                <b>Byte 2</b> transmits the actual setpoint shift. How to interpret\n                this value is a combination of Bit 5.7, Byte 1 and Bit 0.7 \u2026 0.4.\n                <br/>\n                If the actual setpoint type is setpoint shift, then the value of\n                Byte 2 only represents the scaled valid setpoint shift at Bit 0.7 \u2026 0.4.\n                <br/>\n                If the setpoint type is temperature setpoint, then the temperature\n                setpoint is calculated as sum of the internal basesetpoint at\n                Byte 1 and the scaled valid setpoint shift at Bit 0.7 \u2026 0.4,\n                transmitted at Byte 2.\n                <br/>\n                <br/>\n                <b>Byte 1</b> transmits the actual, at the device stored, basesetpoint.\n                <br/>\n                <br/>\n                <b>Bit 0.7 \u2026 0.4</b> transmits the actual valid, at the device stored,\n                setpoint shift.\n                <br/>\n                <br/>\n                <img>graphics/D2-11-00_ID2.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: "4",
        bitsize: "4",
        value: "0x02"
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: "3",
      bitsize: "1"
    }, {
      data: "Setpoint type",
      shortcut: "SPT",
      description: "Setpoint type actual used by the device\n                <br/>\n                (temperature correction / temperature setpoint)",
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Temperature correction"
        }, {
          value: "1",
          description: "Temperature setpoint"
        }]
      }
    }, {
      data: "Telegram Type",
      shortcut: "TT",
      description: "Telegram Trigger",
      info: {},
      bitoffs: "1",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Heartbeat"
        }, {
          value: "1",
          description: "Change of temperature- or humidity value"
        }, {
          value: "2",
          description: "User caused parameter change"
        }]
      }
    }, {
      data: "Message ID",
      shortcut: "MID",
      description: "Message Type C, ID-2",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "ID-0"
        }
      }, {
        item: {
          value: "1",
          description: "ID-1"
        }
      }, {
        item: {
          value: "2",
          description: "ID-2"
        }
      }, {
        item: {
          min: "3",
          max: "15",
          description: "Reserved"
        }
      }]
    }, {
      data: "Temperature",
      shortcut: "TEMP",
      description: "Temperature",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        min: "0",
        max: "+40"
      },
      unit: "\xB0C"
    }, {
      data: "Humidity",
      shortcut: "HUMI",
      description: "Humidity",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "+100"
      },
      unit: "%rH"
    }, {
      data: "Setpoint offset",
      shortcut: "SP",
      description: "Setpoint shift, linear<br/>\n                (refers to valid setpoint shift at DB0.7 \u2026 DB0.4)",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      range: {
        min: "0",
        max: "255"
      },
      scale: {
        ref: "BSB"
      },
      unit: "K"
    }, {
      data: "Basesetpoint",
      shortcut: "IBS",
      description: "Internal basesetpoint, required for setpoint\n                type \u201Ctemperature setpoint\u201D",
      info: {},
      bitoffs: "32",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "14",
          description: "Reserved"
        }, {
          min: "15",
          max: "30",
          scale: {
            min: "15",
            max: "30"
          },
          unit: "\xB0C"
        }, {
          min: "31",
          max: "255",
          description: "Reserved"
        }]
      }
    }, {
      data: "Valid temperature correction",
      shortcut: "BSB",
      description: "Valid temperature correction",
      info: {},
      bitoffs: "40",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Reserved"
        }, {
          value: "1",
          scale: {
            min: "-1",
            max: "1"
          },
          unit: "K"
        }, {
          value: "2",
          scale: {
            min: "-2",
            max: "2"
          },
          unit: "K"
        }, {
          value: "3",
          scale: {
            min: "-3",
            max: "3"
          },
          unit: "K"
        }, {
          value: "4",
          scale: {
            min: "-4",
            max: "4"
          },
          unit: "K"
        }, {
          value: "5",
          scale: {
            min: "-5",
            max: "5"
          },
          unit: "K"
        }, {
          value: "6",
          scale: {
            min: "-6",
            max: "6"
          },
          unit: "K"
        }, {
          value: "7",
          scale: {
            min: "-7",
            max: "7"
          },
          unit: "K"
        }, {
          value: "8",
          scale: {
            min: "-8",
            max: "8"
          },
          unit: "K"
        }, {
          value: "9",
          scale: {
            min: "-9",
            max: "9"
          },
          unit: "K"
        }, {
          value: "10",
          scale: {
            min: "-10",
            max: "10"
          },
          unit: "K"
        }, {
          min: "11",
          max: "15",
          description: "Reserved"
        }]
      }
    }, {
      data: "Fan Speed",
      shortcut: "FS",
      description: "Fan Speed",
      info: {},
      bitoffs: "44",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Auto"
        }, {
          value: "1",
          description: "Speed 0"
        }, {
          value: "2",
          description: "Speed 1"
        }, {
          value: "3",
          description: "Speed 2"
        }, {
          value: "4",
          description: "Speed 3"
        }, {
          min: "5",
          max: "6",
          description: "Reserved"
        }, {
          value: "7",
          description: "Not available"
        }]
      }
    }, {
      data: "Occupancy State",
      shortcut: "OS",
      description: "Occupancy State",
      info: {},
      bitoffs: "47",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "State Unoccupied"
        }, {
          value: "1",
          description: "State Occupied"
        }]
      }
    }]
  }],
  originalIndex: 186,
  eep: "d2-11-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Bidirectional Room Operating Panel",
  func_number: "0x11",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/d2-11-02.js
var d21102 = {
  $t: "",
  number: "0x02",
  title: "Type 0x02 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-11-01",
  originalIndex: 187,
  eep: "d2-11-02",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Bidirectional Room Operating Panel",
  func_number: "0x11",
  submitter: []
};

// ../eep-transcoder/eep/d2-11-03.js
var d21103 = {
  $t: "",
  number: "0x03",
  title: "Type 0x03 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-11-01",
  originalIndex: 188,
  eep: "d2-11-03",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Bidirectional Room Operating Panel",
  func_number: "0x11",
  submitter: []
};

// ../eep-transcoder/eep/d2-11-04.js
var d21104 = {
  $t: "",
  number: "0x04",
  title: "Type 0x04 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-11-01",
  originalIndex: 189,
  eep: "d2-11-04",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Bidirectional Room Operating Panel",
  func_number: "0x11",
  submitter: []
};

// ../eep-transcoder/eep/d2-11-05.js
var d21105 = {
  $t: "",
  number: "0x05",
  title: "Type 0x05 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-11-01",
  originalIndex: 190,
  eep: "d2-11-05",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Bidirectional Room Operating Panel",
  func_number: "0x11",
  submitter: []
};

// ../eep-transcoder/eep/d2-11-06.js
var d21106 = {
  $t: "",
  number: "0x06",
  title: "Type 0x06 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-11-01",
  originalIndex: 191,
  eep: "d2-11-06",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Bidirectional Room Operating Panel",
  func_number: "0x11",
  submitter: []
};

// ../eep-transcoder/eep/d2-11-07.js
var d21107 = {
  $t: "",
  number: "0x07",
  title: "Type 0x07 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-11-01",
  originalIndex: 192,
  eep: "d2-11-07",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Bidirectional Room Operating Panel",
  func_number: "0x11",
  submitter: []
};

// ../eep-transcoder/eep/d2-11-08.js
var d21108 = {
  $t: "",
  number: "0x08",
  title: "Type 0x08 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-11-01",
  originalIndex: 193,
  eep: "d2-11-08",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Bidirectional Room Operating Panel",
  func_number: "0x11",
  submitter: []
};

// ../eep-transcoder/eep/d2-14-30.js
var d21430 = {
  number: "0x30",
  title: "Sensor for Smoke, Air quality, Hygrothermal comfort, Temperature and Humidity",
  status: "released",
  description: "For the parameter ES (energy storage) applies: manufacturer / device which would like to indicate a percentage value it is recommended to hanlde this in the user manual of the device, respectively an application note.",
  case: [{
    datafield: [{
      data: "Smoke Alarm status",
      shortcut: "SMS",
      description: "Smoke Alarm status",
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Smoke Alarm non-activated"
        }, {
          value: "1",
          description: "Smoke Alarm activated"
        }]
      }
    }, {
      data: "Sensor fault mode status",
      shortcut: "SFMS",
      description: "Sensor fault mode status",
      info: {},
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Sensor fault mode non-activated"
        }, {
          value: "1",
          description: "Sensor fault mode activated"
        }]
      }
    }, {
      data: "Sensor Alarm Condition analysis: Maintenance",
      shortcut: "SACM",
      description: "Sensor Alarm Condition analysis: Maintenance",
      info: {},
      bitoffs: "2",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Maintenance OK"
        }, {
          value: "1",
          description: "Maintenance not done"
        }]
      }
    }, {
      data: "Sensor Alarm Condition analysis: Humidity",
      shortcut: "SACH",
      description: "Sensor Alarm Condition analysis: Humidity",
      info: {},
      bitoffs: "3",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Humidity range OK"
        }, {
          value: "1",
          description: "Humidity range NOK"
        }]
      }
    }, {
      data: "Sensor Alarm Condition analysis: Temperature",
      shortcut: "SACT",
      description: "Sensor Alarm Condition analysis: Temperature",
      info: {},
      bitoffs: "4",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Temperature range OK"
        }, {
          value: "1",
          description: "Temperature range NOK"
        }]
      }
    }, {
      data: "Time since last maintenance",
      shortcut: "TLM",
      description: "Time since last maintenance",
      info: {},
      bitoffs: "5",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "250",
          description: "Week"
        }, {
          min: "251",
          max: "254",
          description: "reserved"
        }, {
          value: "255",
          description: "Error"
        }]
      }
    }, {
      data: "Energy Storage",
      shortcut: "ES",
      description: "Energy Storage",
      info: {},
      bitoffs: "13",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "High"
        }, {
          value: "1",
          description: "Medium"
        }, {
          value: "2",
          description: "Low"
        }, {
          value: "3",
          description: "Critical"
        }]
      }
    }, {
      data: "Remaining Product Life Time",
      shortcut: "RPLT",
      description: "Countdown time until product EOL",
      info: {},
      bitoffs: "15",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "120",
          description: "Month"
        }, {
          min: "121",
          max: "254",
          description: "reserved"
        }, {
          value: "255",
          description: "Error"
        }]
      }
    }, {
      data: "Temperature",
      shortcut: "TMP",
      description: "Temperature linear",
      info: {},
      bitoffs: "15",
      bitsize: "8",
      range: {
        min: "0",
        max: "250"
      },
      scale: {
        min: "0",
        max: "50"
      },
      unit: "\xB0C"
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Humidity",
      info: {},
      bitoffs: "23",
      bitsize: "8",
      range: {
        min: "0",
        max: "200"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%rel"
    }, {
      data: "Hygrothermal Comfort Index",
      shortcut: "HCI",
      description: "Comfort Index based on temperature and humidity",
      info: {},
      bitoffs: "39",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Good"
        }, {
          value: "1",
          description: "Medium"
        }, {
          value: "2",
          description: "Bad"
        }, {
          value: "3",
          description: "Error"
        }]
      }
    }, {
      data: "Indoor Air Quality Analysis",
      shortcut: "IAQTH",
      description: "Indoor Air Quality Analysis based on temperature and humidity",
      info: {},
      bitoffs: "41",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Optimal air range"
        }, {
          value: "1",
          description: "Dry air range"
        }, {
          value: "2",
          description: "High humidity range"
        }, {
          value: "3",
          description: "High temperature and humidity range"
        }, {
          value: "4",
          description: "Temperature or humidity out of range"
        }, {
          min: "5",
          max: "6",
          description: "reserved"
        }, {
          value: "7",
          description: "Error"
        }]
      }
    }, {
      bitoffs: "44",
      bitsize: "4",
      reserved: "reserved"
    }]
  }],
  originalIndex: 210,
  eep: "d2-14-30",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Multi Function Sensors",
  func_number: "0x14",
  submitter: [
    "EnOcean GmbH"
  ]
};

// ../eep-transcoder/eep/d2-14-40.js
var d21440 = {
  number: "0x40",
  title: "Indoor -Temperature, Humidity XYZ Acceleration, Illumination Sensor",
  status: "proposed",
  description: "",
  case: {
    description: "",
    datafield: [
      {
        data: "Temperature",
        shortcut: "TMP10",
        description: "Temperature (linear)",
        info: "",
        bitoffs: "0",
        bitsize: "10",
        enum: {
          item: [
            {
              min: "0",
              max: "1000",
              scale: { min: "-40", max: "60" },
              unit: "\xB0C"
            },
            { min: "1001", max: "1020", description: "Reserved" },
            { value: "1021", description: "Out of Range negative" },
            { value: "1022", description: "Out of Range positive" },
            { value: "1023", description: "Error" }
          ]
        }
      },
      {
        data: "Humidity",
        shortcut: "HUM",
        description: "Rel. Humidity (linear)",
        info: "",
        bitoffs: "10",
        bitsize: "8",
        enum: {
          item: [
            {
              min: "0",
              max: "200",
              scale: { min: "0", max: "100" },
              unit: "%"
            },
            { min: "201", max: "254", description: "Reserved" },
            { value: "255", description: "Error" }
          ]
        }
      },
      {
        data: "Illumination",
        shortcut: "ILL",
        description: "Illumination (linear)",
        info: "",
        bitoffs: "18",
        bitsize: "17",
        enum: {
          item: [
            {
              min: "0",
              max: "100000",
              scale: { min: "0", max: "100000" },
              unit: "lx"
            },
            { min: "100001", max: "131070", description: "Reserved" },
            { value: "131071", description: "Error" }
          ]
        }
      },
      {
        data: "Accleration Status",
        shortcut: "ACC_S",
        description: "Status of the Sensor",
        info: "",
        bitoffs: "35",
        bitsize: "2",
        enum: {
          item: [
            { value: "0", description: "Heartbeat" },
            { value: "1", description: "Threshold 1 exceeded" },
            { value: "2", description: "Threshold 2 exceeded" },
            { value: "3", description: "Reserved" }
          ]
        }
      },
      {
        data: "Acceleration X",
        shortcut: "ACC_X",
        description: "Acceleration  X (linear)",
        info: "",
        bitoffs: "37",
        bitsize: "10",
        enum: {
          item: [
            {
              min: "0",
              max: "1000",
              scale: { min: "-2.5", max: "2.5" },
              unit: "g"
            },
            { min: "1000", max: "1020", description: "Reserved" },
            { value: "1021", description: "Out of range negative" },
            { value: "1022", description: "Out of range positive" },
            { value: "1023", description: "Error" }
          ]
        }
      },
      {
        data: "Acceleration Y",
        shortcut: "ACC_Y",
        description: "Acceleration  Y (linear)",
        info: "",
        bitoffs: "47",
        bitsize: "10",
        enum: {
          item: [
            {
              min: "0",
              max: "1000",
              scale: { min: "-2.5", max: "2.5" },
              unit: "g"
            },
            { min: "1000", max: "1020", description: "Reserved" },
            { value: "1021", description: "Out of range negative" },
            { value: "1022", description: "Out of range positive" },
            { value: "1023", description: "Error" }
          ]
        }
      },
      {
        data: "Acceleration Z",
        shortcut: "ACC_Z",
        description: "Acceleration  Z (linear)",
        info: "",
        bitoffs: "57",
        bitsize: "10",
        enum: {
          item: [
            {
              min: "0",
              max: "1000",
              scale: { min: "-2.5", max: "2.5" },
              unit: "g"
            },
            { min: "1000", max: "1020", description: "Reserved" },
            { value: "1021", description: "Out of range negative" },
            { value: "1022", description: "Out of range positive" },
            { value: "1023", description: "Error" }
          ]
        }
      },
      { reserved: "", bitoffs: "67", bitsize: "5" }
    ]
  },
  eep: "d2-14-40",
  rorg_title: "VLD",
  rorg_number: "0xD2",
  func_title: "Multisensors",
  func_number: "0x14"
};

// ../eep-transcoder/eep/d2-20-00.js
var d22000 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: "",
  case: [{
    title: "Telegram Definition : \u2018Fan Control Message\u2019",
    description: "* Devices with discrete fan speed levels instead of a continuous fan speed\n              range should divide the full range linearly and match values beside those\n              discrete levels to the next lower fan speed level.",
    datafield: [{
      reserved: {},
      bitoffs: "4",
      bitsize: "1"
    }, {
      data: "Operating Mode",
      shortcut: "OM",
      description: "Sets the operating mode",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "Disabled"
        }
      }, {
        item: {
          value: "1",
          description: "Standard compliant"
        }
      }, {
        item: {
          value: "2...14",
          description: "Reserved"
        }
      }, {
        item: {
          value: "15",
          description: "No change"
        }
      }]
    }, {
      data: "Temperature Level",
      shortcut: "TL",
      description: "Status of the temperature supervision",
      info: {},
      bitoffs: "5",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "Too low"
        }
      }, {
        item: {
          value: "1",
          description: "Normal"
        }
      }, {
        item: {
          value: "2",
          description: "Too high"
        }
      }, {
        item: {
          value: "3",
          description: "No change"
        }
      }]
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines the message type",
      info: {},
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: {
          value: "0",
          description: "Fan control"
        }
      }
    }, {
      data: "Humidity Control",
      shortcut: "HC",
      description: "Activates the humidity control",
      info: {},
      bitoffs: "8",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "Disabled"
        }
      }, {
        item: {
          value: "1",
          description: "Enabled"
        }
      }, {
        item: {
          value: "2",
          description: "Default"
        }
      }, {
        item: {
          value: "3",
          description: "No change"
        }
      }]
    }, {
      data: "Room Size Reference",
      shortcut: "RSR",
      description: "Defines if the provided room size has to be considered",
      info: {},
      bitoffs: "10",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "Used"
        }
      }, {
        item: {
          value: "1",
          description: "Not used"
        }
      }, {
        item: {
          value: "2",
          description: "Default"
        }
      }, {
        item: {
          value: "3",
          description: "No change"
        }
      }]
    }, {
      data: "Room Size",
      shortcut: "RS",
      description: "Defines the room size",
      info: {},
      bitoffs: "12",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "< 25 m\xB2"
        }
      }, {
        item: {
          value: "1",
          description: "25...50 m\xB2"
        }
      }, {
        item: {
          value: "2",
          description: "50...75 m\xB2"
        }
      }, {
        item: {
          value: "3",
          description: "75...100 m\xB2"
        }
      }, {
        item: {
          value: "4",
          description: "100...125 m\xB2"
        }
      }, {
        item: {
          value: "5",
          description: "125...150 m\xB2"
        }
      }, {
        item: {
          value: "6",
          description: "150...175 m\xB2"
        }
      }, {
        item: {
          value: "7",
          description: "175...200 m\xB2"
        }
      }, {
        item: {
          value: "8",
          description: "200...225 m\xB2"
        }
      }, {
        item: {
          value: "9",
          description: "225...250 m\xB2"
        }
      }, {
        item: {
          value: "10",
          description: "250...275 m\xB2"
        }
      }, {
        item: {
          value: "11",
          description: "275...300 m\xB2"
        }
      }, {
        item: {
          value: "12",
          description: "300...325 m\xB2"
        }
      }, {
        item: {
          value: "13",
          description: "325...350 m\xB2"
        }
      }, {
        item: {
          value: "14",
          description: "> 350 m\xB2"
        }
      }, {
        item: {
          value: "15",
          description: "No change"
        }
      }]
    }, {
      data: "Humidity Threshold",
      shortcut: "HT",
      description: "Sets the humidity threshold",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: [{
        item: {
          min: "0",
          max: "100",
          description: "0...100%"
        }
      }, {
        item: {
          min: "101",
          max: "252",
          description: "Reserved"
        }
      }, {
        item: {
          value: "253",
          description: "Auto"
        }
      }, {
        item: {
          value: "254",
          description: "Default"
        }
      }, {
        item: {
          value: "255",
          description: "No change"
        }
      }]
    }, {
      data: "Fan Speed *",
      shortcut: "FS",
      description: "Sets the fan speed",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      enum: [{
        item: {
          min: "0",
          max: "100",
          description: "0...100%"
        }
      }, {
        item: {
          min: "101",
          max: "252",
          description: "Reserved"
        }
      }, {
        item: {
          value: "253",
          description: "Auto"
        }
      }, {
        item: {
          value: "254",
          description: "Default"
        }
      }, {
        item: {
          value: "255",
          description: "No change"
        }
      }]
    }]
  }, {
    title: "Telegram Definition : \u2018Fan Status Message\u2019",
    description: {},
    datafield: [{
      data: "Operating Mode Status",
      shortcut: "OMS",
      description: "Provides the recent operating mode",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "Disabled"
        }
      }, {
        item: {
          value: "1",
          description: "Standard compliant"
        }
      }, {
        item: {
          min: "2",
          max: "14",
          description: "Reserved"
        }
      }, {
        item: {
          value: "15",
          description: "Not supported"
        }
      }]
    }, {
      data: "Service Information",
      shortcut: "SI",
      description: "Service information",
      info: {},
      bitoffs: "4",
      bitsize: "3",
      enum: [{
        item: {
          value: "0",
          description: "Nothing to report"
        }
      }, {
        item: {
          value: "1",
          description: "Air filter error"
        }
      }, {
        item: {
          value: "2",
          description: "Hardware error"
        }
      }, {
        item: {
          min: "3",
          max: "6",
          description: "Reserved"
        }
      }, {
        item: {
          value: "7",
          description: "Not supported"
        }
      }]
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines the message type",
      info: {},
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: {
          value: "1",
          description: "Fan status"
        }
      }
    }, {
      data: "Humidity Control Status",
      shortcut: "HCS",
      description: "States if the humidity control is active",
      info: {},
      bitoffs: "8",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "Disabled"
        }
      }, {
        item: {
          value: "1",
          description: "Enabled"
        }
      }, {
        item: {
          value: "2",
          description: "Reserved"
        }
      }, {
        item: {
          value: "3",
          description: "Not supported"
        }
      }]
    }, {
      data: "Room Size Reference",
      shortcut: "RSR",
      description: "States if the provided room size has to be considered",
      info: {},
      bitoffs: "10",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "Used"
        }
      }, {
        item: {
          value: "1",
          description: "Not used"
        }
      }, {
        item: {
          value: "2",
          description: "Reserved"
        }
      }, {
        item: {
          value: "3",
          description: "Not supported"
        }
      }]
    }, {
      data: "Room Size Status",
      shortcut: "RSS",
      description: "Room size status",
      info: {},
      bitoffs: "12",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "< 25 m\xB2"
        }
      }, {
        item: {
          value: "1",
          description: "25...50 m\xB2"
        }
      }, {
        item: {
          value: "2",
          description: "50...75 m\xB2"
        }
      }, {
        item: {
          value: "3",
          description: "75...100 m\xB2"
        }
      }, {
        item: {
          value: "4",
          description: "100...125 m\xB2"
        }
      }, {
        item: {
          value: "5",
          description: "125...150 m\xB2"
        }
      }, {
        item: {
          value: "6",
          description: "150...175 m\xB2"
        }
      }, {
        item: {
          value: "7",
          description: "175...200 m\xB2"
        }
      }, {
        item: {
          value: "8",
          description: "200...225 m\xB2"
        }
      }, {
        item: {
          value: "9",
          description: "225...250 m\xB2"
        }
      }, {
        item: {
          value: "10",
          description: "250...275 m\xB2"
        }
      }, {
        item: {
          value: "11",
          description: "275...300 m\xB2"
        }
      }, {
        item: {
          value: "12",
          description: "300...325 m\xB2"
        }
      }, {
        item: {
          value: "13",
          description: "325...350 m\xB2"
        }
      }, {
        item: {
          value: "14",
          description: "> 350 m\xB2"
        }
      }, {
        item: {
          value: "15",
          description: "Not supported"
        }
      }]
    }, {
      data: "Humidity",
      shortcut: "HUM",
      description: "Humidity measurement",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: [{
        item: {
          min: "0",
          max: "100",
          description: "0...100%"
        }
      }, {
        item: {
          min: "101",
          max: "254",
          description: "Reserved"
        }
      }, {
        item: {
          value: "255",
          description: "Not supported"
        }
      }]
    }, {
      data: "Fan Speed Status",
      shortcut: "FSS",
      description: "Fan speed",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      enum: [{
        item: {
          min: "0",
          max: "100",
          description: "0...100%"
        }
      }, {
        item: {
          min: "101",
          max: "254",
          description: "Reserved"
        }
      }, {
        item: {
          value: "255",
          description: "Not supported"
        }
      }]
    }]
  }],
  originalIndex: 194,
  eep: "d2-20-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Fan Control",
  func_number: "0x20",
  submitter: [
    "Maico Elektroapparate-Fabrik GmbH"
  ]
};

// ../eep-transcoder/eep/d2-20-01.js
var d22001 = {
  number: "0x01",
  title: "Type 0x01",
  status: "released",
  description: "\n              <br/>\n              <br/>",
  case: [{
    title: "Telegram Definition : \u2018Fan Control Message\u2019",
    description: "* Devices with discrete fan speed levels instead of a continuous fan speed\n              range should divide the full range linearly and match values beside those\n              discrete levels to the next lower fan speed level.",
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "7"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "8"
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines the message type",
      info: {},
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: {
          value: "0",
          description: "Fan control"
        }
      }
    }, {
      data: "Room Size Reference",
      shortcut: "RSR",
      description: "Defines if the provided room size has to be considered",
      info: {},
      bitoffs: "10",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "Used"
        }
      }, {
        item: {
          value: "1",
          description: "Not used"
        }
      }, {
        item: {
          value: "2",
          description: "Default"
        }
      }, {
        item: {
          value: "3",
          description: "No change"
        }
      }]
    }, {
      data: "Room Size",
      shortcut: "RS",
      description: "Defines the room size",
      info: {},
      bitoffs: "12",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "< 25 m\xB2"
        }
      }, {
        item: {
          value: "1",
          description: "25...50 m\xB2"
        }
      }, {
        item: {
          value: "2",
          description: "50...75 m\xB2"
        }
      }, {
        item: {
          value: "3",
          description: "75...100 m\xB2"
        }
      }, {
        item: {
          value: "4",
          description: "100...125 m\xB2"
        }
      }, {
        item: {
          value: "5",
          description: "125...150 m\xB2"
        }
      }, {
        item: {
          value: "6",
          description: "150...175 m\xB2"
        }
      }, {
        item: {
          value: "7",
          description: "175...200 m\xB2"
        }
      }, {
        item: {
          value: "8",
          description: "200...225 m\xB2"
        }
      }, {
        item: {
          value: "9",
          description: "225...250 m\xB2"
        }
      }, {
        item: {
          value: "10",
          description: "250...275 m\xB2"
        }
      }, {
        item: {
          value: "11",
          description: "275...300 m\xB2"
        }
      }, {
        item: {
          value: "12",
          description: "300...325 m\xB2"
        }
      }, {
        item: {
          value: "13",
          description: "325...350 m\xB2"
        }
      }, {
        item: {
          value: "14",
          description: "> 350 m\xB2"
        }
      }, {
        item: {
          value: "15",
          description: "No change"
        }
      }]
    }, {
      data: "Fan Speed *",
      shortcut: "FS",
      description: "Sets the fan speed",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      enum: [{
        item: {
          min: "0",
          max: "100",
          description: "0...100%"
        }
      }, {
        item: {
          min: "101",
          max: "252",
          description: "Reserved"
        }
      }, {
        item: {
          value: "253",
          description: "Auto"
        }
      }, {
        item: {
          value: "254",
          description: "Default"
        }
      }, {
        item: {
          value: "255",
          description: "No change"
        }
      }]
    }]
  }, {
    title: "Telegram Definition : \u2018Fan Status Message\u2019",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "4",
      bitsize: "3"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "8"
    }, {
      data: "Operating Mode Status",
      shortcut: "OMS",
      description: "Provides the recent operating mode",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "Disabled"
        }
      }, {
        item: {
          value: "1",
          description: "Standard compliant"
        }
      }, {
        item: {
          min: "2",
          max: "14",
          description: "Reserved"
        }
      }, {
        item: {
          value: "15",
          description: "Not supported"
        }
      }]
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines the message type",
      info: {},
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: {
          value: "1",
          description: "Fan status"
        }
      }
    }, {
      data: "Room Size Reference",
      shortcut: "RSR",
      description: "States if the provided room size has to be considered",
      info: {},
      bitoffs: "10",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "Used"
        }
      }, {
        item: {
          value: "1",
          description: "Not used"
        }
      }, {
        item: {
          value: "2",
          description: "Reserved"
        }
      }, {
        item: {
          value: "3",
          description: "Not supported"
        }
      }]
    }, {
      data: "Room Size Status",
      shortcut: "RSS",
      description: "Room size status",
      info: {},
      bitoffs: "12",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "< 25 m\xB2"
        }
      }, {
        item: {
          value: "1",
          description: "25...50 m\xB2"
        }
      }, {
        item: {
          value: "2",
          description: "50...75 m\xB2"
        }
      }, {
        item: {
          value: "3",
          description: "75...100 m\xB2"
        }
      }, {
        item: {
          value: "4",
          description: "100...125 m\xB2"
        }
      }, {
        item: {
          value: "5",
          description: "125...150 m\xB2"
        }
      }, {
        item: {
          value: "6",
          description: "150...175 m\xB2"
        }
      }, {
        item: {
          value: "7",
          description: "175...200 m\xB2"
        }
      }, {
        item: {
          value: "8",
          description: "200...225 m\xB2"
        }
      }, {
        item: {
          value: "9",
          description: "225...250 m\xB2"
        }
      }, {
        item: {
          value: "10",
          description: "250...275 m\xB2"
        }
      }, {
        item: {
          value: "11",
          description: "275...300 m\xB2"
        }
      }, {
        item: {
          value: "12",
          description: "300...325 m\xB2"
        }
      }, {
        item: {
          value: "13",
          description: "325...350 m\xB2"
        }
      }, {
        item: {
          value: "14",
          description: "> 350 m\xB2"
        }
      }, {
        item: {
          value: "15",
          description: "Not supported"
        }
      }]
    }, {
      data: "Fan Speed Status",
      shortcut: "FSS",
      description: "Fan speed",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      enum: [{
        item: {
          min: "0",
          max: "100",
          description: "0...100%"
        }
      }, {
        item: {
          min: "101",
          max: "254",
          description: "Reserved"
        }
      }, {
        item: {
          value: "255",
          description: "Not supported"
        }
      }]
    }]
  }],
  originalIndex: 195,
  eep: "d2-20-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Fan Control",
  func_number: "0x20",
  submitter: [
    "Maico Elektroapparate-Fabrik GmbH"
  ]
};

// ../eep-transcoder/eep/d2-20-02.js
var d22002 = {
  number: "0x02",
  title: "Type 0x02",
  status: "released",
  description: "",
  case: [{
    title: "Telegram Definition : \u2018Fan Control Message\u2019",
    description: "* Devices with discrete fan speed levels instead of a continuous fan speed\n              range should divide the full range linearly and match values beside those\n              discrete levels to the next lower fan speed level.",
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "7"
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "2"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "8"
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines the message type",
      info: {},
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: {
          value: "0",
          description: "Fan control"
        }
      }
    }, {
      data: "Room Size Reference",
      shortcut: "RSR",
      description: "Defines if the provided room size has to be considered",
      info: {},
      bitoffs: "10",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "Used"
        }
      }, {
        item: {
          value: "1",
          description: "Not used"
        }
      }, {
        item: {
          value: "2",
          description: "Default"
        }
      }, {
        item: {
          value: "3",
          description: "No change"
        }
      }]
    }, {
      data: "Room Size",
      shortcut: "RS",
      description: "Defines the room size",
      info: {},
      bitoffs: "12",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "< 25 m\xB2"
        }
      }, {
        item: {
          value: "1",
          description: "25...50 m\xB2"
        }
      }, {
        item: {
          value: "2",
          description: "50...75 m\xB2"
        }
      }, {
        item: {
          value: "3",
          description: "75...100 m\xB2"
        }
      }, {
        item: {
          value: "4",
          description: "100...125 m\xB2"
        }
      }, {
        item: {
          value: "5",
          description: "125...150 m\xB2"
        }
      }, {
        item: {
          value: "6",
          description: "150...175 m\xB2"
        }
      }, {
        item: {
          value: "7",
          description: "175...200 m\xB2"
        }
      }, {
        item: {
          value: "8",
          description: "200...225 m\xB2"
        }
      }, {
        item: {
          value: "9",
          description: "225...250 m\xB2"
        }
      }, {
        item: {
          value: "10",
          description: "250...275 m\xB2"
        }
      }, {
        item: {
          value: "11",
          description: "275...300 m\xB2"
        }
      }, {
        item: {
          value: "12",
          description: "300...325 m\xB2"
        }
      }, {
        item: {
          value: "13",
          description: "325...350 m\xB2"
        }
      }, {
        item: {
          value: "14",
          description: "> 350 m\xB2"
        }
      }, {
        item: {
          value: "15",
          description: "No change"
        }
      }]
    }, {
      data: "Fan Speed *",
      shortcut: "FS",
      description: "Sets the fan speed",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      enum: [{
        item: {
          min: "0",
          max: "100",
          description: "0...100%"
        }
      }, {
        item: {
          min: "101",
          max: "252",
          description: "Reserved"
        }
      }, {
        item: {
          value: "253",
          description: "Auto"
        }
      }, {
        item: {
          value: "254",
          description: "Default"
        }
      }, {
        item: {
          value: "255",
          description: "No change"
        }
      }]
    }]
  }, {
    title: "Telegram Definition : \u2018Fan Status Message\u2019",
    description: {},
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "7"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "8"
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines the message type",
      info: {},
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: {
          value: "1",
          description: "Fan status"
        }
      }
    }, {
      data: "Humidity Control Status",
      shortcut: "HCS",
      description: "States if the humidity control is active",
      info: {},
      bitoffs: "8",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "Disabled"
        }
      }, {
        item: {
          value: "1",
          description: "Enabled"
        }
      }, {
        item: {
          value: "2",
          description: "Reserved"
        }
      }, {
        item: {
          value: "3",
          description: "Not supported"
        }
      }]
    }, {
      data: "Room Size Reference",
      shortcut: "RSR",
      description: "States if the provided room size has to be considered",
      info: {},
      bitoffs: "10",
      bitsize: "2",
      enum: [{
        item: {
          value: "0",
          description: "Used"
        }
      }, {
        item: {
          value: "1",
          description: "Not used"
        }
      }, {
        item: {
          value: "2",
          description: "Reserved"
        }
      }, {
        item: {
          value: "3",
          description: "Not supported"
        }
      }]
    }, {
      data: "Room Size Status",
      shortcut: "RSS",
      description: "Room size status",
      info: {},
      bitoffs: "12",
      bitsize: "4",
      enum: [{
        item: {
          value: "0",
          description: "< 25 m\xB2"
        }
      }, {
        item: {
          value: "1",
          description: "25...50 m\xB2"
        }
      }, {
        item: {
          value: "2",
          description: "50...75 m\xB2"
        }
      }, {
        item: {
          value: "3",
          description: "75...100 m\xB2"
        }
      }, {
        item: {
          value: "4",
          description: "100...125 m\xB2"
        }
      }, {
        item: {
          value: "5",
          description: "125...150 m\xB2"
        }
      }, {
        item: {
          value: "6",
          description: "150...175 m\xB2"
        }
      }, {
        item: {
          value: "7",
          description: "175...200 m\xB2"
        }
      }, {
        item: {
          value: "8",
          description: "200...225 m\xB2"
        }
      }, {
        item: {
          value: "9",
          description: "225...250 m\xB2"
        }
      }, {
        item: {
          value: "10",
          description: "250...275 m\xB2"
        }
      }, {
        item: {
          value: "11",
          description: "275...300 m\xB2"
        }
      }, {
        item: {
          value: "12",
          description: "300...325 m\xB2"
        }
      }, {
        item: {
          value: "13",
          description: "325...350 m\xB2"
        }
      }, {
        item: {
          value: "14",
          description: "> 350 m\xB2"
        }
      }, {
        item: {
          value: "15",
          description: "Not supported"
        }
      }]
    }, {
      data: "Fan Speed Status",
      shortcut: "FSS",
      description: "Fan speed",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      enum: [{
        item: {
          min: "0",
          max: "100",
          description: "0...100%"
        }
      }, {
        item: {
          min: "101",
          max: "254",
          description: "Reserved"
        }
      }, {
        item: {
          value: "255",
          description: "Not supported"
        }
      }]
    }]
  }],
  originalIndex: 196,
  eep: "d2-20-02",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Fan Control",
  func_number: "0x20",
  submitter: [
    "Maico Elektroapparate-Fabrik GmbH"
  ]
};

// ../eep-transcoder/eep/d2-30-00.js
var d23000 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: "",
  case: [{
    title: "CMD 0x1 - Set heating controls output",
    description: "This message is sent to a floor heating actuator. It controls the valve position\n              of one channel or of all channels of the floor heating controls.\n                <br/>\n                <br/>Sender: controller; send type: broadcast or addressed; expected response: CMD 0x3\n                <br/>",
    datafield: [{
      data: "Valve control period / PWM signal interval",
      shortcut: "PERIOD",
      description: "Total on-off time for two-position valve controller\n                  <br/>(T valve open + T valve closed)",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Local default / no change",
          info: {}
        }, {
          value: "1",
          description: "1 s"
        }, {
          value: "2",
          description: "2 s"
        }, {
          value: "3",
          description: "5 s"
        }, {
          value: "4",
          description: "10 s"
        }, {
          value: "5",
          description: "20 s"
        }, {
          value: "6",
          description: "50 s"
        }, {
          value: "7",
          description: "100 s"
        }, {
          value: "8",
          description: "200 s"
        }, {
          value: "9",
          description: "500 s"
        }, {
          value: "10",
          description: "1000 s"
        }, {
          min: "11",
          max: "15",
          description: "Reserved"
        }]
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x01",
          description: "ID 01"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "2"
    }, {
      data: "Valve type",
      shortcut: "VTYP",
      description: "Type of connected valve",
      info: {},
      bitoffs: "10",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Valve normally closed (N.C.)",
          info: {}
        }, {
          value: "1",
          description: "Valve normally open (N.O.)"
        }]
      }
    }, {
      data: "Heating channel",
      shortcut: "HCH",
      description: "The heating channel that should be set",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0",
          max: "15",
          description: "A valid channel number",
          info: {}
        }, {
          min: "16",
          max: "30",
          description: "Reserved"
        }, {
          value: "31",
          description: "All valid channels"
        }]
      }
    }, {
      data: "Run init sequence",
      shortcut: "RIN",
      description: "Measure and store the valve zero point",
      info: {},
      bitoffs: "16",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "No action",
          info: {}
        }, {
          value: "1",
          description: "Run init sequence"
        }]
      }
    }, {
      data: "Valve position set point",
      shortcut: "POS",
      description: "Valve set point 0\u2026100% (0=closed, 100=open)",
      info: {},
      bitoffs: "17",
      bitsize: "7",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }]
  }, {
    title: "CMD 0x2 - Heating controls status query",
    description: "This message is sent to a floor heating actuator.\n              It requests the status of one channel or the status of the global\n              control unit of an actuator.\n                <br/>\n                <br/>Sender: controller; send type: broadcast or addressed; expected response: CMD 0x3\n                <br/>",
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x02",
          description: "ID 02"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "3"
    }, {
      data: "Heating channel",
      shortcut: "HCH",
      description: "The heating channel that should be reported",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0",
          max: "15",
          description: "A valid channel number",
          info: {}
        }, {
          min: "16",
          max: "28",
          description: "Reserved"
        }, {
          value: "29",
          description: "All valid channels"
        }, {
          value: "30",
          description: "All valid channels and global device status"
        }, {
          value: "31",
          description: "Global device status only"
        }]
      }
    }]
  }, {
    title: "CMD 0x3 - Heating controls status response / CH = 0...15",
    description: 'This message is sent by a floor heating controls if one of the following\n              events occurs:\n                <br/>- Message "status query" has been received (CMD 0x2).\n                <br/>- Status of one channel or temperature has changed.\n                <br/>\n                <br/>Sender: actuator; send type: broadcast; maximum send delay 1 s.\n                <br/>\n                <br/>If the response is for single channel data (CH = 0\u202615):\n                <br/>',
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x03",
          description: "ID 03"
        }
      }
    }, {
      data: "Status / Error",
      shortcut: "STATUS",
      description: "Status / Error indication of given channel",
      info: {},
      bitoffs: "8",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No fault",
          info: {}
        }, {
          value: "1",
          description: "General error"
        }, {
          value: "2",
          description: "Init sequence running"
        }, {
          value: "3",
          description: "Channel not available"
        }, {
          value: "4",
          description: "Temperature sensor error"
        }, {
          value: "5",
          description: "Valve error"
        }, {
          value: "6",
          description: "Temperature sensor and valve error"
        }, {
          value: "7",
          description: "Reserved"
        }]
      }
    }, {
      data: "Heating channel",
      shortcut: "HCH",
      description: "The heating channel that is reported",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0",
          max: "15",
          description: "A valid channel number",
          info: {}
        }, {
          min: "16",
          max: "31",
          description: "Reserved"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "1"
    }, {
      data: "Valve position",
      shortcut: "POS",
      description: "Actual valve position 0\u2026100% (0=closed, 100=open)",
      info: {},
      bitoffs: "17",
      bitsize: "7",
      range: {
        min: "0",
        max: "100"
      },
      scale: {
        min: "0",
        max: "100"
      },
      unit: "%"
    }, {
      data: "Return temperature",
      shortcut: "TEMPRET",
      description: "The current return temperature of the channel",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      range: {
        min: "0",
        max: "180"
      },
      scale: {
        min: "0",
        max: "90"
      },
      unit: "\xB0C"
    }]
  }, {
    title: "CMD 0x3 - Heating controls status response / CH = 31",
    description: "If the response is for global floor heating controls unit data (CH = 31):\n                <br/>",
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x03",
          description: "ID 03"
        }
      }
    }, {
      data: "Status / Error",
      shortcut: "STATUS",
      description: "Global unit status",
      info: {},
      bitoffs: "8",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No fault",
          info: {}
        }, {
          value: "1",
          description: "General error"
        }, {
          value: "2",
          description: "Supply temperature error"
        }, {
          value: "3",
          description: "Return temperature error"
        }, {
          value: "4",
          description: "Error on both sensors"
        }, {
          min: "5",
          max: "7",
          description: "Reserved"
        }]
      }
    }, {
      data: "Heating channel",
      shortcut: "HCH",
      description: "The heating channel that is reported (=global unit)",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: {
          value: "31",
          description: "Unit status only",
          info: {}
        }
      }
    }, {
      data: "Supply temperature",
      shortcut: "TSUP",
      description: "The current supply temperature of the unit",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      range: {
        min: "0",
        max: "180"
      },
      scale: {
        min: "0",
        max: "90"
      },
      unit: "\xB0C"
    }, {
      data: "Return temperature",
      shortcut: "TRET",
      description: "The current common return temperature",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      range: {
        min: "0",
        max: "180"
      },
      scale: {
        min: "0",
        max: "90"
      },
      unit: "\xB0C"
    }]
  }, {
    title: "CMD 0x6 - Set meter configuration / MBUS (BUS = 1)",
    description: "This message is sent to a metering device gateway to configure the meter\n              settings for one channel.\n                <br/>\n                <br/>Sender: controller; send type: broadcast or addressed.\n                <br/>",
    datafield: [{
      data: "Report measurement",
      shortcut: "RM",
      description: "Minimum auto reporting interval",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "No auto reporting",
          info: {}
        }, {
          value: "1",
          description: "Min. 1 s interval"
        }, {
          value: "2",
          description: "Min. 3 s interval"
        }, {
          value: "3",
          description: "Min. 10 s interval"
        }, {
          value: "4",
          description: "Min. 30 s interval"
        }, {
          value: "5",
          description: "Min. 100 s interval"
        }, {
          value: "6",
          description: "Min. 300 s interval"
        }, {
          value: "7",
          description: "Min. 1000 s interval"
        }, {
          min: "8",
          max: "15",
          description: "Reserved"
        }]
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x06",
          description: "ID 06"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      data: "Meter bus type",
      shortcut: "BUS",
      description: "The meter bus that should be configured",
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Reserved",
          info: {}
        }, {
          value: "1",
          description: "MBUS"
        }, {
          value: "2",
          description: "S0"
        }, {
          value: "3",
          description: "D0"
        }]
      }
    }, {
      data: "Meter channel index",
      shortcut: "MCH",
      description: "The meter bus that should be configured",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      range: {
        min: "0",
        max: "30"
      },
      scale: {
        min: "0",
        max: "30"
      },
      unit: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "2"
    }, {
      data: "Meter 1 units",
      shortcut: "UNIT1",
      description: "Physical units of first measured quantity\n                  <br/>(imported value)",
      info: {},
      bitoffs: "18",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "Meter 2 units",
      shortcut: "UNIT2",
      description: "Physical units of second measured quantity\n                  <br/>(exported value)",
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "Primary Address",
      shortcut: "ADDR",
      description: "The primary MBUS address of the meter",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      range: {
        min: "1",
        max: "250"
      },
      scale: {
        min: "1",
        max: "250"
      },
      unit: "1"
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "32",
      bitsize: "40",
      enum: {
        item: {
          value: "0",
          description: "NDF",
          info: {}
        }
      }
    }]
  }, {
    title: "CMD 0x6 - Set meter configuration / S0 (BUS = 2)",
    description: {},
    datafield: [{
      data: "Report measurement",
      shortcut: "RM",
      description: "Minimum auto reporting interval",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "No auto reporting",
          info: {}
        }, {
          value: "1",
          description: "Min. 1 s interval"
        }, {
          value: "2",
          description: "Min. 3 s interval"
        }, {
          value: "3",
          description: "Min. 10 s interval"
        }, {
          value: "4",
          description: "Min. 30 s interval"
        }, {
          value: "5",
          description: "Min. 100 s interval"
        }, {
          value: "6",
          description: "Min. 300 s interval"
        }, {
          value: "7",
          description: "Min. 1000 s interval"
        }, {
          min: "8",
          max: "15",
          description: "Reserved"
        }]
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x06",
          description: "ID 06"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      data: "Meter bus type",
      shortcut: "BUS",
      description: "The meter bus that should be configured",
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Reserved",
          info: {}
        }, {
          value: "1",
          description: "MBUS"
        }, {
          value: "2",
          description: "S0"
        }, {
          value: "3",
          description: "D0"
        }]
      }
    }, {
      data: "Meter channel index",
      shortcut: "MCH",
      description: "The meter number of given bus that should be configured",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      range: {
        min: "0",
        max: "30"
      },
      scale: {
        min: "0",
        max: "30"
      },
      unit: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "2"
    }, {
      data: "Meter 1 units",
      shortcut: "UNIT1",
      description: "Physical units of first measured quantity\n                  <br/>(imported value)",
      info: {},
      bitoffs: "18",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "Meter 2 units",
      shortcut: "UNIT2",
      description: "Physical units of second measured quantity\n                  <br/>(exported value)",
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "Factor of number of pulses",
      shortcut: "FACP",
      description: "The factor for the number of pulses\n                  <br/>per value in UNIT1",
      info: {},
      bitoffs: "24",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "1",
          info: {}
        }, {
          value: "1",
          description: "0.1"
        }, {
          value: "2",
          description: "0.01"
        }, {
          value: "3",
          description: "0.001"
        }]
      }
    }, {
      data: "Number of pulses",
      shortcut: "NOP",
      description: "The number of pulses per value in UNIT1* FACP",
      info: {},
      bitoffs: "26",
      bitsize: "14",
      enum: {
        item: [{
          value: "0",
          description: "Do not change the current setting of NOP",
          info: {}
        }, {
          min: "1",
          max: "16383",
          description: 'Number of pulses per unit<br/> (EEP 2.6.5:\n                    <span style="font-weight:bold;color:green">1 \u2026 16383</span>\n                    <span style="text-decoration:line-through;color:red">1 \u2026 65535</span>)'
        }]
      }
    }, {
      data: "Preset value",
      shortcut: "RST",
      description: "Preset the accumulated value to this value",
      info: {},
      bitoffs: "40",
      bitsize: "32",
      enum: {
        item: [{
          min: "0",
          max: "4294967294",
          description: "New preset value",
          info: {}
        }, {
          value: "0xFFFFFFFF",
          description: "Do not change the current value"
        }]
      }
    }]
  }, {
    title: "CMD 0x6 - Set meter configuration / D0 (BUS = 3)",
    description: {},
    datafield: [{
      data: "Report measurement",
      shortcut: "RM",
      description: "Minimum auto reporting interval",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "No auto reporting",
          info: {}
        }, {
          value: "1",
          description: "Min. 1 s interval"
        }, {
          value: "2",
          description: "Min. 3 s interval"
        }, {
          value: "3",
          description: "Min. 10 s interval"
        }, {
          value: "4",
          description: "Min. 30 s interval"
        }, {
          value: "5",
          description: "Min. 100 s interval"
        }, {
          value: "6",
          description: "Min. 300 s interval"
        }, {
          value: "7",
          description: "Min. 1000 s interval"
        }, {
          min: "8",
          max: "15",
          description: "Reserved"
        }]
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x06",
          description: "ID 06"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      data: "Meter bus type",
      shortcut: "BUS",
      description: "The meter bus that should be configured",
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Reserved",
          info: {}
        }, {
          value: "1",
          description: "MBUS"
        }, {
          value: "2",
          description: "S0"
        }, {
          value: "3",
          description: "D0"
        }]
      }
    }, {
      data: "Meter channel index",
      shortcut: "MCH",
      description: "The meter number of given bus that should be configured",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      range: {
        min: "0",
        max: "30"
      },
      scale: {
        min: "0",
        max: "30"
      },
      unit: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "2"
    }, {
      data: "Meter 1 units",
      shortcut: "UNIT1",
      description: "Physical units of first measured quantity\n                  <br/>(imported value)",
      info: {},
      bitoffs: "18",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "Meter 2 units",
      shortcut: "UNIT2",
      description: "Physical units of second measured quantity\n                  <br/>(exported value)",
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "D0 Protocol",
      shortcut: "PROT",
      description: "The D0 protocol that should be used for that meter",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      enum: {
        item: [{
          value: "0",
          description: "Auto detect",
          info: {}
        }, {
          value: "1",
          description: "SML (Smart Message Language)"
        }, {
          value: "2",
          description: "DLMS (Device Language Message Specification)"
        }, {
          min: "3",
          max: "255",
          description: "Reserved"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "32",
      bitsize: "40"
    }]
  }, {
    title: "CMD 0x7 - Meter Status Query",
    description: "This message is sent to a metering device gateway to query the status of a meter.\n                <br/>Sender: controller; send type: broadcast or addressed; expected response: CMD 0x8.\n                <br/>",
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x07",
          description: "ID 07"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      data: "Meter bus type",
      shortcut: "BUS",
      description: "The meter bus type that is queried",
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Reserved",
          info: {}
        }, {
          value: "1",
          description: "MBUS"
        }, {
          value: "2",
          description: "S0"
        }, {
          value: "3",
          description: "D0"
        }]
      }
    }, {
      data: "Meter channel index",
      shortcut: "MCH",
      description: "The meter channel of given bus that status is queried",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0",
          max: "30",
          description: "Meter channel",
          info: {}
        }, {
          value: "31",
          description: "All valid channels"
        }]
      }
    }]
  }, {
    title: "CMD 0x8 - Meter reading report / status response",
    description: 'This message is sent by a metering device gateway to report the meter\n              values for each configured channel.\n              It is sent if one of the following events occurs:\n                <br/>- Message "meter status query" has been received (CMD 0x7)\n                <br/>- Status or meter reading of one channel has changed and auto\n              reporting was configured by signal RM.\n                <br/>\n                <br/>Sender: sensor; send type: broadcast; maximum send delay 1 s.',
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "1"
    }, {
      data: "Meter status / error",
      shortcut: "MSTAT",
      description: "Meter channel status",
      info: {},
      bitoffs: "1",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No fault",
          info: {}
        }, {
          value: "1",
          description: "General error"
        }, {
          value: "2",
          description: "Bus unconfigured"
        }, {
          value: "3",
          description: "Bus unconnected"
        }, {
          value: "4",
          description: "Bus shortcut"
        }, {
          value: "5",
          description: "Communication timeout"
        }, {
          value: "6",
          description: "Unknown protocol or\n                      <br/>configuration mismatch"
        }, {
          value: "7",
          description: "Bus initialization running"
        }]
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x08",
          description: "ID 08"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      data: "Meter bus type",
      shortcut: "BUS",
      description: "The used bus of the meter status response",
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Reserved",
          info: {}
        }, {
          value: "1",
          description: "MBUS"
        }, {
          value: "2",
          description: "S0"
        }, {
          value: "3",
          description: "D0"
        }]
      }
    }, {
      data: "Meter channel index",
      shortcut: "MCH",
      description: "The meter number of given bus that status is reported",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      range: {
        min: "0",
        max: "30"
      },
      scale: {
        min: "0",
        max: "30"
      },
      unit: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "3"
    }, {
      data: "Value selection",
      shortcut: "VSEL",
      description: "The selection of the reported value",
      info: {},
      bitoffs: "19",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Meter 1 Current value",
          info: {}
        }, {
          value: "1",
          description: "Meter 1 Accumulated value"
        }, {
          value: "2",
          description: "Meter 2 Current value"
        }, {
          value: "3",
          description: "Meter 2 Accumulated value"
        }]
      }
    }, {
      data: "Value unit",
      shortcut: "VUNIT",
      description: "The unit of the reported value",
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "W",
          info: {}
        }, {
          value: "1",
          description: "Wh"
        }, {
          value: "2",
          description: "kWh"
        }, {
          value: "3",
          description: "m3/h"
        }, {
          value: "4",
          description: "dm3/h"
        }, {
          value: "5",
          description: "m3"
        }, {
          value: "6",
          description: "dm3"
        }, {
          value: "7",
          description: "1 (digital counter)"
        }]
      }
    }, {
      data: "Meter reading value",
      shortcut: "VAL",
      description: "The reported value",
      info: {},
      bitoffs: "24",
      bitsize: "32",
      range: {
        min: "0",
        max: "4294967295"
      },
      scale: {
        min: "0",
        max: "4294967295"
      },
      unit: "According to VUNIT"
    }]
  }],
  originalIndex: 197,
  eep: "d2-30-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Floor Heating Controls and Automated Meter Reading",
  func_number: "0x30",
  submitter: [
    "MSR-Solutions"
  ]
};

// ../eep-transcoder/eep/d2-30-01.js
var d23001 = {
  $t: "",
  number: "0x01",
  title: "Type 0x01 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-30-00",
  originalIndex: 198,
  eep: "d2-30-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Floor Heating Controls and Automated Meter Reading",
  func_number: "0x30",
  submitter: []
};

// ../eep-transcoder/eep/d2-30-02.js
var d23002 = {
  $t: "",
  number: "0x02",
  title: "Type 0x02 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-30-00",
  originalIndex: 199,
  eep: "d2-30-02",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Floor Heating Controls and Automated Meter Reading",
  func_number: "0x30",
  submitter: []
};

// ../eep-transcoder/eep/d2-30-03.js
var d23003 = {
  $t: "",
  number: "0x03",
  title: "Type 0x03 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-30-00",
  originalIndex: 200,
  eep: "d2-30-03",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Floor Heating Controls and Automated Meter Reading",
  func_number: "0x30",
  submitter: []
};

// ../eep-transcoder/eep/d2-30-04.js
var d23004 = {
  $t: "",
  number: "0x04",
  title: "Type 0x04 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-30-00",
  originalIndex: 201,
  eep: "d2-30-04",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Floor Heating Controls and Automated Meter Reading",
  func_number: "0x30",
  submitter: []
};

// ../eep-transcoder/eep/d2-30-05.js
var d23005 = {
  $t: "",
  number: "0x05",
  title: "Type 0x05 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-30-00",
  originalIndex: 202,
  eep: "d2-30-05",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Floor Heating Controls and Automated Meter Reading",
  func_number: "0x30",
  submitter: []
};

// ../eep-transcoder/eep/d2-30-06.js
var d23006 = {
  $t: "",
  number: "0x06",
  title: "Type 0x06 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-30-00",
  originalIndex: 203,
  eep: "d2-30-06",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Floor Heating Controls and Automated Meter Reading",
  func_number: "0x30",
  submitter: []
};

// ../eep-transcoder/eep/d2-31-00.js
var d23100 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: "",
  case: [{
    title: "CMD 0x6 - Set meter configuration / MBUS (BUS = 1)",
    description: "This message is sent to a metering device gateway to configure the meter\n              settings for one channel.\n                <br/>\n                <br/>Sender: controller; send type: broadcast or addressed.\n                <br/>",
    datafield: [{
      data: "Report measurement",
      shortcut: "RM",
      description: "Minimum auto reporting interval",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "No auto reporting",
          info: {}
        }, {
          value: "1",
          description: "Min. 1 s interval"
        }, {
          value: "2",
          description: "Min. 3 s interval"
        }, {
          value: "3",
          description: "Min. 10 s interval"
        }, {
          value: "4",
          description: "Min. 30 s interval"
        }, {
          value: "5",
          description: "Min. 100 s interval"
        }, {
          value: "6",
          description: "Min. 300 s interval"
        }, {
          value: "7",
          description: "Min. 1000 s interval"
        }, {
          min: "8",
          max: "15",
          description: "Reserved"
        }]
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x06",
          description: "ID 06"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      data: "Meter bus type",
      shortcut: "BUS",
      description: "The meter bus that should be configured",
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Reserved",
          info: {}
        }, {
          value: "1",
          description: "MBUS"
        }, {
          value: "2",
          description: "S0"
        }, {
          value: "3",
          description: "D0"
        }]
      }
    }, {
      data: "Meter channel index",
      shortcut: "MCH",
      description: "The meter number of given bus that should be configured",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      range: {
        min: "0",
        max: "30"
      },
      scale: {
        min: "0",
        max: "30"
      },
      unit: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "2"
    }, {
      data: "Meter 1 units",
      shortcut: "UNIT1",
      description: "Physical units of first measured quantity\n                  <br/>(imported value)",
      info: {},
      bitoffs: "18",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "Meter 2 units",
      shortcut: "UNIT2",
      description: "Physical units of second measured quantity\n                  <br/>(exported value)",
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "Primary Address",
      shortcut: "ADDR",
      description: "The primary MBUS address of the meter",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      range: {
        min: "1",
        max: "250"
      },
      scale: {
        min: "1",
        max: "250"
      },
      unit: "1"
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "32",
      bitsize: "40"
    }]
  }, {
    title: "CMD 0x6 - Set meter configuration / S0 (BUS = 2)",
    description: {},
    datafield: [{
      data: "Report measurement",
      shortcut: "RM",
      description: "Minimum auto reporting interval",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "No auto reporting",
          info: {}
        }, {
          value: "1",
          description: "Min. 1 s interval"
        }, {
          value: "2",
          description: "Min. 3 s interval"
        }, {
          value: "3",
          description: "Min. 10 s interval"
        }, {
          value: "4",
          description: "Min. 30 s interval"
        }, {
          value: "5",
          description: "Min. 100 s interval"
        }, {
          value: "6",
          description: "Min. 300 s interval"
        }, {
          value: "7",
          description: "Min. 1000 s interval"
        }, {
          min: "8",
          max: "15",
          description: "Reserved"
        }]
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x06",
          description: "ID 06"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      data: "Meter bus type",
      shortcut: "BUS",
      description: "The meter bus that should be configured",
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Reserved",
          info: {}
        }, {
          value: "1",
          description: "MBUS"
        }, {
          value: "2",
          description: "S0"
        }, {
          value: "3",
          description: "D0"
        }]
      }
    }, {
      data: "Meter channel index",
      shortcut: "MCH",
      description: "The meter number of given bus that should be configured",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      range: {
        min: "0",
        max: "30"
      },
      scale: {
        min: "0",
        max: "30"
      },
      unit: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "2"
    }, {
      data: "Meter 1 units",
      shortcut: "UNIT1",
      description: "Physical units of first measured quantity\n                  <br/>(imported value)",
      info: {},
      bitoffs: "18",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "Meter 2 units",
      shortcut: "UNIT2",
      description: "Physical units of second measured quantity\n                  <br/>(exported value)",
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "Factor of number of pulses",
      shortcut: "FACP",
      description: "The factor for the number of pulses\n                  <br/>per value in UNIT1",
      info: {},
      bitoffs: "24",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "1",
          info: {}
        }, {
          value: "1",
          description: "0.1"
        }, {
          value: "2",
          description: "0.01"
        }, {
          value: "3",
          description: "0.001"
        }]
      }
    }, {
      data: "Number of pulses",
      shortcut: "NOP",
      description: "The number of pulses per value in UNIT1* FACP",
      info: {},
      bitoffs: "26",
      bitsize: "14",
      enum: {
        item: [{
          value: "0",
          description: "Do not change the current setting of NOP",
          info: {}
        }, {
          min: "1",
          max: "16383",
          description: 'Number of pulses per unit<br/> (EEP 2.6.5:\n                    <span style="font-weight:bold;color:green">1 \u2026 16383</span>\n                    <span style="text-decoration:line-through;color:red">1 \u2026 65535</span>)'
        }]
      }
    }, {
      data: "Preset value",
      shortcut: "RST",
      description: "Preset the accumulated value to this value",
      info: {},
      bitoffs: "40",
      bitsize: "32",
      enum: {
        item: [{
          min: "0",
          max: "4294967294",
          description: "New preset value",
          info: {}
        }, {
          value: "0xFFFFFFFF",
          description: "Do not change the current value"
        }]
      }
    }]
  }, {
    title: "CMD 0x6 - Set meter configuration / D0 (BUS = 3)",
    description: {},
    datafield: [{
      data: "Report measurement",
      shortcut: "RM",
      description: "Minimum auto reporting interval",
      info: {},
      bitoffs: "0",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "No auto reporting",
          info: {}
        }, {
          value: "1",
          description: "Min. 1 s interval"
        }, {
          value: "2",
          description: "Min. 3 s interval"
        }, {
          value: "3",
          description: "Min. 10 s interval"
        }, {
          value: "4",
          description: "Min. 30 s interval"
        }, {
          value: "5",
          description: "Min. 100 s interval"
        }, {
          value: "6",
          description: "Min. 300 s interval"
        }, {
          value: "7",
          description: "Min. 1000 s interval"
        }, {
          min: "8",
          max: "15",
          description: "Reserved"
        }]
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x06",
          description: "ID 06"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      data: "Meter bus type",
      shortcut: "BUS",
      description: "The meter bus that should be configured",
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Reserved",
          info: {}
        }, {
          value: "1",
          description: "MBUS"
        }, {
          value: "2",
          description: "S0"
        }, {
          value: "3",
          description: "D0"
        }]
      }
    }, {
      data: "Meter channel index",
      shortcut: "MCH",
      description: "The meter number of given bus that should be configured",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      range: {
        min: "0",
        max: "30"
      },
      scale: {
        min: "0",
        max: "30"
      },
      unit: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "2"
    }, {
      data: "Meter 1 units",
      shortcut: "UNIT1",
      description: "Physical units of first measured quantity\n                  <br/>(imported value)",
      info: {},
      bitoffs: "18",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "Meter 2 units",
      shortcut: "UNIT2",
      description: "Physical units of second measured quantity\n                  <br/>(exported value)",
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No reading (unconfigured)",
          info: {}
        }, {
          value: "1",
          description: "Current value W, accumulated value kWh"
        }, {
          value: "2",
          description: "Current value W, accumulated value Wh"
        }, {
          value: "3",
          description: "Accumulated value kWh only"
        }, {
          value: "4",
          description: "Current value m3/h, accumulated value m3"
        }, {
          value: "5",
          description: "Current value dm3/h, accumulated value dm3"
        }, {
          value: "6",
          description: "Accumulated value m3 only"
        }, {
          value: "7",
          description: "Digital counter"
        }]
      }
    }, {
      data: "D0 Protocol",
      shortcut: "PROT",
      description: "The D0 protocol that should be used for that meter",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      enum: {
        item: [{
          value: "0",
          description: "Auto detect",
          info: {}
        }, {
          value: "1",
          description: "SML (Smart Message Language)"
        }, {
          value: "2",
          description: "DLMS (Device Language Message Specification)"
        }, {
          min: "3",
          max: "255",
          description: "Reserved"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "32",
      bitsize: "40"
    }]
  }, {
    title: "CMD 0x7 - Meter Status Query",
    description: "This message is sent to a metering device gateway to query the status of a meter.\n                <br/>Sender: controller; send type: broadcast or addressed; expected response: CMD 0x8.\n                <br/>",
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "4"
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x07",
          description: "ID 07"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      data: "Meter bus type",
      shortcut: "BUS",
      description: "The meter bus type that is queried",
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Reserved",
          info: {}
        }, {
          value: "1",
          description: "MBUS"
        }, {
          value: "2",
          description: "S0"
        }, {
          value: "3",
          description: "D0"
        }]
      }
    }, {
      data: "Meter channel index",
      shortcut: "MCH",
      description: "The meter channel of given bus that status is queried",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      enum: {
        item: [{
          min: "0",
          max: "30",
          description: "Meter channel",
          info: {}
        }, {
          value: "31",
          description: "All valid channels"
        }]
      }
    }]
  }, {
    title: "CMD 0x8 - Meter reading report / status response",
    description: 'This message is sent by a metering device gateway to report the meter\n              values for each configured channel.\n              It is sent if one of the following events occurs:\n                <br/>- Message "meter status query" has been received (CMD 0x7)\n                <br/>- Status or meter reading of one channel has changed and auto\n              reporting was configured by signal RM.\n                <br/>\n                <br/>Sender: sensor; send type: broadcast; maximum send delay 1 s.\n                <br/>',
    datafield: [{
      reserved: {},
      bitoffs: "0",
      bitsize: "1"
    }, {
      data: "Meter status / error",
      shortcut: "MSTAT",
      description: "Meter channel status",
      info: {},
      bitoffs: "1",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "No fault",
          info: {}
        }, {
          value: "1",
          description: "General error"
        }, {
          value: "2",
          description: "Bus unconfigured"
        }, {
          value: "3",
          description: "Bus unconnected"
        }, {
          value: "4",
          description: "Bus shortcut"
        }, {
          value: "5",
          description: "Communication timeout"
        }, {
          value: "6",
          description: "Unknown protocol or\n                      <br/>configuration mismatch"
        }, {
          value: "7",
          description: "Bus initialization running"
        }]
      }
    }, {
      data: "Command ID",
      shortcut: "CMD",
      description: "Command identifier",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: {
          value: "0x08",
          description: "ID 08"
        }
      }
    }, {
      reserved: {},
      bitoffs: "8",
      bitsize: "1"
    }, {
      data: "Meter bus type",
      shortcut: "BUS",
      description: "The used bus of the meter status response",
      info: {},
      bitoffs: "9",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Reserved",
          info: {}
        }, {
          value: "1",
          description: "MBUS"
        }, {
          value: "2",
          description: "S0"
        }, {
          value: "3",
          description: "D0"
        }]
      }
    }, {
      data: "Meter channel index",
      shortcut: "MCH",
      description: "The meter number of given bus that status is reported",
      info: {},
      bitoffs: "11",
      bitsize: "5",
      range: {
        min: "0",
        max: "30"
      },
      scale: {
        min: "0",
        max: "30"
      },
      unit: "1"
    }, {
      reserved: {},
      bitoffs: "16",
      bitsize: "3"
    }, {
      data: "Value selection",
      shortcut: "VSEL",
      description: "The selection of the reported value",
      info: {},
      bitoffs: "19",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Meter 1 Current value",
          info: {}
        }, {
          value: "1",
          description: "Meter 1 Accumulated value"
        }, {
          value: "2",
          description: "Meter 2 Current value"
        }, {
          value: "3",
          description: "Meter 2 Accumulated value"
        }]
      }
    }, {
      data: "Value unit",
      shortcut: "VUNIT",
      description: "The unit of the reported value",
      info: {},
      bitoffs: "21",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "W",
          info: {}
        }, {
          value: "1",
          description: "Wh"
        }, {
          value: "2",
          description: "kWh"
        }, {
          value: "3",
          description: "m3/h"
        }, {
          value: "4",
          description: "dm3/h"
        }, {
          value: "5",
          description: "m3"
        }, {
          value: "6",
          description: "dm3"
        }, {
          value: "7",
          description: "1 (digital counter)"
        }]
      }
    }, {
      data: "Meter reading value",
      shortcut: "VAL",
      description: "The reported value",
      info: {},
      bitoffs: "24",
      bitsize: "32",
      range: {
        min: "0",
        max: "4294967295"
      },
      scale: {
        min: "0",
        max: "4294967295"
      },
      unit: "According to VUNIT"
    }]
  }],
  originalIndex: 204,
  eep: "d2-31-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Automated Meter Reading Gateway",
  func_number: "0x31",
  submitter: [
    "MSR-Solutions"
  ]
};

// ../eep-transcoder/eep/d2-31-01.js
var d23101 = {
  $t: "",
  number: "0x01",
  title: "Type 0x01 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-31-00",
  originalIndex: 205,
  eep: "d2-31-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Automated Meter Reading Gateway",
  func_number: "0x31",
  submitter: []
};

// ../eep-transcoder/eep/d2-32-00.js
var d23200 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: '\n              <br/>\n              <br/>\n              <img>graphics/D2-32-00.png</img>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Notes</span>\n              <br/>1) If Power Fail bit is set, all channel readings will be set to\n              zero when this final telegram is sent.\n              <br/>2) Scale/divisor is set to 0 or 1 for all channels only, not individually.',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "2",
      bitsize: "6"
    }, {
      reserved: {},
      bitoffs: "20",
      bitsize: "4"
    }, {
      data: "Power Fail",
      shortcut: "PF",
      description: "See Note 1",
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "False"
        }, {
          value: "1",
          description: "True"
        }]
      }
    }, {
      data: "Divisor",
      shortcut: "DIV",
      description: "Divisor for all channels",
      info: {},
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "x/1",
          scale: {
            min: 0,
            max: 4095
          }
        }, {
          value: "1",
          description: "x/10",
          scale: {
            min: 0,
            max: 409.5
          }
        }]
      }
    }, {
      data: "Channel 1",
      shortcut: "CH1",
      description: "Current value",
      info: {},
      bitoffs: "8",
      bitsize: "12",
      range: {
        min: "0",
        max: "0xFFF"
      },
      scale: {
        ref: "DIV"
      },
      unit: "A"
    }]
  }],
  originalIndex: 206,
  eep: "d2-32-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "A.C. Current Clamp",
  func_number: "0x32",
  submitter: [
    "Pressac Communications Ltd"
  ]
};

// ../eep-transcoder/eep/d2-32-01.js
var d23201 = {
  number: "0x01",
  title: "Type 0x01",
  status: "released",
  description: '\n              <br/>\n              <br/>\n              <img>graphics/D2-32-01.png</img>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Notes</span>\n              <br/>1) If Power Fail bit is set, all channel readings will be set to\n              zero when this final telegram is sent.\n              <br/>2) Scale/divisor is set to 0 or 1 for all channels only, not individually.',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "2",
      bitsize: "6"
    }, {
      data: "Power Fail",
      shortcut: "PF",
      description: "See Note 1",
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "False"
        }, {
          value: "1",
          description: "True"
        }]
      }
    }, {
      data: "Divisor",
      shortcut: "DIV",
      description: "Divisor for all channels",
      info: {},
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "x/1",
          scale: {
            min: 0,
            max: 4095
          }
        }, {
          value: "1",
          description: "x/10",
          scale: {
            min: 0,
            max: 409.5
          }
        }]
      }
    }, {
      data: "Channel 1",
      shortcut: "CH1",
      description: "Current value",
      info: {},
      bitoffs: "8",
      bitsize: "12",
      range: {
        min: "0",
        max: "0xFFF"
      },
      scale: {
        ref: "DIV"
      },
      unit: "A"
    }, {
      data: "Channel 2",
      shortcut: "CH2",
      description: "Current value",
      info: {},
      bitoffs: "20",
      bitsize: "12",
      range: {
        min: "0",
        max: "0xFFF"
      },
      scale: {
        ref: "DIV"
      },
      unit: "A"
    }]
  }],
  originalIndex: 207,
  eep: "d2-32-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "A.C. Current Clamp",
  func_number: "0x32",
  submitter: [
    "Pressac Communications Ltd"
  ]
};

// ../eep-transcoder/eep/d2-32-02.js
var d23202 = {
  number: "0x02",
  title: "Type 0x02",
  status: "released",
  description: '\n              <br/>\n              <br/>\n              <img>graphics/D2-32-02.png</img>\n              <br/>\n              <span style="border-bottom:2px groove #000000;">Notes</span>\n              <br/>1) If Power Fail bit is set, all channel readings will be set to\n              zero when this final telegram is sent.\n              <br/>2) Scale/divisor is set to 0 or 1 for all channels only, not individually.',
  case: [{
    datafield: [{
      reserved: {},
      bitoffs: "2",
      bitsize: "6"
    }, {
      reserved: {},
      bitoffs: "44",
      bitsize: "4"
    }, {
      data: "Power Fail",
      shortcut: "PF",
      description: "See Note 1",
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "False"
        }, {
          value: "1",
          description: "True"
        }]
      }
    }, {
      data: "Divisor",
      shortcut: "DIV",
      description: "Divisor for all channels",
      info: {},
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "x/1",
          scale: {
            min: 0,
            max: 4095
          }
        }, {
          value: "1",
          description: "x/10",
          scale: {
            min: 0,
            max: 409.5
          }
        }]
      }
    }, {
      data: "Channel 1",
      shortcut: "CH1",
      description: "Current value",
      info: {},
      bitoffs: "8",
      bitsize: "12",
      range: {
        min: "0",
        max: "0xFFF"
      },
      scale: {
        ref: "DIV"
      },
      unit: "A"
    }, {
      data: "Channel 2",
      shortcut: "CH2",
      description: "Current value",
      info: {},
      bitoffs: "20",
      bitsize: "12",
      range: {
        min: "0",
        max: "0xFFF"
      },
      scale: {
        ref: "DIV"
      },
      unit: "A"
    }, {
      data: "Channel 3",
      shortcut: "CH3",
      description: "Current value",
      info: {},
      bitoffs: "32",
      bitsize: "12",
      range: {
        min: "0",
        max: "0xFFF"
      },
      scale: {
        ref: "DIV"
      },
      unit: "A"
    }]
  }],
  originalIndex: 208,
  eep: "d2-32-02",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "A.C. Current Clamp",
  func_number: "0x32",
  submitter: [
    "Pressac Communications Ltd"
  ]
};

// ../eep-transcoder/eep/d2-40-00.js
var d24000 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: "\n              <br/>\n              <br/>\n              <b>MsgId 0x00:</b>Status of monocolor LED controller\n              <br/>\n              <img>graphics/D2-40-00.png</img>",
  case: [{
    datafield: [{
      data: "LED output enabled",
      shortcut: "OUTEN",
      description: "Driving LED enabled",
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Disabled"
        }, {
          value: "1",
          description: "Enabled"
        }]
      }
    }, {
      data: "\u201CDemand Response\u201D mode Active",
      shortcut: "DRA",
      description: "Controller is in the DR mode. It had received a\n                DR command from DR controller, and it is executing it.",
      info: {},
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "False"
        }, {
          value: "1",
          description: "True"
        }]
      }
    }, {
      data: "Daylight Harvesting Active",
      shortcut: "DHAR",
      description: "Daylight harvesting feature is turned on.\n                Readings from photo sensor are influencing the dimming level.",
      info: {},
      bitoffs: "2",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "False"
        }, {
          value: "1",
          description: "True"
        }]
      }
    }, {
      data: "Occupancy State",
      shortcut: "OCC",
      description: "Room which controller is in charge of\n                is considered occupied.",
      info: {},
      bitoffs: "3",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Not occupied"
        }, {
          value: "1",
          description: "Occupied"
        }, {
          value: "2",
          description: "Unknown"
        }]
      }
    }, {
      data: "Status Tx reason",
      shortcut: "SREAS",
      description: "Reason for sending this status message",
      info: {},
      bitoffs: "5",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Other"
        }, {
          value: "1",
          description: "Heartbeat"
        }]
      }
    }, {
      data: "MsgId",
      shortcut: "MI",
      description: "Message Id; 0x00",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: {
        item: {
          value: "0",
          description: "LED Status monocolor"
        }
      }
    }, {
      data: "Current Dim Level",
      shortcut: "DLVL",
      description: "Current dim level for the monocolor LED",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "200",
          scale: {
            min: "0",
            max: "100"
          },
          unit: "%"
        }, {
          value: "0xFF",
          description: "If not used"
        }]
      }
    }]
  }],
  originalIndex: 209,
  eep: "d2-40-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "LED Controller Status",
  func_number: "0x40",
  submitter: [
    "EnOcean GmbH"
  ]
};

// ../eep-transcoder/eep/d2-40-01.js
var d24001 = {
  number: "0x01",
  title: "Type 0x01",
  status: "released",
  description: "\n              <br/>\n              <br/>\n              <b>MsgId 0x01:</b>Status of RGB LED controller\n              <br/>\n              <img>graphics/D2-40-01.png</img>",
  case: [{
    datafield: [{
      data: "LED output enabled",
      shortcut: "OUTEN",
      description: "Driving LED enabled",
      info: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Disabled"
        }, {
          value: "1",
          description: "Enabled"
        }]
      }
    }, {
      data: "\u201CDemand Response\u201D mode Active",
      shortcut: "DRA",
      description: "Controller is in the DR mode. It had received a\n                DR command from DR controller, and it is executing it.",
      info: {},
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "False"
        }, {
          value: "1",
          description: "True"
        }]
      }
    }, {
      data: "Daylight Harvesting Active",
      shortcut: "DHAR",
      description: "Daylight harvesting feature is turned on.\n                Readings from photo sensor are influencing the dimming level.",
      info: {},
      bitoffs: "2",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "False"
        }, {
          value: "1",
          description: "True"
        }]
      }
    }, {
      data: "Occupancy State",
      shortcut: "OCC",
      description: "Room which controller is in charge of\n                is considered occupied.",
      info: {},
      bitoffs: "3",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "Not occupied"
        }, {
          value: "1",
          description: "Occupied"
        }, {
          value: "2",
          description: "Unknown"
        }]
      }
    }, {
      data: "Status Tx reason",
      shortcut: "SREAS",
      description: "Reason for sending this status message",
      info: {},
      bitoffs: "5",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Other"
        }, {
          value: "1",
          description: "Heartbeat"
        }]
      }
    }, {
      data: "MsgId",
      shortcut: "MI",
      description: "Message Id; 0x01",
      info: {},
      bitoffs: "6",
      bitsize: "2",
      enum: {
        item: {
          value: "1",
          description: "LED Status RGB"
        }
      }
    }, {
      data: "Current Dim Level LED R",
      shortcut: "DLVLR",
      description: "Current dim level for the red LED",
      info: {},
      bitoffs: "8",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "200",
          scale: {
            min: "0",
            max: "100"
          },
          unit: "%"
        }, {
          value: "0xFF",
          description: "If not used"
        }]
      }
    }, {
      data: "Current Dim Level LED G",
      shortcut: "DLVLG",
      description: "Current dim level for the green LED",
      info: {},
      bitoffs: "16",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "200",
          scale: {
            min: "0",
            max: "100"
          },
          unit: "%"
        }, {
          value: "0xFF",
          description: "If not used"
        }]
      }
    }, {
      data: "Current Dim Level LED B",
      shortcut: "DLVLB",
      description: "Current dim level for the blue LED",
      info: {},
      bitoffs: "24",
      bitsize: "8",
      enum: {
        item: [{
          min: "0",
          max: "200",
          scale: {
            min: "0",
            max: "100"
          },
          unit: "%"
        }, {
          value: "0xFF",
          description: "If not used"
        }]
      }
    }]
  }],
  originalIndex: 210,
  eep: "d2-40-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "LED Controller Status",
  func_number: "0x40",
  submitter: [
    "EnOcean GmbH"
  ]
};

// ../eep-transcoder/eep/d2-50-00.js
var d25000 = {
  number: "0x00",
  title: "Type 0x00",
  status: "released",
  description: "",
  case: [{
    title: "Telegram Definition: \u2018Ventilation Remote Transmission Request Message\u2019",
    description: "The \u2018Ventilation Remote Transmission Request Message\u2019 queries a particular\n                status message from the heat-recovery ventilation unit.\n                Thus status messages can be obtained at any time or at a higher update\n                rate than the heartbeat rate, e.g. during commissioning.\n                <br/>\n                <br/>Direction: Gateway --> Heat-recovery ventilation unit\n                <br/>\n                <img>graphics/D2-50-ZZ-No001.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: 0,
        bitsize: 3,
        value: 0
      }
    },
    datafield: [{
      data: "Message Type",
      shortcut: "MT",
      description: "Defines the message type",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Ventilation remote transmission request"
        }, {
          value: "1",
          description: "Ventilation control"
        }, {
          value: "2",
          description: "Ventilation basic status"
        }, {
          value: "3",
          description: "Ventilation extended status"
        }, {
          value: "4",
          description: "Reserved"
        }, {
          value: "5",
          description: "Reserved"
        }, {
          value: "6",
          description: "Reserved"
        }, {
          value: "7",
          description: "Reserved"
        }]
      }
    }, {
      data: "Requested Message Type",
      shortcut: "RMT",
      description: "Defines the message type, which is requested by the remote device",
      info: {},
      bitoffs: "5",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Ventilation basic status"
        }, {
          value: "1",
          description: "Ventilation extended status"
        }, {
          value: "2",
          description: "Reserved"
        }, {
          value: "3",
          description: "Reserved"
        }, {
          value: "4",
          description: "Reserved"
        }, {
          value: "5",
          description: "Reserved"
        }, {
          value: "6",
          description: "Reserved"
        }, {
          value: "7",
          description: "Reserved"
        }]
      }
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "3",
      bitsize: "2"
    }]
  }, {
    title: "Telegram Definition: \u2018Ventilation Control Message\u2019",
    description: "The \u2018Ventilation Control Message\u2019 changes the operating mode,\n              the state of several actuators and a subset of control parameters.\n              <br/>\n              <br/>Direction: Gateway --> Heat-recovery ventilation unit\n              <br/>\n              <img>graphics/D2-50-ZZ-No002.png</img>\n              <br/>",
    condition: {
      datafield: {
        bitoffs: 0,
        bitsize: 3,
        value: 1
      }
    },
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "3",
      bitsize: "1"
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "12",
      bitsize: "4"
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "24",
      bitsize: "1"
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "32",
      bitsize: "1"
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "40",
      bitsize: "1"
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines the message type",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Ventilation remote transmission request"
        }, {
          value: "1",
          description: "Ventilation control"
        }, {
          value: "2",
          description: "Ventilation basic status"
        }, {
          value: "3",
          description: "Ventilation extended status"
        }, {
          value: "4",
          description: "Reserved"
        }, {
          value: "5",
          description: "Reserved"
        }, {
          value: "6",
          description: "Reserved"
        }, {
          value: "7",
          description: "Reserved"
        }]
      }
    }, {
      data: "Direct Operation Mode Control",
      shortcut: "DOMC",
      description: "Selects ventilation mode/level",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Off"
        }, {
          value: "1",
          description: "Level 1"
        }, {
          value: "2",
          description: "Level 2"
        }, {
          value: "3",
          description: "Level 3"
        }, {
          value: "4",
          description: "Level 4"
        }, {
          value: "5",
          description: "Reserved"
        }, {
          value: "6",
          description: "Reserved"
        }, {
          value: "7",
          description: "Reserved"
        }, {
          value: "8",
          description: "Reserved"
        }, {
          value: "9",
          description: "Reserved"
        }, {
          value: "10",
          description: "Reserved"
        }, {
          value: "11",
          description: "Automatic"
        }, {
          value: "12",
          description: "Automatic on demand"
        }, {
          value: "13",
          description: "Supply air only"
        }, {
          value: "14",
          description: "Exhaust air only"
        }, {
          value: "15",
          description: "no action (keep current ventilation mode/level)"
        }]
      }
    }, {
      data: "Operation Mode Control",
      shortcut: "OMC",
      description: "Selects the next resp. previous available ventilation mode/level",
      info: {},
      bitoffs: "8",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "no action"
        }, {
          value: "1",
          description: "select next operation mode (edge-trigger)"
        }, {
          value: "2",
          description: "select previous operation mode (edge-trigger)"
        }, {
          value: "3",
          description: "Reserved"
        }]
      }
    }, {
      data: "Heat Exchanger Bypass Control",
      shortcut: "HBC",
      description: "Manual override of automatic heat exchanger bypass control",
      info: {},
      bitoffs: "10",
      bitsize: "2",
      enum: {
        item: [{
          value: "0",
          description: "no action"
        }, {
          value: "1",
          description: "close bypass (edge-trigger)"
        }, {
          value: "2",
          description: "open bypass (edge-trigger)"
        }, {
          value: "3",
          description: "Reserved"
        }]
      }
    }, {
      data: "Timer Operation Mode Control",
      shortcut: "TOMC",
      description: "Enables Timer Operation Mode, i.e. a particular ventilation mode\n                is activated for a defined time",
      info: {},
      bitoffs: "16",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "no action"
        }, {
          value: "1",
          description: "start timer operation mode (edge-trigger)"
        }]
      }
    }, {
      data: "CO2 Threshold",
      shortcut: "COT",
      description: "Overrides CO2 threshold for CO2 control in automatic mode",
      info: {},
      bitoffs: "17",
      bitsize: "7",
      enum: {
        item: [{
          min: "0",
          max: "100",
          description: "0...100 %"
        }, {
          min: "101",
          max: "126",
          description: "Reserved"
        }, {
          value: "127",
          description: "Default (use threshold configured in device)"
        }]
      }
    }, {
      data: "Humidity Threshold",
      shortcut: "HT",
      description: "Overrides humidity threshold for humidity control in automatic mode",
      info: {},
      bitoffs: "25",
      bitsize: "7",
      enum: {
        item: [{
          min: "0",
          max: "100",
          description: "0...100 %"
        }, {
          min: "101",
          max: "126",
          description: "Reserved"
        }, {
          value: "127",
          description: "Default (use threshold configured in device)"
        }]
      }
    }, {
      data: "Air Quality Threshold",
      shortcut: "AQT",
      description: "Overrides air quality threshold for air quality control in automatic mode",
      info: {},
      bitoffs: "33",
      bitsize: "7",
      enum: {
        item: [{
          min: "0",
          max: "100",
          description: "0...100 %"
        }, {
          min: "101",
          max: "126",
          description: "Reserved"
        }, {
          value: "127",
          description: "Default (use threshold configured in device)"
        }]
      }
    }, {
      data: "Room temperature threshold",
      shortcut: "RTT",
      description: "Overrides room temperature threshold for room temperature control mode",
      info: {},
      bitoffs: "41",
      bitsize: "7",
      enum: {
        item: [{
          min: "-63",
          max: "63",
          scale: {
            min: "-63",
            max: "63"
          },
          unit: "\xB0C"
        }, {
          value: "-64",
          description: "Default (use threshold configured in device)"
        }]
      }
    }]
  }, {
    title: "Telegram Definition: \u2018Ventilation Basic Status Message\u2019",
    description: "The \u2018Ventilation Basic Status Message\u2019 provides current sensor values\n                and  internal control status information. It is triggered once at\n                power-on and on particular value changes.<br/>\n                Additionally this message is available on request.\n                <br/>\n                <br/>Direction: Heat-recovery ventilation unit --> Gateway\n                <br/>\n                <img>graphics/D2-50-ZZ-No003.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: 0,
        bitsize: 3,
        value: 2
      }
    },
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "3",
      bitsize: "1"
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "8",
      bitsize: "4"
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines the message type",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Ventilation remote transmission request"
        }, {
          value: "1",
          description: "Ventilation control"
        }, {
          value: "2",
          description: "Ventilation basic status"
        }, {
          value: "3",
          description: "Ventilation extended status"
        }, {
          value: "4",
          description: "Reserved"
        }, {
          value: "5",
          description: "Reserved"
        }, {
          value: "6",
          description: "Reserved"
        }, {
          value: "7",
          description: "Reserved"
        }]
      }
    }, {
      data: "Operation Mode Status",
      shortcut: "OMS",
      description: "Shows current Operation Mode Status",
      info: {},
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: [{
          value: "0",
          description: "Off"
        }, {
          value: "1",
          description: "Level 1"
        }, {
          value: "2",
          description: "Level 2"
        }, {
          value: "3",
          description: "Level 3"
        }, {
          value: "4",
          description: "Level 4"
        }, {
          value: "5",
          description: "Reserved"
        }, {
          value: "6",
          description: "Reserved"
        }, {
          value: "7",
          description: "Reserved"
        }, {
          value: "8",
          description: "Reserved"
        }, {
          value: "9",
          description: "Reserved"
        }, {
          value: "10",
          description: "Reserved"
        }, {
          value: "11",
          description: "Automatic"
        }, {
          value: "12",
          description: "Automatic on demand"
        }, {
          value: "13",
          description: "Supply air only"
        }, {
          value: "14",
          description: "Exhaust air only"
        }, {
          value: "15",
          description: "Reserved"
        }]
      }
    }, {
      data: "Safety Mode Status",
      shortcut: "SMS",
      description: "Indicates if device is running in fireplace safety mode",
      info: {},
      bitoffs: "12",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "fireplace safety mode disabled"
        }, {
          value: "1",
          description: "fireplace safety mode enabled"
        }]
      }
    }, {
      data: "Heat Exchanger Bypass Status",
      shortcut: "HBS",
      description: "Indicates heat exchanger bypass status",
      info: {},
      bitoffs: "13",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "bypass closed (heatrecovery active)"
        }, {
          value: "1",
          description: "bypass opened (heatrecovery inactive)"
        }]
      }
    }, {
      data: "Supply Air Flap Position",
      shortcut: "SFP",
      description: "Supply Air Flap Position",
      info: {},
      bitoffs: "14",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "supply air flap closed"
        }, {
          value: "1",
          description: "supply air flap opened"
        }]
      }
    }, {
      data: "Exhaust Air Flap Position",
      shortcut: "EFP",
      description: "Exhaust Air Flap Position",
      info: {},
      bitoffs: "15",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "exhaust air flap closed"
        }, {
          value: "1",
          description: "exhaust air flap opened"
        }]
      }
    }, {
      data: "Defrost Mode Status",
      shortcut: "DMS",
      description: "Indicates if device is running in defrost mode, i.e.\n                automatic defrosting of heat exchanger is active",
      info: {},
      bitoffs: "16",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "defrost mode inactive"
        }, {
          value: "1",
          description: "defrost mode active"
        }]
      }
    }, {
      data: "Cooling Protection Status",
      shortcut: "CPS",
      description: "Indicates if device is running in cooling protection",
      info: {},
      bitoffs: "17",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "cooling protection mode inactive"
        }, {
          value: "1",
          description: "cooling protection mode active"
        }]
      }
    }, {
      data: "Outdoor Air Heater Status",
      shortcut: "OHS",
      description: "Outdoor Air Heater Status",
      info: {},
      bitoffs: "18",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "inactive"
        }, {
          value: "1",
          description: "active"
        }]
      }
    }, {
      data: "Supply Air Heater Status",
      shortcut: "SHS",
      description: "Supply Air Heater Status",
      info: {},
      bitoffs: "19",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "inactive"
        }, {
          value: "1",
          description: "active"
        }]
      }
    }, {
      data: "Drain Heater Status",
      shortcut: "DHS",
      description: "Drain Heater Status",
      info: {},
      bitoffs: "20",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "inactive"
        }, {
          value: "1",
          description: "active"
        }]
      }
    }, {
      data: "Timer Operation Mode Status",
      shortcut: "TOMS",
      description: "Indicates timer operation mode status",
      info: {},
      bitoffs: "21",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "timer operation mode inactive"
        }, {
          value: "1",
          description: "timer operation mode active"
        }]
      }
    }, {
      data: "Filter Maintenance Status",
      shortcut: "FMS",
      description: "Filter Maintenance Status",
      info: {},
      bitoffs: "22",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Maintenance not required"
        }, {
          value: "1",
          description: "Maintenance required"
        }]
      }
    }, {
      data: "Weekly Timer Program Status",
      shortcut: "WTPS",
      description: "Indicates if weekly timer program is active\n                (i.e. if device is running according to configured program)",
      info: {},
      bitoffs: "23",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "weekly timer program disabled or not configured"
        }, {
          value: "1",
          description: "weekly timer program active"
        }]
      }
    }, {
      data: "Room Temperature Control Status",
      shortcut: "RTCS",
      description: "Indicates room temperature control status",
      info: {},
      bitoffs: "24",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "room temperature control inactive"
        }, {
          value: "1",
          description: "room temperature control active"
        }]
      }
    }, {
      data: "Air Quality Sensor 1",
      shortcut: "AQS1",
      description: "Current air quality sensor 1 measurement value",
      info: {},
      bitoffs: "25",
      bitsize: "7",
      enum: {
        item: [{
          min: "0",
          max: "100",
          description: "0...100 %"
        }, {
          min: "101",
          max: "126",
          description: "Reserved"
        }, {
          value: "127",
          description: "not available"
        }]
      }
    }, {
      data: "Master/Slave Configuration Status",
      shortcut: "MSS",
      description: "Indicates whether device is configured as master or slave unit",
      info: {},
      bitoffs: "32",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "Master"
        }, {
          value: "1",
          description: "Slave"
        }]
      }
    }, {
      data: "Air Quality Sensor 2",
      shortcut: "AQS2",
      description: "Current air quality sensor 2 measurement value",
      info: {},
      bitoffs: "33",
      bitsize: "7",
      enum: {
        item: [{
          min: "0",
          max: "100",
          description: "0...100 %"
        }, {
          min: "101",
          max: "126",
          description: "Reserved"
        }, {
          value: "127",
          description: "not available"
        }]
      }
    }, {
      data: "Outdoor Air Temperature",
      shortcut: "OUTT",
      description: "Current outdoor air temperature",
      info: {},
      bitoffs: "40",
      bitsize: "7",
      range: {
        min: "0",
        max: "127"
      },
      scale: {
        min: "-64",
        max: "63"
      },
      unit: "\xB0C"
    }, {
      data: "Supply Air Temperature",
      shortcut: "SPLYT",
      description: "Current supply air temperature",
      info: {},
      bitoffs: "47",
      bitsize: "7",
      range: {
        min: "0",
        max: "127"
      },
      scale: {
        min: "-64",
        max: "63"
      },
      unit: "\xB0C"
    }, {
      data: "Indoor Air Temperature",
      shortcut: "INT",
      description: "Current indoor air temperature",
      info: {},
      bitoffs: "54",
      bitsize: "7",
      range: {
        min: "0",
        max: "127"
      },
      scale: {
        min: "-64",
        max: "63"
      },
      unit: "\xB0C"
    }, {
      data: "Exhaust Air Temperature",
      shortcut: "EXHT",
      description: "Current exhaust air temperature",
      info: {},
      bitoffs: "61",
      bitsize: "7",
      range: {
        min: "0",
        max: "127"
      },
      scale: {
        min: "-64",
        max: "63"
      },
      unit: "\xB0C"
    }, {
      data: "Supply Air Fan Air Flow Rate",
      shortcut: "SPLYFF",
      description: "Current supply air fan air flow rate setpoint",
      info: {},
      bitoffs: "68",
      bitsize: "10",
      range: {
        min: "0",
        max: "1023"
      },
      scale: {
        min: "0",
        max: "1023"
      },
      unit: "m3/h"
    }, {
      data: "Exhaust Air Fan Air Flow Rate",
      shortcut: "EXHFF",
      description: "Current exhaust air fan air flow rate setpoint",
      info: {},
      bitoffs: "78",
      bitsize: "10",
      range: {
        min: "0",
        max: "1023"
      },
      scale: {
        min: "0",
        max: "1023"
      },
      unit: "m3/h"
    }, {
      data: "Supply Fan Speed",
      shortcut: "SPLYFS",
      description: "Current supply air fan speed",
      info: {},
      bitoffs: "88",
      bitsize: "12",
      range: {
        min: "0",
        max: "4095"
      },
      scale: {
        min: "0",
        max: "4095"
      },
      unit: "1/min"
    }, {
      data: "Exhaust Fan Speed",
      shortcut: "EXHFS",
      description: "Current exhaust air fan speed",
      info: {},
      bitoffs: "100",
      bitsize: "12",
      range: {
        min: "0",
        max: "4095"
      },
      scale: {
        min: "0",
        max: "4095"
      },
      unit: "1/min"
    }]
  }, {
    title: "Telegram Definition: \u2018Ventilation Extended Status Message\u2019",
    description: "The \u2018Ventilation Extended Status Message\u2019 provides additional\n                information, e.g. active failure information.\n                It is triggered once at power-on and on particular value changes.\n                <br/>Additionally this message is available on request.\n                <br/>\n                <br/>Direction: Heat-recovery ventilation unit --> Gateway\n                <br/>\n                <img>graphics/D2-50-ZZ-No004.png</img>\n                <br/>",
    condition: {
      datafield: {
        bitoffs: 0,
        bitsize: 3,
        value: 3
      }
    },
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "3",
      bitsize: "1"
    }, {
      data: "Message Type",
      shortcut: "MT",
      description: "Defines the message type",
      info: {},
      bitoffs: "0",
      bitsize: "3",
      enum: {
        item: [{
          value: "0",
          description: "Ventilation remote transmission request"
        }, {
          value: "1",
          description: "Ventilation control"
        }, {
          value: "2",
          description: "Ventilation basic status"
        }, {
          value: "3",
          description: "Ventilation extended status"
        }, {
          value: "4",
          description: "Reserved"
        }, {
          value: "5",
          description: "Reserved"
        }, {
          value: "6",
          description: "Reserved"
        }, {
          value: "7",
          description: "Reserved"
        }]
      }
    }, {
      data: "Software Version Info",
      shortcut: "SVI",
      description: "Shows Software Version Information",
      info: {},
      bitoffs: "4",
      bitsize: "12",
      range: {
        min: "0",
        max: "4095"
      },
      scale: {
        min: "0",
        max: "4095"
      },
      unit: "-"
    }, {
      data: "Operation Hours Counter",
      shortcut: "OHC",
      description: "Indicates device operation hours",
      info: {},
      bitoffs: "16",
      bitsize: "16",
      range: {
        min: "0",
        max: "196605"
      },
      scale: {
        min: "0",
        max: "589815"
      },
      unit: "h"
    }, {
      data: "Digital Input 0...15 Status",
      shortcut: "DIS",
      description: "Indicates the current state of digital inputs 0...15 of the device\n                <br/><br/>\n                input assignment depends on device variant and configuration",
      info: {},
      bitoffs: "32",
      bitsize: "16",
      enum: {
        item: [{
          value: "0x0001",
          description: "input no. 00 active"
        }, {
          value: "0x0002",
          description: "input no. 01 active"
        }, {
          value: "0x0004",
          description: "input no. 02 active"
        }, {
          value: "0x0008",
          description: "input no. 03 active"
        }, {
          value: "0x0010",
          description: "input no. 04 active"
        }, {
          value: "0x0020",
          description: "input no. 05 active"
        }, {
          value: "0x0040",
          description: "input no. 06 active"
        }, {
          value: "0x0080",
          description: "input no. 07 active"
        }, {
          value: "0x0100",
          description: "input no. 08 active"
        }, {
          value: "0x0200",
          description: "input no. 09 active"
        }, {
          value: "0x0400",
          description: "input no. 10 active"
        }, {
          value: "0x0800",
          description: "input no. 11 active"
        }, {
          value: "0x1000",
          description: "input no. 12 active"
        }, {
          value: "0x2000",
          description: "input no. 13 active"
        }, {
          value: "0x4000",
          description: "input no. 14 active"
        }, {
          value: "0x8000",
          description: "input no. 15 active"
        }]
      }
    }, {
      data: "Digital Output 0...15 Status",
      shortcut: "DOS",
      description: "Indicates the current state of digital outputs 0...15 of the device\n                  <br/>\n                  <br/>output assignment depends on device variant and configuration",
      info: {},
      bitoffs: "48",
      bitsize: "16",
      enum: {
        item: [{
          value: "0x0001",
          description: "output no. 00 active"
        }, {
          value: "0x0002",
          description: "output no. 01 active"
        }, {
          value: "0x0004",
          description: "output no. 02 active"
        }, {
          value: "0x0008",
          description: "output no. 03 active"
        }, {
          value: "0x0010",
          description: "output no. 04 active"
        }, {
          value: "0x0020",
          description: "output no. 05 active"
        }, {
          value: "0x0040",
          description: "output no. 06 active"
        }, {
          value: "0x0080",
          description: "output no. 07 active"
        }, {
          value: "0x0100",
          description: "output no. 08 active"
        }, {
          value: "0x0200",
          description: "output no. 09 active"
        }, {
          value: "0x0400",
          description: "output no. 10 active"
        }, {
          value: "0x0800",
          description: "output no. 11 active"
        }, {
          value: "0x1000",
          description: "output no. 12 active"
        }, {
          value: "0x2000",
          description: "output no. 13 active"
        }, {
          value: "0x4000",
          description: "output no. 14 active"
        }, {
          value: "0x8000",
          description: "output no. 15 active"
        }]
      }
    }, {
      data: "Info Message 0...15 Status",
      shortcut: "IMS",
      description: "Indicates the current state of info message no. 0...15\n                generated by the device",
      info: {},
      bitoffs: "64",
      bitsize: "16",
      enum: {
        item: [{
          value: "0x0001",
          description: "info no. 00 active"
        }, {
          value: "0x0002",
          description: "info no. 01 active"
        }, {
          value: "0x0004",
          description: "info no. 02 active"
        }, {
          value: "0x0008",
          description: "info no. 03 active"
        }, {
          value: "0x0010",
          description: "info no. 04 active"
        }, {
          value: "0x0020",
          description: "info no. 05 active"
        }, {
          value: "0x0040",
          description: "info no. 06 active"
        }, {
          value: "0x0080",
          description: "info no. 07 active"
        }, {
          value: "0x0100",
          description: "info no. 08 active"
        }, {
          value: "0x0200",
          description: "info no. 09 active"
        }, {
          value: "0x0400",
          description: "info no. 10 active"
        }, {
          value: "0x0800",
          description: "info no. 11 active"
        }, {
          value: "0x1000",
          description: "info no. 12 active"
        }, {
          value: "0x2000",
          description: "info no. 13 active"
        }, {
          value: "0x4000",
          description: "info no. 14 active"
        }, {
          value: "0x8000",
          description: "info no. 15 active"
        }]
      }
    }, {
      data: "Fault 0...31 Status",
      shortcut: "FS",
      description: "Indicates the current state of fault no. 0...31 generated\n                by the device",
      info: {},
      bitoffs: "80",
      bitsize: "32",
      enum: {
        item: [{
          value: "0x00000001",
          description: "fault no. 00 active"
        }, {
          value: "0x00000002",
          description: "fault no. 01 active"
        }, {
          value: "0x00000004",
          description: "fault no. 02 active"
        }, {
          value: "0x00000008",
          description: "fault no. 03 active"
        }, {
          value: "0x00000010",
          description: "fault no. 04 active"
        }, {
          value: "0x00000020",
          description: "fault no. 05 active"
        }, {
          value: "0x00000040",
          description: "fault no. 06 active"
        }, {
          value: "0x00000080",
          description: "fault no. 07 active"
        }, {
          value: "0x00000100",
          description: "fault no. 08 active"
        }, {
          value: "0x00000200",
          description: "fault no. 09 active"
        }, {
          value: "0x00000400",
          description: "fault no. 10 active"
        }, {
          value: "0x00000800",
          description: "fault no. 11 active"
        }, {
          value: "0x00001000",
          description: "fault no. 12 active"
        }, {
          value: "0x00002000",
          description: "fault no. 13 active"
        }, {
          value: "0x00004000",
          description: "fault no. 14 active"
        }, {
          value: "0x00008000",
          description: "fault no. 15 active"
        }, {
          value: "0x00010000",
          description: "fault no. 16 active"
        }, {
          value: "0x00020000",
          description: "fault no. 17 active"
        }, {
          value: "0x00040000",
          description: "fault no. 18 active"
        }, {
          value: "0x00080000",
          description: "fault no. 19 active"
        }, {
          value: "0x00100000",
          description: "fault no. 20 active"
        }, {
          value: "0x00200000",
          description: "fault no. 21 active"
        }, {
          value: "0x00400000",
          description: "fault no. 22 active"
        }, {
          value: "0x00800000",
          description: "fault no. 23 active"
        }, {
          value: "0x01000000",
          description: "fault no. 24 active"
        }, {
          value: "0x02000000",
          description: "fault no. 25 active"
        }, {
          value: "0x04000000",
          description: "fault no. 26 active"
        }, {
          value: "0x08000000",
          description: "fault no. 27 active"
        }, {
          value: "0x10000000",
          description: "fault no. 28 active"
        }, {
          value: "0x20000000",
          description: "fault no. 29 active"
        }, {
          value: "0x40000000",
          description: "fault no. 30 active"
        }, {
          value: "0x80000000",
          description: "fault no. 31 active"
        }]
      }
    }]
  }],
  originalIndex: 211,
  eep: "d2-50-00",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Heat Recovery Ventilation",
  func_number: "0x50",
  submitter: [
    "Glen Dimplex"
  ]
};

// ../eep-transcoder/eep/d2-50-01.js
var d25001 = {
  $t: "",
  number: "0x01",
  title: "Type 0x01 (description: see table)",
  status: "released",
  description: "",
  ref: "d2-50-00",
  originalIndex: 212,
  eep: "d2-50-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Heat Recovery Ventilation",
  func_number: "0x50",
  submitter: []
};

// ../eep-transcoder/eep/d2-a0-01.js
var d2a001 = {
  number: "0x01",
  title: "Valve Control",
  status: "released",
  description: '\n              <br/><br/>\n              Description:<br/>\n              Radio operated valve control with feedback message.\n              Valve is controlled through the air interface to be opened or closed.\n              The valve reports the actual status after finishing the determined operation.\n              <br/><br/>\n              <span style="border-bottom:2px groove #000000;">Data exchange</span>\n              <br/>\n              Direction: bidirectional<br/>\n              Addressing: addressed (inbound) and broadcast (outbound)<br/>\n              Communication trigger: event- & time-triggered<br/>\n              Trigger event: position of valve has changed<br/>\n              Teach-in method: UTE\n              <br/><br/>\n              DIRECTION-1 = Outbound (water valve to the controller)\n              <br/>\n              Description: Valve reports its status. Report is sent after operation was executed or as a heartbeat.\n              <br/><br/>\n              DIRECTION-2 = Inbound (controller to the water valve)\n              <br/>\n              Description: Operational command to the valve.\n              After this request a feedback response will be transmitted,\n              once the operation is finished.\n              <br/>\n              A \u201Cno change\u201D-command will also be followed by a feedback response.\n              Therefore, it can be used as a status request.',
  case: [{
    direction: "1",
    condition: {
      direction: "1"
    },
    datafield: [{
      data: "Feedback",
      shortcut: "FDB",
      description: "Return",
      info: "Feedback",
      bitoffs: "6",
      bitsize: "2",
      enum: {
        item: [{
          value: "0b00",
          description: "Not defined"
        }, {
          value: "0b01",
          description: "Closed"
        }, {
          value: "0b10",
          description: "Opened"
        }, {
          value: "0b11",
          description: "Not defined"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "0",
      bitsize: "6"
    }]
  }, {
    direction: "2",
    condition: {
      direction: "2"
    },
    datafield: [{
      data: "Request",
      shortcut: "REQ",
      description: "Request to operate the valve",
      info: "Request",
      bitoffs: "6",
      bitsize: "2",
      enum: {
        item: [{
          value: "0b00",
          description: "No change (request of feedback)"
        }, {
          value: "0b01",
          description: "Request to close valve"
        }, {
          value: "0b10",
          description: "Request to open valve"
        }, {
          value: "0b11",
          description: "Request to close valve"
        }]
      }
    }, {
      reserved: {},
      bitoffs: "0",
      bitsize: "6"
    }]
  }],
  originalIndex: 213,
  eep: "d2-a0-01",
  rorg_title: "VLD Telegram",
  rorg_number: "0xD2",
  func_title: "Standard Valve",
  func_number: "0xA0",
  submitter: [
    "Afriso",
    "EnOcean"
  ]
};

// ../eep-transcoder/eep/d5-00-01.js
var d50001 = {
  number: "0x01",
  title: "Single Input Contact",
  status: "released",
  case: [{
    datafield: [{
      data: "Contact",
      shortcut: "CO",
      description: {},
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "open"
        }, {
          value: "1",
          description: "closed"
        }]
      }
    }, {
      data: "Learn Button",
      shortcut: "LRN",
      description: "..",
      bitoffs: "4",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "pressed"
        }, {
          value: "1",
          description: "not pressed"
        }]
      }
    }]
  }],
  originalIndex: 12,
  eep: "d5-00-01",
  rorg_title: "1BS Telegram",
  rorg_number: "0xD5",
  func_title: "Contacts and Switches",
  func_number: "0x00",
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/f6-01-01.js
var f60101 = {
  number: "0x01",
  title: "Push Button",
  status: "released",
  case: [{
    datafield: [{
      data: "Push Button",
      shortcut: "PB",
      description: "status of the push button",
      bitoffs: "3",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "released"
        }, {
          value: "1",
          description: "pressed and hold"
        }]
      }
    }]
  }],
  eep: "f6-01-01",
  rorg_title: "RPS Telegram",
  rorg_number: "0xf6",
  func_title: "Switches Buttons",
  func_number: 0,
  description: "",
  submitter: []
};

// ../eep-transcoder/eep/f6-02-01.js
var f60201 = {
  number: "0x01",
  title: "Light and Blind Control - Application Style 1",
  status: "released",
  description: "This EEP definition is based on the assumption that a RPS switch module (e.g. PTM200) is installed in a 0-STATE up position! Application Style 1 is widely used in EU but may be found in other markets as well.",
  case: [
    {
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "1"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "1"
        }
      ],
      datafield: [
        {
          data: "Rocker 1st action",
          shortcut: "R1",
          description: "....",
          bitoffs: "0",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: 'Button AI: "Switch light on" or "Dim light down" or "Move blind closed"'
              },
              {
                value: "1",
                description: 'Button A0: "Switch light off" or "Dim light up" or "Move blind open"'
              },
              {
                value: "2",
                description: 'Button BI: "Switch light on" or "Dim light down" or "Move blind closed\u201D'
              },
              {
                value: "3",
                description: 'Button B0: "Switch light off" or "Dim light up" or "Move blind open"'
              }
            ]
          }
        },
        {
          data: "Energy Bow",
          shortcut: "EB",
          description: "....",
          bitoffs: "3",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "released"
              },
              {
                value: "1",
                description: "pressed"
              }
            ]
          }
        },
        {
          data: "Rocker 2nd action",
          shortcut: "R2",
          description: "....",
          bitoffs: "4",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: 'Button AI: <br/> "Switch light on" or "Dim light down" or "Move blind closed"'
              },
              {
                value: "1",
                description: 'Button A0: <br/> "Switch light off" or "Dim light up" or "Move blind open"'
              },
              {
                value: "2",
                description: 'Button BI: <br/>\u201CSwitch light on\u201D or "Dim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "3",
                description: 'Button B0: <br/>\u201CSwitch light off\u201D or \u201CDim light up\u201D or "Move blind open\u201D'
              }
            ]
          }
        },
        {
          data: "2nd Action",
          shortcut: "SA",
          description: "....",
          bitoffs: "7",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "No 2nd action"
              },
              {
                value: "1",
                description: "2nd action valid"
              }
            ]
          }
        }
      ]
    },
    {
      condition: {
        statusfield: [
          {
            bitoffs: "2",
            bitsize: "1",
            value: "1"
          },
          {
            bitoffs: "3",
            bitsize: "1",
            value: "0"
          }
        ]
      },
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "1"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "0"
        }
      ],
      datafield: [
        {
          data: "Number of buttons pressed simultaneously (other bit combinations are not valid)",
          shortcut: "R1",
          description: "....",
          bitoffs: "0",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: "no button"
              },
              {
                value: "3",
                description: "3 or 4 buttons"
              }
            ]
          }
        },
        {
          data: "Energy Bow",
          shortcut: "EB",
          description: "....",
          bitoffs: "3",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "released"
              },
              {
                value: "1",
                description: "pressed"
              }
            ]
          }
        },
        {
          reserved: {},
          data: {},
          shortcut: {},
          description: {},
          bitoffs: "4",
          bitsize: "4"
        }
      ]
    }
  ],
  originalIndex: 1,
  eep: "f6-02-01",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Rocker Switch, 2 Rocker",
  func_number: "0x02",
  submitter: [],
  icon: "Switch_Style1.svg"
};

// ../eep-transcoder/eep/f6-02-02.js
var f60202 = {
  number: "0x02",
  title: "Light and Blind Control - Application Style 2",
  status: "released",
  description: "This EEP definition is based on the assumption that a RPS switch module (e.g. PTM200) is\n                installed in an I-STATE up position!\n                Application Style 2 is typically used in US and CAN but may be found in other markets as well.",
  case: [
    {
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "1"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "1"
        }
      ],
      datafield: [
        {
          data: "Rocker 1st action",
          shortcut: "R1",
          description: "....",
          bitoffs: "0",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: 'Button AI: <br/> "Switch light on" or "Dim light up" or "Move blind open"'
              },
              {
                value: "1",
                description: 'Button A0: <br/> "switch light off" or "Dim light down" or "Move blind closed"'
              },
              {
                value: "2",
                description: 'Button BI: <br/>\u201CSwitch light on\u201D or "Dim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "3",
                description: 'Button B0: <br/>\u201CSwitch light off\u201D or \u201CDim light down\u201D or "Move blind closed\u201D'
              }
            ]
          }
        },
        {
          data: "Energy Bow",
          shortcut: "EB",
          description: "....",
          bitoffs: "3",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "released"
              },
              {
                value: "1",
                description: "pressed"
              }
            ]
          }
        },
        {
          data: "Rocker 2nd action",
          shortcut: "R2",
          description: "....",
          bitoffs: "4",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: 'Button AI: <br/> "Switch light on" or "Dim light up" or "Move blind open"'
              },
              {
                value: "1",
                description: 'Button A0: <br/> "switch light off" or "Dim light down" or "Move blind closed"'
              },
              {
                value: "2",
                description: 'Button BI: <br/>\u201CSwitch light on\u201D or "Dim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "3",
                description: 'Button B0: <br/>\u201CSwitch light off\u201D or \u201CDim light down\u201D or "Move blind closed\u201D'
              }
            ]
          }
        },
        {
          data: "2nd Action",
          shortcut: "SA",
          description: "....",
          bitoffs: "7",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "No 2nd action"
              },
              {
                value: "1",
                description: "2nd action valid"
              }
            ]
          }
        }
      ]
    },
    {
      condition: {
        statusfield: [
          {
            bitoffs: "2",
            bitsize: "1",
            value: "1"
          },
          {
            bitoffs: "3",
            bitsize: "1",
            value: "0"
          }
        ]
      },
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "1"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "0"
        }
      ],
      datafield: [
        {
          data: "Number of buttons pressed simultaneously (other bit combinations are not valid)",
          shortcut: "R1",
          description: "....",
          bitoffs: "0",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: "no button"
              },
              {
                value: "3",
                description: "3 or 4 buttons"
              }
            ]
          }
        },
        {
          data: "Energy Bow",
          shortcut: "EB",
          description: "....",
          bitoffs: "3",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "released"
              },
              {
                value: "1",
                description: "pressed"
              }
            ]
          }
        },
        {
          reserved: {},
          data: {},
          shortcut: {},
          description: {},
          bitoffs: "4",
          bitsize: "4"
        }
      ]
    }
  ],
  originalIndex: 2,
  eep: "f6-02-02",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Rocker Switch, 2 Rocker",
  func_number: "0x02",
  submitter: [],
  icon: "Switch_Style2.svg"
};

// ../eep-transcoder/eep/f6-02-03.js
var f60203 = {
  number: "0x03",
  title: "Light Control - Application Style 1",
  status: "released",
  description: "\n              <br/>\n              <br/>\n              Definition of Auto, I/O for Rocker switch, Dim control (PTM200)",
  case: [
    {
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "1"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "1"
        }
      ],
      datafield: [
        {
          data: "Rocker action",
          shortcut: "RA",
          description: "....",
          bitoffs: "0",
          bitsize: "8",
          enum: {
            item: [
              {
                value: 0,
                description: "released"
              },
              {
                value: 48,
                description: "Button A0 pressed"
              },
              {
                value: 16,
                description: "Button A1 pressed"
              },
              {
                value: 112,
                description: "Button B0 pressed"
              },
              {
                value: 80,
                description: "Button B1 pressed"
              }
            ]
          }
        }
      ]
    }
  ],
  originalIndex: 3,
  eep: "f6-02-03",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Rocker Switch, 2 Rocker",
  func_number: "0x02",
  submitter: ["Servodan"],
  icon: "Switch_Style1.svg"
};

// ../eep-transcoder/eep/f6-02-04.js
var f60204 = {
  number: "0x04",
  title: "Light and blind control ERP2",
  status: "released",
  description: "",
  case: [{
    datafield: [{
      data: "Energy Bow",
      shortcut: "EBO",
      description: "State of the energy bow",
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "released"
        }, {
          value: "1",
          description: "pressed"
        }]
      }
    }, {
      data: "Button coding",
      shortcut: "BC",
      description: "Signalize button coding",
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "button"
        }]
      }
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "2",
      bitsize: "2"
    }, {
      data: "BI",
      shortcut: "RBI",
      description: "State I of the rocker B",
      bitoffs: "4",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not pressed"
        }, {
          value: "1",
          description: "pressed"
        }]
      }
    }, {
      data: "B0",
      shortcut: "RB0",
      description: "State 0 of the rocker B",
      bitoffs: "5",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not pressed"
        }, {
          value: "1",
          description: "pressed"
        }]
      }
    }, {
      data: "AI",
      shortcut: "RAI",
      description: "State I of the rocker A",
      bitoffs: "6",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not pressed"
        }, {
          value: "1",
          description: "pressed"
        }]
      }
    }, {
      data: "A0",
      shortcut: "RA0",
      description: "State 0 of the rocker A",
      bitoffs: "7",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "not pressed"
        }, {
          value: "1",
          description: "pressed"
        }]
      }
    }]
  }],
  originalIndex: 4,
  eep: "f6-02-04",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Rocker Switch, 2 Rocker",
  func_number: "0x02",
  submitter: [
    "EnOcean GmbH"
  ],
  icon: "Switch.svg"
};

// ../eep-transcoder/eep/f6-03-01.js
var f60301 = {
  number: "0x01",
  title: "Light and Blind Control - Application Style 1",
  status: "released",
  description: "This EEP definition is based on the assumption that a RPS switch module is installed in a\n              0-STATE up position!\n              Application Style 1 is widely used in EU but may be found in other markets as well.",
  case: [
    {
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "0"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "1"
        }
      ],
      datafield: [
        {
          data: "Rocker 1st action",
          shortcut: "R1",
          description: "....",
          bitoffs: "0",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: 'Button AI: <br/> "Switch light on" or "Dim light down" or "Move blind closed"'
              },
              {
                value: "1",
                description: 'Button A0: <br/> "Switch light off" or "Dim light up" or "Move blind open"'
              },
              {
                value: "2",
                description: 'Button BI: <br/>\u201CSwitch light on\u201D or "Dim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "3",
                description: 'Button B0: <br/>\u201CSwitch light off\u201D or \u201CDim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "4",
                description: 'Button CI: <br/> "Switch light on" or "Dim light down" or "Move blind closed"'
              },
              {
                value: "5",
                description: 'Button C0: <br/> "Switch light off" or "Dim light up" or "Move blind open"'
              },
              {
                value: "6",
                description: 'Button DI: <br/>\u201CSwitch light on\u201D or "Dim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "7",
                description: 'Button D0: <br/>\u201CSwitch light off\u201D or \u201CDim light up\u201D or "Move blind open\u201D'
              }
            ]
          }
        },
        {
          data: "Energy Bow",
          shortcut: "EB",
          description: "....",
          bitoffs: "3",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "released"
              },
              {
                value: "1",
                description: "pressed"
              }
            ]
          }
        },
        {
          data: "Rocker 2nd action",
          shortcut: "R2",
          description: "....",
          bitoffs: "4",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: 'Button AI: <br/> "Switch light on" or "Dim light down" or "Move blind closed"'
              },
              {
                value: "1",
                description: 'Button A0: <br/> "Switch light off" or "Dim light up" or "Move blind open"'
              },
              {
                value: "2",
                description: 'Button BI: <br/>\u201CSwitch light on\u201D or "Dim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "3",
                description: 'Button B0: <br/>\u201CSwitch light off\u201D or \u201CDim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "4",
                description: 'Button CI: <br/> "Switch light on" or "Dim light down" or "Move blind closed"'
              },
              {
                value: "5",
                description: 'Button C0: <br/> "Switch light off" or "Dim light up" or "Move blind open"'
              },
              {
                value: "6",
                description: 'Button DI: <br/>\u201CSwitch light on\u201D or "Dim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "7",
                description: 'Button D0: <br/>\u201CSwitch light off\u201D or \u201CDim light up\u201D or "Move blind open\u201D'
              }
            ]
          }
        },
        {
          data: "2nd Action",
          shortcut: "SA",
          description: "....",
          bitoffs: "7",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "No 2nd action"
              },
              {
                value: "1",
                description: "2nd action valid"
              }
            ]
          }
        }
      ]
    },
    {
      condition: {
        statusfield: [
          {
            bitoffs: "2",
            bitsize: "1",
            value: "0"
          },
          {
            bitoffs: "3",
            bitsize: "1",
            value: "0"
          }
        ]
      },
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "0"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "0"
        }
      ],
      datafield: [
        {
          data: "Number of buttons pressed simultaneously",
          shortcut: "R1",
          description: "....",
          bitoffs: "0",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: "no Button pressed"
              },
              {
                value: "1",
                description: "2 buttons pressed"
              },
              {
                value: "2",
                description: "3 buttons pressed"
              },
              {
                value: "3",
                description: "4 buttons pressed"
              },
              {
                value: "4",
                description: "5 buttons pressed"
              },
              {
                value: "5",
                description: "6 buttons pressed"
              },
              {
                value: "6",
                description: "7 buttons pressed"
              },
              {
                value: "7",
                description: "8 buttons pressed"
              }
            ]
          }
        },
        {
          data: "Energy Bow",
          shortcut: "EB",
          description: "....",
          bitoffs: "3",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "released"
              },
              {
                value: "1",
                description: "pressed"
              }
            ]
          }
        },
        {
          reserved: {},
          data: {},
          shortcut: {},
          description: {},
          bitoffs: "4",
          bitsize: "4"
        }
      ]
    }
  ],
  originalIndex: 5,
  eep: "f6-03-01",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Rocker Switch, 4 Rocker",
  func_number: "0x03",
  submitter: [],
  icon: "Switch_Style1.svg"
};

// ../eep-transcoder/eep/f6-03-02.js
var f60302 = {
  number: "0x02",
  title: "Light and Blind Control - Application Style 2",
  status: "released",
  description: "This EEP definition is based on the assumption that a RPS switch module is installed in a I-STATE up position!\nApplication Style 2 is typically used in US and CAN but may be found in other markets as well.",
  case: [
    {
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "0"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "1"
        }
      ],
      datafield: [
        {
          data: "Rocker 1st action",
          shortcut: "R1",
          description: "....",
          bitoffs: "0",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: 'Button AI: <br/> \u201CSwitch light on\u201D or "Dim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "1",
                description: 'Button A0: <br/> \u201CSwitch light off\u201D or \u201CDim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "2",
                description: 'Button BI: <br/>\u201CSwitch light on\u201D or "Dim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "3",
                description: 'Button B0: <br/>\u201CSwitch light off\u201D or \u201CDim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "4",
                description: 'Button CI: <br/> \u201CSwitch light on\u201D or "Dim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "5",
                description: 'Button C0: <br/>\u201CSwitch light off\u201D or \u201CDim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "6",
                description: 'Button DI: <br/>\u201CSwitch light on\u201D or "Dim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "7",
                description: 'Button D0: <br/>\u201CSwitch light off\u201D or \u201CDim light down\u201D or "Move blind closed\u201D'
              }
            ]
          }
        },
        {
          data: "Energy Bow",
          shortcut: "EB",
          description: "....",
          bitoffs: "3",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "released"
              },
              {
                value: "1",
                description: "pressed"
              }
            ]
          }
        },
        {
          data: "Rocker 2nd action",
          shortcut: "R2",
          description: "....",
          bitoffs: "4",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: 'Button AI: <br/> \u201CSwitch light on\u201D or "Dim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "1",
                description: 'Button A0: <br/> \u201CSwitch light off\u201D or \u201CDim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "2",
                description: 'Button BI: <br/>\u201CSwitch light on\u201D or "Dim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "3",
                description: 'Button B0: <br/>\u201CSwitch light off\u201D or \u201CDim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "4",
                description: 'Button CI: <br/> \u201CSwitch light on\u201D or "Dim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "5",
                description: 'Button C0: <br/>\u201CSwitch light off\u201D or \u201CDim light down\u201D or "Move blind closed\u201D'
              },
              {
                value: "6",
                description: 'Button DI: <br/>\u201CSwitch light on\u201D or "Dim light up\u201D or "Move blind open\u201D'
              },
              {
                value: "7",
                description: 'Button D0: <br/>\u201CSwitch light off\u201D or \u201CDim light down\u201D or "Move blind closed\u201D'
              }
            ]
          }
        },
        {
          data: "2nd Action",
          shortcut: "SA",
          description: "....",
          bitoffs: "7",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "No 2nd action"
              },
              {
                value: "1",
                description: "2nd action valid"
              }
            ]
          }
        }
      ]
    },
    {
      condition: {
        statusfield: [
          {
            bitoffs: "2",
            bitsize: "1",
            value: "0"
          },
          {
            bitoffs: "3",
            bitsize: "1",
            value: "0"
          }
        ]
      },
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "0"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "0"
        }
      ],
      datafield: [
        {
          data: "Number of buttons pressed simultaneously",
          shortcut: "R1",
          description: "....",
          bitoffs: "0",
          bitsize: "3",
          enum: {
            item: [
              {
                value: "0",
                description: "no button pressed"
              },
              {
                value: "1",
                description: "2 buttons pressed"
              },
              {
                value: "2",
                description: "3 buttons pressed"
              },
              {
                value: "3",
                description: "4 buttons pressed"
              },
              {
                value: "4",
                description: "5 buttons pressed"
              },
              {
                value: "5",
                description: "6 buttons pressed"
              },
              {
                value: "6",
                description: "7 buttons pressed"
              },
              {
                value: "7",
                description: "8 buttons pressed"
              }
            ]
          }
        },
        {
          data: "Energy Bow",
          shortcut: "EB",
          description: "....",
          bitoffs: "3",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "released"
              },
              {
                value: "1",
                description: "pressed"
              }
            ]
          }
        },
        {
          reserved: {},
          data: {},
          shortcut: {},
          description: {},
          bitoffs: "4",
          bitsize: "4",
          enum: {}
        }
      ]
    }
  ],
  originalIndex: 6,
  eep: "f6-03-02",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Rocker Switch, 4 Rocker",
  func_number: "0x03",
  submitter: [],
  icon: "Switch_Style2.svg"
};

// ../eep-transcoder/eep/f6-04-01.js
var f60401 = {
  number: "0x01",
  title: "Key Card Activated Switch",
  status: "released",
  description: "Insertion of Key Card generates an N-Message, take-out a U-Message",
  case: [
    {
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "1"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "1"
        }
      ],
      datafield: {
        data: "Key Card",
        shortcut: "KC",
        description: "...",
        bitoffs: "0",
        bitsize: "8",
        enum: {
          item: {
            value: "112",
            description: "inserted\n  (0x70)"
          }
        }
      }
    },
    {
      condition: {
        statusfield: [
          {
            bitoffs: "2",
            bitsize: "1",
            value: "1"
          },
          {
            bitoffs: "3",
            bitsize: "1",
            value: "0"
          }
        ]
      },
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "1"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "0"
        }
      ],
      datafield: {
        data: "Key Card",
        shortcut: "KC",
        description: "...",
        bitoffs: "0",
        bitsize: "8",
        enum: {
          item: {
            value: "0",
            description: "taken out"
          }
        }
      }
    }
  ],
  originalIndex: 7,
  eep: "f6-04-01",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Position Switch, Home and Office Application",
  func_number: "0x04",
  submitter: []
};

// ../eep-transcoder/eep/f6-04-02.js
var f60402 = {
  number: "0x02",
  title: "Key Card Activated Switch ERP2",
  status: "released",
  description: "\n              <br/><br/>\n              When card is inserted field EBO and SOC are both having value 1.\n              When take out, both are having value 0.\n              This coding is required to have a context less translation of\n              RPS profiles between ERP 1 and ERP 2.",
  case: [{
    datafield: [{
      data: "Energy Bow",
      shortcut: "EBO",
      description: "State of the energy bow",
      bitoffs: "0",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "taken out"
        }, {
          value: "1",
          description: "card inserted"
        }]
      }
    }, {
      data: "Button coding",
      shortcut: "BC",
      description: "Signalize button coding",
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: {
          value: "0",
          description: "button"
        }
      }
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "2",
      bitsize: "3",
      enum: {}
    }, {
      data: "State of card",
      shortcut: "SOC",
      description: "State of the card",
      bitoffs: "5",
      bitsize: "1",
      enum: {
        item: [{
          value: "0",
          description: "taken out"
        }, {
          value: "1",
          description: "card inserted"
        }]
      }
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "6",
      bitsize: "2",
      enum: {}
    }]
  }],
  originalIndex: 8,
  eep: "f6-04-02",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Position Switch, Home and Office Application",
  func_number: "0x04",
  submitter: [
    "EnOcean GmbH"
  ]
};

// ../eep-transcoder/eep/f6-05-01.js
var f60501 = {
  number: "0x01",
  title: "Liquid Leakage Sensor (mechanic harvester)",
  status: "released",
  description: '\n              <br/><br/>\n              Description:<br/>\n              This profile is used for devices detecting leakage.\n              It is commonly placed on ground where a leakage causes damage.\n              <br/>\n              The principle is that \u201Cpaper rings\u201D swell in water and trigger an\n              ECO 200 (generator) based transmitter.\n              <br/><br/>\n              <span style="border-bottom:2px groove #000000;">Data exchange</span>\n              <br/>\n              Direction: unidirectional<br/>\n              Addressing: broadcast<br/>\n              Communication trigger: event-triggered<br/>\n              Communication interval: NA<br/>\n              Trigger event: (water detection)<br/>\n              Teach-in method: RPS teach-in',
  case: [{
    statusfield: [{
      data: "T21",
      bitoffs: "2",
      bitsize: "1",
      value: "1"
    }, {
      data: "NU",
      bitoffs: "3",
      bitsize: "1",
      value: "1"
    }],
    datafield: [{
      data: "Water sensor",
      shortcut: "WAS",
      description: "Alert signal that the sensor detected water leakage",
      bitoffs: "0",
      bitsize: "8",
      enum: {
        item: {
          value: "0x11",
          description: "Water detected"
        }
      }
    }]
  }],
  originalIndex: 9,
  eep: "f6-05-01",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Detectors",
  func_number: "0x05",
  submitter: [
    "Afriso",
    "EnOcean"
  ]
};

// ../eep-transcoder/eep/f6-10-00.js
var f61000 = {
  number: "0x00",
  title: "Window Handle",
  status: "released",
  description: 'The bits marked with "X" in\n              DB_0 should not be checked.\n              These bits can be "1" or "0"\n              and should not be assumed\n              to be a defined value,\n              because both of them are\n              allowed and not predictable!',
  case: [
    {
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "1"
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "0"
        }
      ],
      datafield: [
        {
          data: "Window handle",
          shortcut: "WIN",
          description: "Movement of the window handle",
          bitoffs: "0",
          bitsize: "8",
          enum: {
            item: [
              {
                bitmask: "11010000",
                value: "11000000",
                description: "left/right"
              },
              {
                bitmask: "11110000",
                value: "11110000",
                description: "down"
              },
              {
                bitmask: "11110000",
                value: "11010000",
                description: "up"
              }
            ]
          }
        }
      ]
    }
  ],
  originalIndex: 10,
  eep: "f6-10-00",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Mechanical Handle",
  func_number: "0x10",
  submitter: ["HOPPE AG"]
};

// ../eep-transcoder/eep/f6-10-01.js
var f61001 = {
  number: "0x01",
  title: "Window Handle ERP2",
  status: "released",
  description: "\n              <br/><br/>\n              DB0.6 \u2013 needs to show that RPS/ERP2 has a different coding as RPS/ERP1.",
  case: [{
    datafield: [{
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "0",
      bitsize: "1",
      enum: {}
    }, {
      data: "Handle coding",
      shortcut: "HC",
      description: "Signalize window handle coding",
      bitoffs: "1",
      bitsize: "1",
      enum: {
        item: {
          value: "1",
          description: "handle"
        }
      }
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      bitoffs: "2",
      bitsize: "2",
      enum: {}
    }, {
      data: "Handle value",
      shortcut: "HVL",
      description: "Value of the 4MSB of the Data field of ERP1 coding",
      bitoffs: "4",
      bitsize: "4",
      enum: {
        item: [{
          value: "0b11X0",
          description: 'Moved from up to left.\n                      <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_01.png</img>'
        }, {
          value: "0b1111",
          description: 'Moved from right to down.\n                      <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_02.png</img>'
        }, {
          value: "0b11X0",
          description: 'Moved from down to left.\n                      <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_03.png</img>'
        }, {
          value: "0b1101",
          description: 'Moved from left to up.\n					  <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_04.png</img>'
        }, {
          value: "0b11X0",
          description: 'Moved from up to left.\n					  <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_05.png</img>'
        }, {
          value: "0b1111",
          description: 'Moved from left  to down.\n					  <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_06.png</img>'
        }, {
          value: "0b11X0",
          description: 'Moved from down to right.\n					  <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_07.png</img>'
        }, {
          value: "0b1101",
          description: 'Moved from right to up.\n					  <br/>\n                      <img style="width:70mm;margin:0;position:float">graphics/Window_Handle_08.png</img>'
        }]
      }
    }]
  }],
  originalIndex: 11,
  eep: "f6-10-01",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Mechanical Handle",
  func_number: "0x10",
  submitter: [
    "HOPPE AG"
  ]
};

// ../eep-transcoder/manufacturer.js
var manufacturer = {
  0: "MANUFACTURER_RESERVED",
  1: "PEHA",
  2: "THERMOKON",
  3: "SERVODAN",
  4: "ECHOFLEX_SOLUTIONS",
  5: "OMNIO_AG or AWAG_ELEKTROTECHNIK_AG",
  6: "HARDMEIER_ELECTRONICS",
  7: "REGULVAR_INC",
  8: "AD_HOC_ELECTRONICS",
  9: "DISTECH_CONTROLS",
  10: "KIEBACK_AND_PETER",
  11: "ENOCEAN_GMBH",
  12: "PROBARE or VICOS_GMBH",
  13: "ELTAKO",
  14: "LEVITON",
  15: "HONEYWELL",
  16: "SPARTAN_PERIPHERAL_DEVICES",
  17: "SIEMENS",
  18: "T_MAC",
  19: "RELIABLE_CONTROLS_CORPORATION",
  20: "ELSNER_ELEKTRONIK_GMBH",
  21: "DIEHL_CONTROLS",
  22: "BSC_COMPUTER",
  23: "S_AND_S_REGELTECHNIK_GMBH",
  24: "ZENO_CONTROLS or MASCO_CORPORATION",
  25: "INTESIS_SOFTWARE_SL",
  26: "VIESSMANN",
  27: "LUTUO_TECHNOLOGY",
  28: "CAN2GO",
  29: "SAUTER",
  30: "BOOT_UP",
  31: "OSRAM_SYLVANIA",
  32: "UNOTECH",
  33: "DELTA_CONTROLS_INC",
  34: "UNITRONIC_AG",
  35: "NANOSENSE",
  36: "THE_S4_GROUP",
  37: "MSR_SOLUTIONS or VEISSMANN_HAUSATOMATION_GMBH",
  38: "GE",
  39: "MAICO",
  40: "RUSKIN_COMPANY",
  41: "MAGNUM_ENERGY_SOLUTIONS",
  42: "KMC_CONTROLS",
  43: "ECOLOGIX_CONTROLS",
  44: "TRIO_2_SYS",
  45: "AFRISO_EURO_INDEX",
  46: "WALDMANN_GMBH",
  48: "NEC_PLATFORMS_LTD",
  49: "ITEC_CORPORATION",
  50: "SIMICX_CO_LTD",
  51: "PERMUNDO_GMBH",
  52: "EUROTRONIC_TECHNOLOGY_GMBH",
  53: "ART_JAPAN_CO_LTD",
  54: "TIANSU_AUTOMATION_CONTROL_SYSTE_CO_LTD",
  55: "WEINZIERL_ENGINEERING_GMBH",
  56: "GRUPPO_GIORDANO_IDEA_SPA",
  57: "ALPHAEOS_AG",
  58: "TAG_TECHNOLOGIES",
  59: "WATTSTOPPER",
  60: "PRESSAC_COMMUNICATIONS_LTD",
  62: "GIGA_CONCEPT",
  63: "SENSORTEC",
  64: "JAEGER_DIREKT",
  65: "AIR_SYSTEM_COMPONENTS_INC",
  66: "ERMINE_CORP",
  67: "SODA_GMBH",
  68: "EKE_AUTOMATION",
  69: "HOLTER_REGELARMUTREN",
  70: "ID_RF",
  71: "DEUTA_CONTROLS_GMBH",
  72: "EWATTCH",
  73: "MICROPELT",
  74: "CALEFFI_SPA",
  75: "DIGITAL_CONCEPTS",
  76: "EMERSON_CLIMATE_TECHNOLOGIES",
  77: "ADEE_ELECTRONIC",
  78: "ALTECON",
  79: "NANJING_PUTIAN_TELECOMMUNICATIONS",
  80: "TERRALUX",
  81: "MENRED",
  82: "IEXERGY_GMBH",
  83: "OVENTROP_GMBH",
  84: "BUILDING_AUTOMATION_PRODUCTS_INC",
  85: "FUNCTIONAL_DEVICES_INC",
  86: "OGGA",
  87: "ITHO_DAALDEROP",
  88: "RESOL",
  89: "ADVANCED_DEVICES",
  90: "AUTANI_LCC",
  91: "DR_RIEDEL_GMBH",
  92: "HOPPE_HOLDING_AG",
  93: "SIEGENIA_AUBI_KG",
  94: "ADEO_SERVICES",
  95: "EIMSIG_EFP_GMBH",
  96: "VIMAR_SPA",
  97: "GLEN_DIMLAX_GMBH",
  98: "PMDM_GMBH",
  99: "HUBBEL_LIGHTNING",
  100: "DEBFLEX",
  101: "PERIFACTORY_SENSORSYSTEMS",
  102: "WATTY_CORP",
  103: "WAGO_KONTAKTTECHNIK",
  104: "KESSEL",
  105: "AUG_WINKHAUS",
  106: "DECELECT",
  107: "MST_INDUSTRIES",
  108: "BECKER_ANTRIEBE",
  109: "NEXELEC",
  110: "WIELAND_ELECTRIC",
  111: "AVIDSEN",
  112: "CWS_BOCO_INTERNATIONAL",
  113: "ROTO_FRANK",
  114: "ALM_CONTORLS",
  115: "TOMMASO_TECHNOLOGIES",
  116: "REHAU",
  2047: "MULTI_USER_MANUFACTURER"
};

// ../eep-transcoder/eep-transcoder.js
function getEEP(eep) {
  let c = eep_exports[eep.replace(/-/g, "")];
  if ("ref" in c) {
    c = eep_exports[c.ref.replace(/-/g, "")];
  }
  return c;
}
function hex(x) {
  return parseInt(x, 16).toString(16).padStart(2, "0");
}
function toCamelCase(str) {
  let lc = str.toLowerCase();
  lc = lc.replace(/-/g, " ");
  const arr = lc.split(" ");
  return arr.map((item, index) => {
    if (index > 0) {
      return item.charAt(0).toUpperCase() + item.slice(1);
    } else {
      return item;
    }
  }).join("");
}
function eep2IP(eep) {
  const eepDesc = getEEP(eep);
  const funcs = eepDesc.case[0].datafield.reduce((acc, item) => {
    if (!("reserved" in item) && !(item.shortcut === "LRNB")) {
      acc.push(item);
    }
    return acc;
  }, []).map((item) => {
    const values = [];
    if ("range" in item) {
      values.push({
        range: {
          min: parseInt(item.scale.min),
          max: parseInt(item.scale.max),
          step: ((parseInt(item.scale.max) - parseInt(item.scale.min)) / (parseInt(item.range.max) - parseInt(item.range.min))).toFixed(3),
          unit: item.unit
        }
      });
    }
    if ("enum" in item) {
      item.enum.item.forEach((e) => {
        if ("min" in e) {
          e.value = {
            min: e.min,
            max: e.max
          };
        }
        values.push({
          value: e.value,
          meaning: e.description
        });
      });
    }
    return {
      key: toCamelCase(item.data),
      shorcut: item.shortcut,
      description: item.description,
      values
    };
  });
  return {
    eep: `${hex(eepDesc.rorg_number)}-${hex(eepDesc.func_number)}-${hex(
      eepDesc.number
    )}`,
    title: `${eepDesc.func_title}, ${eepDesc.title}`,
    functionGroup: {
      direction: "from",
      functions: funcs
    }
  };
}
function searchEEP(field, condition) {
  const res = [];
  for (const item in eep_exports) {
    if (item === field && condition.test(eep_exports[item][field])) {
      res.push(item);
    }
    if (searchInsideField(eep_exports[item], field, condition)) {
      res.push(item);
    }
  }
  return res;
}
function searchInsideField(currentMember, field, condition) {
  for (const item in currentMember) {
    if (item === field) {
      if (condition.test(currentMember[field])) {
        return true;
      }
    }
    if (typeof currentMember[item] !== "string") {
      if (searchInsideField(currentMember[item], field, condition)) {
        return true;
      }
    }
  }
  return false;
}
function getConditionType(item) {
  if ("condition" in item) {
    if ("statusfield" in item.condition) {
      return "status";
    }
    if ("datafield" in item.condition) {
      return "data";
    }
    if ("direction" in item.condition) {
      return "direction";
    }
  }
  return "none";
}
function createStatusByte(fields) {
  const status = ByteArray.from(0);
  return fields.reduce((a, x) => {
    a.setSingleBit(parseInt(x.bitoffs), parseInt(x.value));
    return a;
  }, status);
}
function getEEPDescriptor(options) {
  const selector = {
    ...{
      direction: 1,
      status: 0,
      payload: ByteArray.from([0, 0, 0, 0]),
      data: 1
    },
    ...options
  };
  const c = getEEP(selector.eep);
  let cond;
  return c.case.find(function(item) {
    switch (getConditionType(item)) {
      case "status":
        if (createStatusByte(item.condition.statusfield)[0] === selector.status) {
          return true;
        }
        break;
      case "data":
        cond = selector.payload.getValue(
          parseInt(item.condition.datafield.bitoffs),
          parseInt(item.condition.datafield.bitsize)
        );
        if (parseInt(item.condition.datafield.value) === (cond === 0 || isNaN(cond) ? selector.data : cond)) {
          return true;
        }
        break;
      case "direction":
        if (parseInt(item.condition.direction) === selector.direction) {
          return true;
        }
        break;
      case "none":
      default:
        return true;
    }
    return false;
  });
}
function decode(radio, eep, direction = 1) {
  return Object.freeze(
    decodeCase(
      radio.payload,
      getEEPDescriptor({
        eep,
        direction,
        status: radio.status,
        payload: radio.payload
      })
    )
  );
}
function decodeCase(tel, c) {
  try {
    if (!Array.isArray(c.datafield)) c.datafield = [c.datafield];
    const ret = c.datafield.reduce(makeFieldExtractor(tel), {});
    return ret;
  } catch (err) {
    console.error("ERROR", tel.toString(), c);
  }
}
function makeFieldExtractor(payload) {
  return function(returnValue, datafield, index, array) {
    let rawValue = payload.getValue(
      parseInt(datafield.bitoffs),
      parseInt(datafield.bitsize)
    );
    const unit = getUnit(datafield, array, payload);
    let v;
    switch (getFieldType(datafield)) {
      case "enum":
        returnValue[datafield.shortcut] = {
          ...{ name: datafield.data, unit, rawValue },
          ...extractEnumValue(rawValue, datafield.enum.item)
        };
        break;
      case "spread":
        v = datafield.spread.reduce((accumulator, current) => {
          return `${accumulator}${payload.getValue(parseInt(current.bitoffs), parseInt(current.bitsize)).toString(2).padStart(current.bitsize, "0")}`;
        }, "");
        rawValue = parseInt(v, 2);
        if (!("range" in datafield)) {
          break;
        }
      /* the next comment is important for eslint */
      /* falls through */
      case "range":
        returnValue[datafield.shortcut] = {
          name: datafield.data,
          rawValue,
          value: extractRangeValue(rawValue, datafield, array, payload),
          range: datafield.range,
          scale: datafield.scale,
          unit
        };
        break;
      case "reserved":
        break;
      case "raw":
      default:
        returnValue[datafield.shortcut] = {
          name: datafield.data,
          value: rawValue,
          unit
        };
    }
    return returnValue;
  };
}
function getFieldType(datafield) {
  if ("enum" in datafield && "item" in datafield.enum) {
    return "enum";
  }
  if ("range" in datafield && !("spread" in datafield)) {
    return "range";
  }
  if ("reserved" in datafield) {
    return "reserved";
  }
  if ("spread" in datafield) {
    return "spread";
  }
  return "raw";
}
function getDataFieldByShortcut(datafield, shortcut) {
  return datafield.find((item) => item.shortcut === shortcut);
}
function extractEnumValue(value, list) {
  if (!Array.isArray(list)) list = [list];
  return list.find((item) => {
    if ("min" in item) {
      if (parseInt(item.min) <= value && parseInt(item.max) >= value) {
        item.value = value;
        return true;
      }
    }
    if ("bitmask" in item) {
      const mask = parseInt(item.bitmask, 2);
      if ((value & mask) === parseInt(item.value, 2)) {
        return true;
      }
    }
    if ("scale" in item && parseInt(item.value) === value) {
      return true;
    }
    if (parseInt(item.value) === value) {
      return true;
    }
    return false;
  });
}
function extractRangeValue(rawValue, datafield, array, payload) {
  if (!("scale" in datafield)) {
    datafield.scale = datafield.range;
  }
  let scale = datafield.scale;
  let range = datafield.range;
  if ("ref" in datafield.scale) {
    scale = getRefField(datafield.scale.ref, array, payload).scale;
  }
  if ("ref" in datafield.range) {
    range = getRefField(datafield.range.ref, array, payload).range;
  }
  return mapValue(rawValue, range, scale);
}
function mapValue(value, range, scale) {
  const rangeDistance = Number(range.max) - Number(range.min);
  const scaleDistance = Number(scale.max) - Number(scale.min);
  const dx = scaleDistance / rangeDistance;
  return (value - Number(range.min)) * dx + Number(scale.min);
}
function getRefField(shortname, fieldDescs, payload) {
  return makeFieldExtractor(payload)(
    {},
    getDataFieldByShortcut(fieldDescs, shortname),
    0,
    payload
  )[shortname];
}
function getUnit(datafield, array, payload) {
  let unit = "";
  if ("unit" in datafield) {
    unit = datafield.unit;
    if (Object.prototype.hasOwnProperty.call(datafield.unit, "ref")) {
      unit = getRefField(datafield.unit.ref, array, payload).unit;
    }
  }
  return unit;
}
function setRangeValue(rawValue, datafield, eep, payload) {
  if (!("scale" in datafield)) {
    datafield.scale = datafield.range;
  }
  let scale = datafield.scale;
  let range = datafield.range;
  if ("ref" in datafield.scale) {
    scale = getRefField(datafield.scale.ref, eep, payload).scale;
  }
  if ("ref" in datafield.range) {
    range = getRefField(datafield.range.ref, eep, payload).range;
  }
  return mapValue(rawValue, scale, range);
}
function getPayloadLengthFromEEPDescriptor(desc) {
  function getBitoffs(field) {
    if ("spread" in field) {
      return field.spread.sort((x, y) => y.bitoffs - x.bitoffs)[0].bitoffs;
    } else {
      return parseInt(field.bitoffs);
    }
  }
  const res = desc.datafield.map((field) => {
    if ("spread" in field) {
      return field.spread.sort((x, y) => y.bitoffs - x.bitoffs)[0];
    } else {
      return { bitoffs: field.bitoffs, bitsize: field.bitsize };
    }
  }).sort((x, y) => getBitoffs(y) - getBitoffs(x))[0];
  return (getBitoffs(res) + parseInt(res.bitsize)) / 8;
}
function encodeData(data, options) {
  const selector = {
    ...{
      eep: "f6-01-01",
      direction: 1,
      status: 0,
      payload: ByteArray.from([0, 0, 0, 0]),
      data: 1
    },
    ...options
  };
  const payload = selector.payload;
  const desc = getEEPDescriptor({
    eep: selector.eep,
    direction: selector.direction,
    status: selector.status,
    payload,
    data: selector.data
  });
  const payloadLength = getPayloadLengthFromEEPDescriptor(desc);
  const diff = payloadLength - payload.length;
  if (diff > 0) {
    for (let l1 = 0; l1 < diff; l1++) {
      payload.unshift(0);
    }
  } else {
    for (let l2 = 0; l2 < -diff; l2++) {
      payload.pop();
    }
  }
  for (const name in data) {
    const field = getDataFieldByShortcut(desc.datafield, name);
    if (field) {
      const fieldType = getFieldType(field);
      const val = Object.prototype.hasOwnProperty.call(data[name], "value") ? data[name].value : data[name];
      if (fieldType === "range" || fieldType === "spread") {
        const v = Math.round(
          setRangeValue(val, field, desc.datafield, payload)
        );
        if (fieldType === "spread") {
          const totalLength = field.spread.reduce(
            (acc, current) => acc + current.bitsize
          );
          let valueString = v.toString(2).padStart(totalLength, "0");
          field.spread.forEach((current) => {
            const curentValue = valueString.substr(0, current.bitsize);
            valueString = valueString.substr(current.bitsize);
            payload.setValue(
              parseInt(curentValue, 2),
              current.bitoffs,
              current.bitsize
            );
          });
        } else {
          payload.setValue(v, parseInt(field.bitoffs), parseInt(field.bitsize));
        }
      } else {
        payload.setValue(val, parseInt(field.bitoffs), parseInt(field.bitsize));
      }
    }
  }
  return payload;
}
function getTeachInInfo(telegram) {
  const p = telegram;
  let rorg, func, typ, manId;
  if (p.RORG === 165 || p.RORG === 213) {
    if (p.RORG === 213) {
      rorg = p.RORG;
      func = 0;
      typ = 1;
      manId = 0;
    } else {
      rorg = p.RORG;
      func = p.payload.getValue(0, 6);
      typ = p.payload.getValue(6, 7);
      manId = p.payload.getValue(13, 11);
    }
    return {
      teachInType: p.RORG === 165 ? "4BS" : "1BS",
      senderId: p.senderId,
      eep: {
        rorg,
        func,
        type: typ,
        toString() {
          return `${this.rorg.toString(16).padStart(2, "0")}-${this.func.toString(16).padStart(2, "0")}-${this.type.toString(16).padStart(2, "0")}`;
        }
      },
      manufacturer: {
        id: manId,
        name: manufacturer[manId]
      }
    };
  }
  if (p.RORG === 246) {
    const rorg1 = 246;
    let func1 = 2;
    let type1 = 1;
    if (p.status === 16) {
      func1 = 3;
      type1 = 1;
    }
    if (p.status === 32 && (p.payload[0] === 192 || p.payload[0] === 208 || p.payload[0] === 224 || p.payload[0] === 240)) {
      func1 = 16;
      type1 = 0;
    }
    return {
      teachInType: "RPS",
      senderId: p.senderId,
      eep: {
        rorg: rorg1,
        func: func1,
        type: type1,
        toString() {
          return `${this.rorg.toString(16).padStart(2, "0")}-${this.func.toString(16).padStart(2, "0")}-${this.type.toString(16).padStart(2, "0")}`;
        }
      }
    };
  }
  if (p.RORG === 212) {
    rorg = p.payload.getValue(48, 8);
    func = p.payload.getValue(40, 8);
    typ = p.payload.getValue(32, 8);
    const msb = p.payload.getValue(29, 3).toString(2).padStart(3, "0");
    const lsb = p.payload.getValue(16, 8).toString(2).padStart(3, "0");
    manId = parseInt(`${msb}${lsb}`, 2);
    return {
      teachInType: "UTE",
      senderId: p.senderId,
      bidi: p.payload.getValue(0, 1),
      responseExpected: p.payload.getValue(1, 1),
      teachInRequest: p.payload.getValue(2, 2),
      commandId: p.payload.getValue(4, 4),
      channelCount: p.payload.getValue(8, 8),
      eep: {
        rorg,
        func,
        type: typ,
        toString() {
          return `${this.rorg.toString(16).padStart(2, "0")}-${this.func.toString(16).padStart(2, "0")}-${this.type.toString(16).padStart(2, "0")}`;
        },
        manufacturer: {
          id: manId,
          name: manufacturer[manId]
        }
      }
    };
  }
}

// ../esp3-packets/packet-types/RadioERP2.js
var RadioERP2 = class _RadioERP2 extends ESP3Packet {
  get addressControl() {
    const ctrl = [
      { src: 3, dest: 0 },
      { src: 4, dest: 0 },
      { src: 4, dest: 4 },
      { src: 6, dest: 0 }
    ];
    return ctrl[super.data.getValue(0, 3)];
  }
  get optionalDL() {
    if (this.extendedHeaderAvailable) {
      return super.data.getValue(8, 4);
    }
    return 0;
  }
  get payload() {
    let os = 1;
    const ac = this.addressControl;
    if (this.telegramType === 15) {
      os++;
    }
    if (this.extendedHeaderAvailable) {
      os++;
    }
    os += ac.src + ac.dest;
    const l = this.data.length - (os + this.optionalDL);
    return super.data.slice(os, os + l - 1);
  }
  get senderId() {
    let os = 1;
    if (this.telegramType === 15) {
      os++;
    }
    if (this.extendedHeaderAvailable) {
      os++;
    }
    return super.data.slice(os, os + this.addressControl.src).toString(16);
  }
  get extendedHeaderAvailable() {
    return Boolean(super.data.getValue(3, 1));
  }
  get telegramType() {
    return super.data.getValue(4, 4);
  }
  get RORG() {
    const rorgs = [
      246,
      213,
      165,
      208,
      210,
      212,
      209,
      48,
      49,
      53,
      179,
      null,
      null,
      null,
      null,
      "extended"
    ];
    const extRorgs = [197, 198, 199, 64, 50, 176, 177, 178];
    if (this.telegramType === 15) {
      return extRorgs[super.data[2]];
    }
    return rorgs[this.telegramType];
  }
  get subTelNum() {
    return super.optionalData[0];
  }
  get RSSI() {
    return super.optionalData[1];
  }
  get teachIn() {
    const mask = 1 << 3;
    if (this.RORG === 213 || this.RORG === 165) {
      return (this.payload[this.payload.length - 1] & mask) === 0;
    }
    if (this.RORG === 212 || this.RORG === 246) return true;
  }
  get teachInInfo() {
    const tii = getTeachInInfo(this);
    if (tii.eep.rorg === 246 && tii.eep.func === 2) {
      tii.eep.type = 4;
    }
    console.log(tii);
    return tii;
  }
  decode(eep, direction) {
    if (this.teachIn && this.RORG !== 246) return this.teachInInfo;
    return decode(this, eep, direction);
  }
  static from(input) {
    let pl;
    if (input.constructor.name === "ESP3Packet") {
      return new _RadioERP2(input.toString());
    }
    if (Object.prototype.hasOwnProperty.call(input, "payload")) {
      let rorg;
      pl = ByteArray.from(input.payload);
      switch (pl.length) {
        case 1:
          rorg = 246;
          break;
        case 4:
          rorg = 165;
          break;
        default:
          rorg = 210;
      }
      return _RadioERP2.from({
        data: [
          input.rorg || rorg,
          pl,
          input.id || "00000000",
          input.status || 0
        ],
        optionalData: [3, "ffffffff", "ff", 0],
        // always the same for sending ERP1
        packetType: 1
        // always the same for sending ERP1
      });
    } else {
      const res = new _RadioERP2(super.from(input).toString());
      return res;
    }
  }
};

// ../esp3-packets/packet-types/Response.js
var RET_OK = 0;
var RET_ERROR = 1;
var RET_NOT_SUPPORTED = 2;
var RET_WRONG_PARAM = 3;
var RET_OPERATION_DENIED = 4;
var RET_LOCK_SET = 5;
var RET_BUFFER_TO_SMALL = 6;
var RET_NO_FREE_BUFFER = 7;
var FLASH_HW_ERROR = 130;
var BASEID_OUT_OF_RANGE = 144;
var BASEID_MAX_REACHE = 145;
var responseTypes = {
  [RET_OK]: "RET_OK",
  [RET_ERROR]: "RET_ERROR",
  [RET_NOT_SUPPORTED]: "RET_NOT_SUPPORTED",
  [RET_WRONG_PARAM]: "RET_WRONG_PARAM",
  [RET_OPERATION_DENIED]: "RET_OPERATION_DENIED",
  [RET_LOCK_SET]: "RET_LOCK_SET",
  [RET_BUFFER_TO_SMALL]: "RET_BUFFER_TO_SMALL",
  [RET_NO_FREE_BUFFER]: "RET_NO_FREE_BUFFER",
  [FLASH_HW_ERROR]: "FLASH_HW_ERROR",
  [BASEID_OUT_OF_RANGE]: "BASEID_OUT_OF_RANGE",
  [BASEID_MAX_REACHE]: "BASEID_MAX_REACHE"
};
var Response = class _Response extends ESP3Packet {
  get responseType() {
    return responseTypes[this.data[0]];
  }
  static encode(response, args = [], optionalArgs = []) {
    const responseResponse = ESP3Packet.from({
      data: [response, args],
      optionalData: optionalArgs,
      packetType: 2
    });
    return new _Response(responseResponse.toString());
  }
  decode(typeDesc = {}) {
    let res = /* @__PURE__ */ Object.create({});
    if (typeDesc[this.data[0]]) {
      res = typeDesc[this.data[0]].reduce(
        ESP3Packet.fieldExtractor.bind(this),
        res
      );
    }
    res.returnCode = this.data[0];
    res.returnMsg = this.responseType;
    return res;
  }
  static from(input) {
    if (input.constructor.name === "ESP3Packet") {
      return new _Response(input.toString());
    } else {
      return input;
    }
  }
};

// ../pretty-printer/pretty-printer.js
function toHex(val, len = 2) {
  return val.toString(16).padStart(len, "0");
}
String.prototype.color = function(r, g, b) {
  if (g === void 0) {
    r = r.replace("#", "");
    const hex2 = parseInt(r, 16);
    r = hex2 >> 16;
    g = hex2 >> 8 & 255;
    b = hex2 & 255;
  }
  return "\x1B[38;2;" + r + ";" + g + ";" + b + "m" + this + "\x1B[39m";
};
String.prototype.bgcolor = function(r, g, b) {
  if (g === void 0) {
    const hex2 = parseInt(r, 16);
    r = hex2 >> 16;
    g = hex2 >> 8 & 255;
    b = hex2 & 255;
  }
  return "\x1B[48;2;" + r + ";" + g + ";" + b + "m" + this + "\x1B[49m";
};
var DATA_COLOR = "#69a5e7";
var OPTIONAL_DATA_COLOR = "#5dd65d";
var CRC8_COLOR = "#505762";
var packetTypeColors = {
  1: "#875fff",
  2: "#6B8E23",
  3: "#00CED1",
  4: "#FFFF00",
  5: "#FFA500"
};
var pretty = /* @__PURE__ */ Object.create({});
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.setAttribute("id", "enocean-js-pretty-printer-styles");
  style.appendChild(
    document.createTextNode(`
    .telegram{margin:8px;font-family:monospace;display:flex;flex-direction: row;align-items:center}
    .telegram div{padding:3px;border-radius:3px;margin:3px}
    .telegram div.dim{padding:3px;border-radius:3px;background:none;border:1px solid grey}
    .dim {color:grey}
    .type1{background:${packetTypeColors[1]}}
    .type2{background:${packetTypeColors[2]}}
    .type3{background:${packetTypeColors[3]}}
    .type4{background:${packetTypeColors[4]}}
    .type5{background:${packetTypeColors[5]}}
    .data_length{background:${DATA_COLOR} }
    .optional_length{background:${OPTIONAL_DATA_COLOR}}
    .data{background: ${DATA_COLOR} }
    .optional_data{background:${OPTIONAL_DATA_COLOR}}
    .telegram div.spacer{background:none;border-style:none;margin:0;padding:0}
    .spacer:before{content:'\u2022';}
    `)
  );
  document.head.appendChild(style);
}
function makeStyle(col, dim) {
  if (dim) {
    return `color:${col};background:none;padding:3px;border-radius:3px;border:1px solid #333`;
  } else {
    return `color:${col};background:#333;padding:3px;border-radius:3px;`;
  }
}
pretty.toString = function(packet) {
  return `<div class="telegram"><div class="sync_byte dim" title="Sync Byte">${55}</div><div class="spacer"></div>
  <div class="data_length" title="length of data part (${packet.dataLength} Bytes)">${toHex(packet.dataLength, 4)}</div><div class="spacer"></div>
  <div class="optional_length" title="length of optional data part (${packet.optionalLength} Bytes)">${toHex(packet.optionalLength)}</div><div class="spacer"></div>
  <div class="packet_type type${packet.packetType}">${toHex(
    packet.packetType
  )}</div>
  <div class="spacer"></div><div class="header_crc crc dim">${toHex(
    packet.crc8Header
  )}</div><div class="spacer"></div>
  <div class="data">${toHex(packet.data)}</div><div class="spacer"></div>
  ${packet.optionalLength === 0 ? "" : '<div class="optional_data">' + toHex(packet.optionalData) + '</div><div class="spacer"></div>'}
  <div class="body_crc crc dim">${toHex(packet.crc8Data)}</div>`;
};
pretty.logESP3 = function(packet) {
  if (typeof window === "undefined") {
    console.log(
      `${"55".color(CRC8_COLOR)}.${toHex(packet.dataLength, 4).color(
        DATA_COLOR
      )}.${toHex(packet.optionalLength).color(OPTIONAL_DATA_COLOR)}.${toHex(
        packet.packetType
      ).color(packetTypeColors[packet.packetType])}.${toHex(
        packet.crc8Header
      ).color(CRC8_COLOR)}.${toHex(packet.data).color(DATA_COLOR)}${packet.optionalLength === 0 ? "" : "." + toHex(packet.optionalData).color(OPTIONAL_DATA_COLOR)}.${toHex(packet.crc8Data).color(CRC8_COLOR)}`
    );
  } else {
    console.log();
    console.log(
      `%c55%c.%c${toHex(packet.dataLength, 4)}%c.%c${toHex(
        packet.optionalLength
      )}%c.%c${toHex(packet.packetType)}%c.%c${toHex(packet.crc8Header)}%c.%c${packet.data}${packet.optionalLength === 0 ? "" : "%c.%c" + toHex(packet.optionalData)}%c.%c${toHex(packet.crc8Data)}`,
      makeStyle(CRC8_COLOR, true),
      "color:black;",
      makeStyle(DATA_COLOR),
      "color:black;",
      makeStyle(OPTIONAL_DATA_COLOR),
      "color:black;",
      makeStyle(packetTypeColors[packet.packetType]),
      "color:black;",
      makeStyle(CRC8_COLOR, true),
      "color:black;",
      makeStyle(DATA_COLOR),
      "color:black;",
      makeStyle(OPTIONAL_DATA_COLOR),
      "color:black;",
      makeStyle(CRC8_COLOR, true)
    );
  }
};

// ../radio-erp1/radio-erp1.js
var UTE_BIDIRECTIONAL = 0;
var UTE_UNIDIRECTIONAL = 1;
var UTE_TEACH_IN_SUCCESSFULL = 1;
var UTE_DELETION_SUCCESSFULL = 2;
var UTE_EEP_NOT_SUPPORTED = 3;
var UTE_TEACH_IN_NOT_ACCEPTED = 0;
var UTE_QUERY_TEACH_IN_REQUEST = 0;
var UTE_QUERY_DELETION_REQUEST = 1;
var UTE_QUERY_TEACH_IN_OR_DELETION = 2;
var UTE_QUERY_NOT_USED = 3;
var UTE_CMD_QUERY = 0;
var UTE_CMD_RESPONSE = 1;
var RadioERP1 = class _RadioERP1 extends ESP3Packet {
  get packetType() {
    return 1;
  }
  get RORG() {
    return super.data[0];
  }
  get payload() {
    return super.data.slice(1, super.data.length - 5);
  }
  set payload(data) {
    const newData = ByteArray.from(data);
    const oldData = ByteArray.from(super.data);
    oldData.splice(1, super.dataLength - 6);
    oldData.splice(1, 0, ...newData);
    super.data = oldData;
    super.fixPacket();
  }
  get senderId() {
    return super.data.slice(super.data.length - 5, super.data.length - 1).toString(16);
  }
  set senderId(id) {
    const idValue = ByteArray.from(id);
    idValue.length = 4;
    const newData = ByteArray.from(super.data);
    newData.set(idValue, super.data.length - 5);
    super.data = newData;
    super.fixPacket();
  }
  set status(val) {
    const dat = super.data;
    dat[super.data.length - 1] = val;
    super.data = dat;
    super.fixPacket();
  }
  get status() {
    return super.data[super.data.length - 1];
  }
  get T21() {
    return ByteArray.from(this.status).getSingleBit(2);
  }
  set T21(val) {
    this.status = ByteArray.from(this.status).setSingleBit(2, val)[0];
    super.fixPacket();
  }
  get NU() {
    return ByteArray.from(this.status).getSingleBit(3);
  }
  set NU(val) {
    this.status = ByteArray.from(this.status).setSingleBit(3, val)[0];
    super.fixPacket();
  }
  get subTelNum() {
    return super.optionalData[0];
  }
  get destinationId() {
    return super.optionalData.slice(1, 5).toString(16);
  }
  set destinationId(id) {
    const idValue = ByteArray.from(id);
    idValue.length = 4;
    const newData = ByteArray.from(super.optionalData);
    newData.set(idValue, super.optionalData.length - 6);
    super.optionalData = newData;
    super.fixPacket();
  }
  get RSSI() {
    return super.optionalData[5];
  }
  get securityLevel() {
    return super.optionalData[6];
  }
  get teachIn() {
    const mask = 1 << 3;
    if (this.RORG === 213 || this.RORG === 165) {
      return (this.payload[this.payload.length - 1] & mask) === 0;
    }
    if (this.RORG === 212 || this.RORG === 246) return true;
  }
  set teachIn(val) {
    this.payload = this.payload.setSingleBit(
      this.payload.length * 8 - 4,
      val === true ? 0 : 1
    );
  }
  decode(eep, direction) {
    if (this.teachIn && this.RORG !== 246) return this.teachInInfo;
    return decode(this, eep, direction);
  }
  encode(data, options) {
    const opt = { ...options, ...{ payload: this.payload } };
    if ("status" in options) {
      this.status = options.status;
    }
    this.payload = encodeData(data, opt);
    return this.payload;
  }
  get teachInInfo() {
    return getTeachInInfo(this);
  }
  static makeTeachIn(opt) {
    const input = {
      ...{
        eep: "a5-02-01",
        manufacturerId: 2047,
        bidi: 0,
        cmd: UTE_CMD_QUERY,
        destinationId: "ffffffff",
        senderId: "00000000",
        responseRequired: 0,
        requestPayload: null,
        result: 1,
        channels: 255
      },
      ...opt
    };
    let pl;
    let rorg = input.type || parseInt(input.eep.split("-")[0], 16);
    const func = parseInt(input.eep.split("-")[1]);
    const type = parseInt(input.eep.split("-")[2]);
    let ret;
    if (Object.prototype.hasOwnProperty.call(input, "eep")) {
      switch (rorg) {
        case "RPS":
        case 246:
          return _RadioERP1.from({
            data: [246, "00", input.senderId || "00000000", 32],
            optionalData: [3, "ffffffff", "ff", 0],
            packetType: 1
          });
        case "1BS":
        case 213:
          return _RadioERP1.from({
            data: [213, "00", input.senderId || "00000000", 0],
            optionalData: [3, "ffffffff", "ff", 0],
            packetType: 1
          });
        case "UTE":
        case 212:
          rorg = parseInt(input.eep.split("-")[0], 16);
          if (input.cmd === UTE_CMD_QUERY) {
            ret = _RadioERP1.from({ rorg: 212, payload: [0, 0, 0, 0, 0, 0] });
            ret.senderId = input.senderId;
            ret.destinationId = input.destinationId;
            ret.payload = ret.payload.setValue(input.bidi, 0, 1);
            ret.payload = ret.payload.setValue(input.result, 2, 2);
            ret.payload = ret.payload.setValue(input.channels, 8, 8);
            ret.payload = ret.payload.setValue(
              input.manufacturerId & 255,
              16,
              8
            );
            ret.payload = ret.payload.setValue(
              (input.manufacturerId & 3840) >> 8,
              29,
              3
            );
            ret.payload = ret.payload.setValue(rorg, 48, 8);
            ret.payload = ret.payload.setValue(func, 40, 8);
            ret.payload = ret.payload.setValue(type, 32, 8);
            ret.payload = ret.payload.setValue(UTE_CMD_QUERY, 4, 4);
          } else {
            ret = _RadioERP1.from({ rorg: 212, payload: input.requestPayload });
            ret.senderId = input.senderId;
            ret.destinationId = input.destinationId;
            ret.payload = ret.payload.setValue(input.bidi, 0, 1);
            ret.payload = ret.payload.setValue(input.result, 2, 2);
            ret.payload = ret.payload.setValue(UTE_CMD_RESPONSE, 4, 4);
          }
          return ret;
        default:
          pl = ByteArray.from("00000000");
          pl.setValue(parseInt(input.eep.split("-")[1], 16), 0, 6);
          pl.setValue(parseInt(input.eep.split("-")[2], 16), 6, 7);
          pl.setValue(input.manufacturerId || 2047, 13, 11);
          pl.setValue(1, 24, 1);
          return _RadioERP1.from({
            data: [165, pl, input.senderId || "00000000", 0],
            optionalData: [3, "ffffffff", "ff", 0],
            packetType: 1
          });
      }
    }
  }
  static from(input) {
    let pl;
    if (input.constructor.name === "ESP3Packet") {
      return new _RadioERP1(input.toString());
    }
    if (Object.prototype.hasOwnProperty.call(input, "payload")) {
      let rorg;
      pl = ByteArray.from(input.payload);
      switch (pl.length) {
        case 1:
          rorg = 246;
          break;
        case 4:
          rorg = 165;
          break;
        default:
          rorg = 210;
      }
      return _RadioERP1.from({
        data: [
          input.rorg || rorg,
          pl,
          input.id || "00000000",
          input.status || 0
        ],
        optionalData: [3, "ffffffff", "ff", 0],
        // always the same for sending ERP1
        packetType: 1
        // always the same for sending ERP1
      });
    } else {
      const res = new _RadioERP1(super.from(input).toString());
      return res;
    }
  }
};

// ../common-command/common-commands/CO_WR_SLEEP.js
var DESC_CO_WR_SLEEP = {
  name: "CO_WR_SLEEP",
  commandCode: 1,
  responseDefinition: {},
  fields: [
    {
      name: "period",
      location: "data",
      offset: 1,
      length: 4,
      retFunc: (x) => {
        return x.getValue(8, 24);
      }
    }
  ]
};

// ../common-command/common-commands/CO_WR_RESET.js
var DESC_CO_WR_RESET = {
  name: "CO_WR_RESET",
  commandCode: 2,
  responseDefinition: {},
  fields: []
};

// ../common-command/common-commands/CO_RD_VERSION.js
var DESC_CO_RD_VERSION = {
  name: "CO_RD_VERSION",
  commandCode: 3,
  fields: [],
  responseDefinition: {
    0: [
      {
        name: "appVersion",
        location: "data",
        offset: 1,
        length: 4,
        retFunc: (x) => x
      },
      {
        name: "apiVersion",
        location: "data",
        offset: 5,
        length: 4,
        retFunc: (x) => x
      },
      {
        name: "chipId",
        location: "data",
        offset: 9,
        length: 4,
        retFunc: (x) => x
      },
      {
        name: "chipVersion",
        location: "data",
        offset: 13,
        length: 4,
        retFunc: (x) => x
      },
      {
        name: "appDescription",
        location: "data",
        offset: 17,
        length: 16,
        retFunc: (x) => x.filter((item) => item > 0).map((item) => String.fromCharCode(item)).join("")
      }
    ]
  }
};

// ../common-command/common-commands/CO_RD_SYS_LOG.js
var DESC_CO_RD_SYS_LOG = {
  name: "CO_RD_SYS_LOG",
  commandCode: 4,
  fields: [],
  responseDefinition: {
    0: [
      {
        name: "returnCode",
        value: "RET_OK"
      },
      {
        name: "apiLogCounter",
        location: "data",
        retFunc: (x) => {
          x.shift();
          return x;
        }
      },
      {
        name: "appLogCounter",
        location: "optionalData",
        retFunc: (x) => x
      }
    ]
  }
};

// ../common-command/common-commands/CO_RD_IDBASE.js
var DESC_CO_RD_IDBASE = {
  name: "CO_RD_IDBASE",
  commandCode: 8,
  fields: [],
  responseDefinition: {
    0: [
      {
        name: "baseId",
        location: "data",
        offset: 1,
        length: 4,
        retFunc: (x) => x
      },
      {
        name: "remainingWriteCycles",
        location: "optionalData",
        offset: 0,
        length: 1,
        retFunc: (x) => x
      }
    ]
  }
};

// ../common-command/common-commands/CO_GET_FREQUENCY_INFO.js
var DESC_CO_GET_FREQUENCY_INFO = {
  name: "DESC_CO_GET_FREQUENCY_INFO",
  commandCode: 25,
  fields: [],
  responseDefinition: {
    0: [
      {
        name: "frequency",
        location: "data",
        offset: 1,
        length: 2,
        retFunc: (x) => {
          const FRQ = {
            0: "315Mhz",
            1: "868.3Mhz",
            2: "902.875Mhz",
            3: "925 Mhz",
            4: "928 Mhz",
            32: "2.4 Gh"
          };
          return FRQ[x];
        }
      },
      {
        name: "protocol",
        location: "data",
        offset: 2,
        length: 2,
        retFunc: (x) => {
          const PROTO = {
            0: "ERP1",
            1: "ERP2",
            16: "802.15.4",
            32: "Bluetooth",
            48: "Long Range"
          };
          return PROTO[x];
        }
      }
    ]
  }
};

// ../common-command/common-command.js
var CO_WR_SLEEP = 1;
var CO_WR_RESET = 2;
var CO_RD_VERSION = 3;
var CO_RD_SYS_LOG = 4;
var CO_RD_IDBASE = 8;
var CO_GET_FREQUENCY_INFO = 37;
var commandTypes = {
  [CO_WR_SLEEP]: DESC_CO_WR_SLEEP,
  [CO_WR_RESET]: DESC_CO_WR_RESET,
  [CO_RD_VERSION]: DESC_CO_RD_VERSION,
  [CO_RD_SYS_LOG]: DESC_CO_RD_SYS_LOG,
  // CO_WR_SYS_LOG,
  // CO_WR_BIST,
  // CO_WR_IDBASE,
  [CO_RD_IDBASE]: DESC_CO_RD_IDBASE,
  // CO_WR_REPEATER,
  // CO_RD_REPEATER,
  // CO_RD_FILTER,
  // CO_WR_FILTER_ADD,
  // CO_WR_FILTER_DEL,
  // CO_WR_FILTER_DEL_ALL,
  // CO_WR_FILTER_ENABLE,
  // CO_WR_WAIT_MATURITY,
  // CO_WR_SUBTEL,
  // CO_RD_MEM_ADDRESS,
  // CO_RD_MEM,
  // CO_WR_MEM,
  // CO_WR_LEARNMODE,
  // CO_RD_LEARNMODE,
  // CO_WR_MODE,
  // CO_RD_NUMSECUREDEVICES,
  // CO_RD_DUTYCYCLE_LIMIT,
  // CO_SET_BAUDRATE,
  [CO_GET_FREQUENCY_INFO]: DESC_CO_GET_FREQUENCY_INFO
  // CO_WR_REMAN_CODE
};
var BLOCK_RADIO_INTERFACE = 0;
var APPLY_RADIO_INTERFACE = 128;
var BLOCK_FILTERED_REPEATER = 64;
var APPLY_FILTERED_REPEATER = 192;
var FILTER_SOURCE_ID = 0;
var FILTER_RORG = 1;
var FILTER_RSSI = 2;
var FILTER_DESTINATION_ID = 3;
var FILTER_OFF = 0;
var FILTER_ON = 1;
var FILTER_OPERATOR_OR = 0;
var FILTER_OPERATOR_AND = 1;
var FILTER_OPERATOR_OR_AND = 8;
var FILTER_OPERATOR_AND_OR = 9;
var CommonCommand = class _CommonCommand extends ESP3Packet {
  get commandType() {
    return commandTypes[this.data[0]];
  }
  static encode(command, args = [], optionalArgs = []) {
    const commonCommand = ESP3Packet.from({
      data: [command, args],
      optionalData: optionalArgs,
      packetType: 5
    });
    return new _CommonCommand(commonCommand.toString());
  }
  decode() {
    const res = this.commandType.fields.reduce(
      ESP3Packet.fieldExtractor.bind(this),
      /* @__PURE__ */ Object.create({})
    );
    res.commandCode = this.data[0];
    res.command = this.commandType.name;
    return res;
  }
  static from(input) {
    if (input.constructor.name === "ESP3packet") {
      return new _CommonCommand(input.toString());
    }
  }
};
var Commander = class {
  constructor(sender) {
    this.send = sender.send;
  }
  async getIdBase() {
    const tel = CommonCommand.encode(CO_RD_IDBASE);
    const res = await this.send(tel.toString());
    const result = new Response(res.toString());
    return result.decode(commandTypes[CO_RD_IDBASE].responseDefinition);
  }
  async getVersion() {
    const tel = CommonCommand.encode(CO_RD_VERSION);
    const res = await this.send(tel.toString());
    const result = new Response(res.toString());
    return result.decode(commandTypes[CO_RD_VERSION].responseDefinition);
  }
  async getFrequency() {
    const tel = CommonCommand.encode(CO_GET_FREQUENCY_INFO);
    const res = await this.send(tel.toString());
    const result = new Response(res.toString());
    return result.decode(
      commandTypes[CO_GET_FREQUENCY_INFO].responseDefinition
    );
  }
};
export {
  APPLY_FILTERED_REPEATER,
  APPLY_RADIO_INTERFACE,
  BASEID_MAX_REACHE,
  BASEID_OUT_OF_RANGE,
  BLOCK_FILTERED_REPEATER,
  BLOCK_RADIO_INTERFACE,
  ByteArray,
  CO_GET_FREQUENCY_INFO,
  CO_RD_IDBASE,
  CO_RD_SYS_LOG,
  CO_RD_VERSION,
  CO_WR_RESET,
  CO_WR_SLEEP,
  Commander,
  CommonCommand,
  eep_exports as EEP,
  ESP3Packet,
  FILTER_DESTINATION_ID,
  FILTER_OFF,
  FILTER_ON,
  FILTER_OPERATOR_AND,
  FILTER_OPERATOR_AND_OR,
  FILTER_OPERATOR_OR,
  FILTER_OPERATOR_OR_AND,
  FILTER_RORG,
  FILTER_RSSI,
  FILTER_SOURCE_ID,
  FLASH_HW_ERROR,
  RET_BUFFER_TO_SMALL,
  RET_ERROR,
  RET_LOCK_SET,
  RET_NOT_SUPPORTED,
  RET_NO_FREE_BUFFER,
  RET_OK,
  RET_OPERATION_DENIED,
  RET_WRONG_PARAM,
  RadioERP1,
  RadioERP2,
  Response,
  UTE_BIDIRECTIONAL,
  UTE_CMD_QUERY,
  UTE_CMD_RESPONSE,
  UTE_DELETION_SUCCESSFULL,
  UTE_EEP_NOT_SUPPORTED,
  UTE_QUERY_DELETION_REQUEST,
  UTE_QUERY_NOT_USED,
  UTE_QUERY_TEACH_IN_OR_DELETION,
  UTE_QUERY_TEACH_IN_REQUEST,
  UTE_TEACH_IN_NOT_ACCEPTED,
  UTE_TEACH_IN_SUCCESSFULL,
  UTE_UNIDIRECTIONAL,
  commandTypes,
  decode,
  eep2IP,
  encodeData,
  getCRC8,
  getEEP,
  getTeachInInfo,
  pretty,
  responseTypes,
  searchEEP,
  toCRC8,
  u8CRC8Table
};
