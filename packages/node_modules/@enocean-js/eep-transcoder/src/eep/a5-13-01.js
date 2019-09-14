export const a51301 = {
  number: '0x01',
  title: 'Weather Station',
  status: 'released',
  description: 'A receiver that accepts EEP A5-13-01 at teach-in automatically needs to accept telegrams from\n            the same ID that comply to the definitions of EEP A5-13-02 thru EEP A5-13-06. Different\n            telegrams received from that ID need to be distinguished by their 4 bit identifiers.',
  case: [{
    title: '0x01 Weather station',
    description: '',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '24',
        bitsize: '4',
        value: '0x01'
      }
    },
    datafield: [{
      data: 'LRN Bit',
      shortcut: 'LRNB',
      description: 'LRN Bit',
      bitoffs: '28',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Teach-in telegram'
        }, {
          value: '1',
          description: 'Data telegram'
        }]
      }
    }, {
      data: 'Dawn sensor',
      shortcut: 'DWS',
      description: 'Dawn sensor',
      info: 'DB_3 Dawn sensor 0 … 999lx, linear n=0…255',
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '999'
      },
      unit: 'lx'
    }, {
      data: 'Temperature',
      shortcut: 'TMP',
      description: 'Outdoor Temp',
      info: 'DB_2: Outdoor Temp. -40°C ... +80°C, linear n=0…255',
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '-40',
        max: '+80'
      },
      unit: '°C'
    }, {
      data: 'Wind speed',
      shortcut: 'WND',
      description: 'Wind speed',
      info: 'DB_1: Wind speed 0 ... 70m/s, linear n=0…255',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '70'
      },
      unit: 'm/s'
    }, {
      data: 'Identifier',
      shortcut: 'ID',
      description: 'Identifier',
      info: 'DB_0.BIT_7 … 4: Identifier',
      bitoffs: '24',
      bitsize: '4',
      enum: {
        item: {
          value: '0x1',
          description: {}
        }
      }
    }, {
      data: 'Day / Night',
      shortcut: 'D/N',
      description: 'Day / Night',
      info: 'DB_0.BIT_2: Day / Night',
      bitoffs: '29',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Day'
        }, {
          value: '1',
          description: 'Night'
        }]
      }
    }, {
      data: 'Rain Indication',
      shortcut: 'RAN',
      description: 'Rain Indication',
      info: 'DB_0.BIT_1: Rain Indication',
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'No Rain'
        }, {
          value: '1',
          description: 'Rain'
        }]
      }
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: {},
      info: {},
      bitoffs: '31',
      bitsize: '1'
    }]
  }, {
    title: '0x02 Sun Intensity',
    description: '',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '24',
        bitsize: '4',
        value: '0x02'
      }
    },
    datafield: [{
      data: 'LRN Bit',
      shortcut: 'LRNB',
      description: 'LRN Bit',
      bitoffs: '28',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Teach-in telegram'
        }, {
          value: '1',
          description: 'Data telegram'
        }]
      }
    }, {
      data: 'Sun – West',
      shortcut: 'SNW',
      description: 'Sun - West,linear',
      info: 'DB_3: Sun – West 1klx … 150klx, linear n=0…255',
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '150'
      },
      unit: 'klx'
    }, {
      data: 'Sun – South',
      shortcut: 'SNS',
      description: 'Sun - South,linear',
      info: 'DB_2: Sun – West 1klx … 150klx, linear n=0…255',
      bitoffs: '8',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '150'
      },
      unit: 'klx'
    }, {
      data: 'Sun – East',
      shortcut: 'SNE',
      description: 'Sun - East,linear',
      info: 'DB_1: Sun – East 1klx … 150klx, linear n=0…255',
      bitoffs: '16',
      bitsize: '8',
      range: {
        min: '0',
        max: '255'
      },
      scale: {
        min: '0',
        max: '150'
      },
      unit: 'klx'
    }, {
      data: 'Identifier',
      shortcut: 'ID',
      description: 'Identifier',
      info: 'DB_0.BIT_7 … 4: Identifier',
      bitoffs: '24',
      bitsize: '4',
      enum: {
        item: {
          value: '0x2',
          description: {}
        }
      }
    }, {
      data: 'Hemisphere',
      shortcut: 'HEM',
      description: '0 = north / 1 = south, then swith Sun south to Sun North when in southern hemisphere',
      info: {},
      bitoffs: '29',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'North'
        }, {
          value: '1',
          description: 'South'
        }]
      }
    }, {
      reserved: {},
      data: {},
      shortcut: {},
      description: 'Not Used',
      info: {},
      bitoffs: '30',
      bitsize: '2'
    }]
  }, {
    title: '0x03 Date Exchange',
    description: '',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '24',
        bitsize: '4',
        value: '0x03'
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: '0',
      bitsize: '3'
    }, {
      reserved: {},
      bitoffs: '8',
      bitsize: '4'
    }, {
      reserved: {},
      bitoffs: '16',
      bitsize: '1'
    }, {
      reserved: {},
      bitoffs: '29',
      bitsize: '2'
    }, {
      data: 'LRN Bit',
      shortcut: 'LRNB',
      description: 'LRN Bit',
      bitoffs: '28',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Teach-in telegram'
        }, {
          value: '1',
          description: 'Data telegram'
        }]
      }
    }, {
      data: 'Day',
      shortcut: 'DY',
      description: 'Day',
      info: 'DB_3.BIT_4 … 0: Day n=1 … 31',
      bitoffs: '3',
      bitsize: '5',
      range: {
        min: '1',
        max: '31'
      },
      scale: {
        min: '1',
        max: '31'
      },
      unit: 'N/A'
    }, {
      data: 'Month',
      shortcut: 'MTH',
      description: 'Month (1->January)',
      info: 'DB_2.BIT_3 … 0: Month n=1 … 12 1->January',
      bitoffs: '12',
      bitsize: '4',
      range: {
        min: '1',
        max: '12'
      },
      scale: {
        min: '1',
        max: '12'
      },
      unit: 'N/A'
    }, {
      data: 'Year',
      shortcut: 'YR',
      description: 'Year (0->Year 2000)',
      info: 'DB_1.BIT_6 … 0: Year n=0 … 99',
      bitoffs: '17',
      bitsize: '7',
      range: {
        min: '0',
        max: '99'
      },
      scale: {
        min: '2000',
        max: '2099'
      },
      unit: 'N/A'
    }, {
      data: 'Identifier',
      shortcut: 'ID',
      description: 'Identifier',
      info: 'DB_0.BIT_7 … 4: Identifier',
      bitoffs: '24',
      bitsize: '4',
      enum: {
        item: {
          value: '0x3',
          description: {}
        }
      }
    }, {
      data: 'Source',
      shortcut: 'SRC',
      description: 'Source',
      info: 'DB_0.BIT_0: Source',
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Real Time Clock'
        }, {
          value: '1',
          description: 'GPS or equivalent (e.g. DCF77, WWV)'
        }]
      }
    }]
  }, {
    title: '0x04 Time and Day Exchange',
    description: '',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '24',
        bitsize: '4',
        value: '0x04'
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: '8',
      bitsize: '2'
    }, {
      reserved: {},
      bitoffs: '16',
      bitsize: '2'
    }, {
      data: 'LRN Bit',
      shortcut: 'LRNB',
      description: 'LRN Bit',
      bitoffs: '28',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Teach-in telegram'
        }, {
          value: '1',
          description: 'Data telegram'
        }]
      }
    }, {
      data: 'Weekday',
      shortcut: 'WDY',
      description: 'Weekday (1 -> Monday)',
      info: 'DB_3.BIT_7 … 5: Weekday n=1 … 7 1 -> Monday',
      bitoffs: '0',
      bitsize: '3',
      enum: {
        item: [{
          value: '1',
          description: 'Monday'
        }, {
          value: '2',
          description: 'Tuesday'
        }, {
          value: '3',
          description: 'Wednesday'
        }, {
          value: '4',
          description: 'Thursday'
        }, {
          value: '5',
          description: 'Friday'
        }, {
          value: '6',
          description: 'Saturday'
        }, {
          value: '7',
          description: 'Sunday'
        }]
      }
    }, {
      data: 'Hour',
      shortcut: 'HR',
      description: 'Hour',
      info: 'DB_3.BIT_4 … 0: Hour n=0 … 23',
      bitoffs: '3',
      bitsize: '5',
      range: {
        min: '0',
        max: '23'
      },
      scale: {
        min: '0',
        max: '23'
      },
      unit: 'N/A'
    }, {
      data: 'Minute',
      shortcut: 'MIN',
      description: 'Minute',
      info: 'DB_2.BIT_5 … 0: Minute n=0 … 59',
      bitoffs: '10',
      bitsize: '6',
      range: {
        min: '0',
        max: '59'
      },
      scale: {
        min: '0',
        max: '59'
      },
      unit: 'N/A'
    }, {
      data: 'Second',
      shortcut: 'SEC',
      description: 'Second',
      info: 'DB_1.BIT_5 … 0: Year n=0 … 59',
      bitoffs: '18',
      bitsize: '6',
      range: {
        min: '0',
        max: '59'
      },
      scale: {
        min: '0',
        max: '59'
      },
      unit: 'N/A'
    }, {
      data: 'Identifier',
      shortcut: 'ID',
      description: 'Identifier',
      info: 'DB_0.BIT_7 … 4: Identifier',
      bitoffs: '24',
      bitsize: '4',
      enum: {
        item: {
          value: '0x4',
          description: {}
        }
      }
    }, {
      data: 'Time Format',
      shortcut: 'TMF',
      description: 'Time Format',
      info: 'DB_0.BIT_2: Time Format',
      bitoffs: '29',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: '24 hours'
        }, {
          value: '1',
          description: '12 hours'
        }]
      }
    }, {
      data: 'AM/PM',
      shortcut: 'A/PM',
      description: 'AM or PM',
      info: 'DB_0.BIT_1: AM/PM',
      bitoffs: '30',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'AM'
        }, {
          value: '1',
          description: 'PM'
        }]
      }
    }, {
      data: 'Source',
      shortcut: 'SRC',
      description: 'Source',
      info: 'DB_0.BIT_0: Source',
      bitoffs: '31',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Real Time Clock'
        }, {
          value: '1',
          description: 'GPS or equivalent (e.g. DCF77, WWV)'
        }]
      }
    }]
  }, {
    title: '0x05 Direction Exchange',
    description: '',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '24',
        bitsize: '4',
        value: '0x05'
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: '29',
      bitsize: '3'
    }, {
      reserved: {},
      bitoffs: '8',
      bitsize: '7'
    }, {
      data: 'LRN Bit',
      shortcut: 'LRNB',
      description: 'LRN Bit',
      bitoffs: '28',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Teach-in telegram'
        }, {
          value: '1',
          description: 'Data telegram'
        }]
      }
    }, {
      data: 'Elevation',
      shortcut: 'ELV',
      description: 'Elevation (0° -> horizon)',
      info: 'DB_3 Elevation -90° … +90°, linear n=0…180 0° ->Horizon',
      bitoffs: '0',
      bitsize: '8',
      range: {
        min: '0',
        max: '180'
      },
      scale: {
        min: '-90',
        max: '+90'
      },
      unit: '°'
    }, {
      data: 'Azimut',
      shortcut: 'AZM',
      description: 'Azimuth (0° -> True north; clockwise)',
      info: 'DB_2.BIT_0: Azimut (MSB) 0° … 359°, linear n=0…359 0° -> True north\n                DB_1: Azimut (LSB)',
      bitoffs: '15',
      bitsize: '9',
      range: {
        min: '0',
        max: '359'
      },
      scale: {
        min: '0',
        max: '359'
      },
      unit: '°'
    }, {
      data: 'Identifier',
      shortcut: 'ID',
      description: 'Identifier',
      info: 'DB_0.BIT_7 … 4: Identifier',
      bitoffs: '24',
      bitsize: '4',
      enum: {
        item: {
          value: '0x5',
          description: {}
        }
      }
    }]
  }, {
    title: '0x06 Geographic Position Exchange',
    description: '',
    status: 'released',
    condition: {
      datafield: {
        bitoffs: '24',
        bitsize: '4',
        value: '0x06'
      }
    },
    datafield: [{
      reserved: {},
      bitoffs: '29',
      bitsize: '3'
    }, {
      data: 'LRN Bit',
      shortcut: 'LRNB',
      description: 'LRN Bit',
      bitoffs: '28',
      bitsize: '1',
      enum: {
        item: [{
          value: '0',
          description: 'Teach-in telegram'
        }, {
          value: '1',
          description: 'Data telegram'
        }]
      }
    }, {
      data: 'Latitude',
      shortcut: 'LAT',
      description: 'Latitude',
      info: 'combined Latitude from MSB+LSB',
      spread: [
        {
          bitoffs: 0,
          bitsize: 4
        }, {
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
      unit: '°'
    }, {
      data: 'Longitude',
      shortcut: 'LOT',
      description: 'Longitude',
      info: 'combined Longitude from MSB+LSB',
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
      unit: '°'
    }, {
      data: 'Identifier',
      shortcut: 'ID',
      description: 'Identifier',
      info: 'DB_0.BIT_7 … 4: Identifier',
      bitoffs: '24',
      bitsize: '4',
      enum: {
        item: {
          value: '0x6',
          description: {}
        }
      }
    }]
  }
  ],
  originalIndex: 107,
  eep: 'a5-13-01',
  rorg_title: '4BS Telegram',
  rorg_number: '0xA5',
  func_title: 'Environmental Applications',
  func_number: '0x13',
  submitter: []
}
