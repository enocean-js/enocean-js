# Enocean Serial Protocol (ESP3)

* [Packet Structure](#packet-structure)
* [Packet Description](#packet-description)

## Packet structure
ESP3 is a Point-to-Point protocol with a packet data structure.
This principle encapsulates actual user data (payload), Command, Event or Response
messages.

![Packet Structure of Enocean Serial Protocol (ESP3) Packets](images/packet-structure.png)

Every ESP3 packet consists of Header, Data and Optional Data.

The packet (frame) is divided into: Sync.-Byte (start), CRC8 for Header and CRC8 for
Data (incl. Optional Data).

Every group consists of Fields, each with 1 or x bytes.

The ESP3 Header consists of the Fields:
- Data Length (number of bytes of the group Data)
- Optional Length (number of bytes of the group Optional Data)
- Packet Type (RADIO, RESPONSE, EVENT, COMMAND ...)

## Packet description

| Group | Offset | Size | Field | Value hex | Description |
| --- | --- | --- | --- | --- | --- |
| - | 0 | 1 | Sync. Byte | 0x55 | Serial synchronization byte; always set to 0x55 |
