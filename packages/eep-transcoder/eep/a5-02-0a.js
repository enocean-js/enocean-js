export const a5020a = {
  number: "0x0A",
  title: "Temperature Sensor Range +50°C to +90°C",
  status: "released",
  case: [
    {
      datafield: [
        {
          data: "LRN Bit",
          shortcut: "LRNB",
          description: "LRN Bit",
          bitoffs: "28",
          bitsize: "1",
          enum: {
            item: [
              {
                value: "0",
                description: "Teach-in telegram",
              },
              {
                value: "1",
                description: "Data telegram",
              },
            ],
          },
        },
        {
          data: "Temperature",
          shortcut: "TMP",
          description: "Temperature (linear)",
          info: "DB_1 Temperature (8 bit) 50... +90°C, linear n=255...0",
          bitoffs: "16",
          bitsize: "8",
          range: {
            min: "255",
            max: "0",
          },
          scale: {
            min: "+50",
            max: "+90",
          },
          unit: "°C",
        },
      ],
    },
  ],
  originalIndex: 22,
  eep: "a5-02-0a",
  rorg_title: "4BS Telegram",
  rorg_number: "0xA5",
  func_title: "Temperature Sensors",
  func_number: "0x02",
  description: "",
  submitter: [],
};
