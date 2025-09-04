/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

/**
 * Decodes a raw numeric value into a string key by finding which range it falls into.
 * @param {number} rawValue The numeric value to decode.
 * @param {object} rangeMap An object where keys are strings and values are [min, max] arrays.
 * @returns {string|null} The string key corresponding to the range, or null if not found.
 */
export function decodeValueFromRangeMap(rawValue, rangeMap) {
  for (const [key, range] of Object.entries(rangeMap)) {
    if (rawValue >= range[0] && rawValue <= range[1]) {
      return key;
    }
  }
  return null;
}

/**
 * Encodes a string key into a representative numeric value from its range.
 * It typically returns the middle value of the range.
 * @param {string} key The string key to encode.
 * @param {object} rangeMap An object where keys are strings and values are [min, max] arrays.
 * @param {number} [defaultValue=null] The default numeric value to return if the key is not found in the map.
 * @returns {number|null} The representative numeric value, or the default value.
 */
export function encodeValueFromRangeMap(key, rangeMap, defaultValue = null) {
  const range = rangeMap[key];
  if (range) {
    return Math.round((range[0] + range[1]) / 2);
  }
  return defaultValue;
}
