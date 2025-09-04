/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

/**
 * A collection of pure functions for manipulating byte arrays (or Uint8Arrays).
 */

export function getValue(byteArray, bitOffset, bitLength) {
  if (bitLength === 0) return 0;
  const bits = toString(byteArray, 2).substring(
    bitOffset,
    bitOffset + bitLength
  );
  return parseInt(bits, 2);
}

export function setValue(byteArray, value, bitOffset, bitLength) {
  const bits = value.toString(2).padStart(bitLength, "0");
  let result = new Uint8Array(byteArray);
  for (let i = 0; i < bits.length; i++) {
    result = setSingleBit(result, bitOffset + i, parseInt(bits[i]));
  }
  return result;
}

export function setSingleBit(byteArray, bitOffset, value) {
  const byteIndex = Math.floor(bitOffset / 8);
  const bitInByte = bitOffset % 8;
  const mask = 1 << (7 - bitInByte);
  let result = new Uint8Array(byteArray);
  if (value === 1) {
    result[byteIndex] |= mask;
  } else {
    result[byteIndex] &= ~mask;
  }
  return result;
}

export function toString(byteArray, radix = 16) {
  const arr = Array.from(byteArray);
  switch (radix) {
    case "bin":
    case 2:
      return arr.map((byte) => byte.toString(2).padStart(8, "0")).join("");
    case "dec":
    case 10:
      return arr.map((item) => item.toString(10).padStart(3, "0")).join("");
    case "hex":
    case 16:
    default:
      return arr.map((item) => item.toString(16).padStart(2, "0")).join("");
  }
}

export function fromString(str, radix = 16) {
  const bytes = [];
  switch (radix) {
    case "bin":
    case 2:
      for (let i = 0; i < str.length; i += 8) {
        const byteStr = str.substring(i, i + 8).padEnd(8, "0");
        bytes.push(parseInt(byteStr, 2));
      }
      break;
    case "dec":
    case 10:
      for (let i = 0; i < str.length; i += 3) {
        const byteStr = str.substring(i, i + 3).padEnd(3, "0");
        bytes.push(parseInt(byteStr, 10));
      }
      break;
    case "hex":
    case 16:
    default:
      for (let i = 0; i < str.length; i += 2) {
        const byteStr = str.substring(i, i + 2).padEnd(2, "0");
        bytes.push(parseInt(byteStr, 16));
      }
      break;
  }
  return new Uint8Array(bytes);
}

export function subArray(array, startByte, length) {
  // Validate input parameters

  if (
    typeof startByte !== "number" ||
    startByte < 0 ||
    startByte >= array.length
  ) {
    throw new Error(
      "The startByte must be a non-negative integer within the bounds of the array."
    );
  }
  if (
    typeof length !== "number" ||
    length < 0 ||
    length > array.length - startByte
  ) {
    throw new Error(
      "The length must be a non-negative integer that does not exceed the remaining elements in the array starting from startByte."
    );
  }

  // Extract and return the subarray
  const result = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = array[startByte + i];
  }
  return result;
}
