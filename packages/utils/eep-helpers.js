/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

export function checkAndThrow(payload, expectedLength) {
  if (!payload) throw new Error("No payload");
  if (payload.byteLength !== expectedLength)
    throw new Error(
      `Invalid payload length: expected ${expectedLength}, got ${payload.byteLength}`
    );
}
