/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */
export const WAIT_FOR_SYNC_BYTE = 0;
export const FILL_HEADER = 1;
export const CHECK_CRC8_HEADER = 2;
export const FILL_DATA_OPTIONALDATA = 3;
export const CHECK_CRC8_DATAS = 4;

export const WRONG_HEADER_CHECKSUM_ERROR = 1;
export const WRONG_BODY_CHECKSUM_ERROR = 2;
export const ILLEGAL_PACKET_LENGTH_ERROR = 3;
export const BUFFER_OVERFLOW_ERROR = 4;

export default WAIT_FOR_SYNC_BYTE;
