export const f60203 = {
  number: "0x03",
  title: "Light Control - Application Style 1",
  status: "released",
  description:
    "\n              <br/>\n              <br/>\n              Definition of Auto, I/O for Rocker switch, Dim control (PTM200)",
  case: [
    {
      statusfield: [
        {
          data: "T21",
          bitoffs: "2",
          bitsize: "1",
          value: "1",
        },
        {
          data: "NU",
          bitoffs: "3",
          bitsize: "1",
          value: "1",
        },
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
                description: "released",
              },
              {
                value: 48,
                description: "Button A0 pressed",
              },
              {
                value: 16,
                description: "Button A1 pressed",
              },
              {
                value: 112,
                description: "Button B0 pressed",
              },
              {
                value: 80,
                description: "Button B1 pressed",
              },
            ],
          },
        },
      ],
    },
  ],
  originalIndex: 3,
  eep: "f6-02-03",
  rorg_title: "RPS Telegram",
  rorg_number: "0xF6",
  func_title: "Rocker Switch, 2 Rocker",
  func_number: "0x02",
  submitter: ["Servodan"],
  icon: "Switch_Style1.svg",
};
