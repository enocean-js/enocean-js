# EEP Module Format Specification

This document outlines the structure and conventions for the new executable EEP (EnOcean Equipment Profile) modules within the `enocean-js` project. These modules replace the old declarative JSON format with functional JavaScript modules, providing greater flexibility and power.

## File Structure

Each EEP is defined in its own file within the `packages/eep-transcoder/eep-next/` directory. The filename directly corresponds to the EEP identifier.

- **Naming Convention:** `<rorg>-<func>-<type>.js` (e.g., `a5-09-0b.js`)

## Module Structure

Each EEP module is a standard ES module that exports a single default object. This object contains all the logic and metadata for a specific EEP.

```javascript
import { ByteArray } from '@enocean-js/byte-array'
import { encodeA5TeachIn } from '../utils/teach-in.js'
import { scale } from '../utils/scale.js'

export default {
  // Metadata
  meta: { ... },

  // Device Profile
  profile: () => ({ ... }),

  // Decoding Logic
  decode: (payload) => ({ ... }),

  // Encoding Logic
  encode: (data) => ( ... ),

  // Teach-in Logic
  teachIn: (eep) => ( ... )
}
```

---

### 1. `meta` Object

The `meta` object contains static, descriptive information about the EEP.

- **Properties:**
  - `eep` (string): The full EEP identifier (e.g., "a5-09-0b").
  - `rorg` (string): The RORG of the telegram (e.g., "a5").
  - `func` (string): The FUNC of the telegram (e.g., "09").
  - `type` (string): The TYPE of the telegram (e.g., "0b").
  - `title` (string): A human-readable title for the EEP (e.g., "Radioactivity Sensor").
  - `status` (string, optional): The release status, e.g., "released".

---

### 2. `profile` Function

The `profile` function describes the capabilities of the device. This information is primarily intended for use by front-ends or integrations to dynamically generate UI or understand what data to expect.

- **Function Signature:** `profile()`
- **Returns:** An object describing the device's data points.

#### Common Profile Patterns

**a) For Sensors (Stateful Data):**
This is the most common pattern, used for devices that report sensor readings. For fields that may not always be present in the decoded payload (based on availability bits), mark them with `optional: true`.

```javascript
profile: () => ({
  type: "sensor",
  readings: [
    { name: "temperature", type: "number", unit: "°C" }, // Mandatory field
    { name: "humidity", type: "number", unit: "%", optional: true }, // Optional field
    { name: "voltage", type: "number", unit: "V", optional: true },
  ],
});
```

**b) For Actuators/Events (Stateless Data):**
Used for devices like switches. The schema is consistent with sensors, using a `readings` array. The `type` property, such as "boolean", indicates an event or state change.

```javascript
profile: () => ({
  type: "rocker-switch",
  readings: [
    { name: "Button A0", type: "boolean" },
    { name: "Button A1", type: "boolean" },
    { name: "Button B0", type: "boolean" },
    { name: "Button B1", type: "boolean" },
  ],
});
```

---

### 3. `decode` Function

The `decode` function is responsible for parsing an incoming raw telegram payload into a structured JavaScript object.

- **Function Signature:** `decode(payload)`
  - `payload` (Buffer | ByteArray): The raw 4-byte data payload.
- **Returns:** A JavaScript object with the decoded values, or `null`/`false` if the payload is invalid.

#### Implementation Details:

1.  **Payload Validation:** Always check if the payload exists and has the expected length. The expected length depends on the RORG:
    - **1BS (`f6`, `d5`):** 1 byte payload.
    - **4BS (`a5`):** 4 bytes payload.
    - **VLD (`d2`):** Variable length payload.
2.  **Teach-in Handling:** The first step in `decode` should be to check if the telegram is a teach-in telegram. For all standard ERP1 telegrams (like RORG `f6`, `d5`, `a5`, `d2`), this is determined by the learn bit (bit 3 of the first data byte). A value of `0` indicates a teach-in telegram.
    ```javascript
    const data = new ByteArray(payload)
    const learnBit = data.getValue(3, 1) === 0 // For RORG F6, D5 etc.
    // For RORG A5 (4BS) it's at a different bit offset
    // const learnBit = data.getValue(28, 1) === 0
    if (learnBit) {
      // Handle teach-in separately if needed, or just return it
      return { learnBit: true, ... }
    }
    ```
3.  **Data Extraction:** Use `payload.getValue(bitOffset, bitLength)` to extract data fields.
4.  **Handling Availability:** For sensors with optional fields, check the corresponding availability bit before attempting to decode the value.
    ```javascript
    let temperature = null
    const tempAvailable = payload.getValue(30, 1) === 1
    if (tempAvailable) {
      temperature = scale(...)
    }
    ```
5.  **Value Scaling:** Use the `scale` utility for linear conversions.
    ```javascript
    // scale(value, [rawMin, rawMax], [scaledMin, scaledMax])
    const temperature = scale(payload.getValue(16, 8), [0, 255], [-20, 60]);
    ```
6.  **Return Object:** The returned object should contain the decoded values with clear keys.

---

### 4. `encode` Function

The `encode` function performs the reverse of `decode`, converting a structured JavaScript object into a `ByteArray` ready for transmission.

- **Function Signature:** `encode(data)`
  - `data` (object): An object containing the values to encode.
- **Returns:** A `ByteArray` instance.

#### Implementation Details:

1.  **Payload Initialization:** Create a new `ByteArray` of the correct size, usually 4 bytes.
    ```javascript
    const payload = new ByteArray(4);
    ```
2.  **Set Data Telegram Bit:** For data telegrams, the learn bit must be set to `1`.
    ```javascript
    payload.setValue(1, 28, 1);
    ```
3.  **Value Scaling & Setting:** Scale the input values back to their raw integer representation and write them to the payload using `payload.setValue(value, bitOffset, bitLength)`.
4.  **Handling Optional Data:** Check for the existence of properties in the input `data` object before encoding them. Set availability bits accordingly.
    ```javascript
    if (typeof data.temperature === "number") {
      payload.setValue(1, 30, 1); // Set temperature availability bit
      const rawTemp = Math.round(scale(data.temperature, [-20, 60], [0, 255]));
      payload.setValue(rawTemp, 16, 8);
    }
    ```
5.  **Handling Complex Cases:**
    - **Dual-Range Sensors (`A5-06-xx`):** The `encode` function may need to automatically select the correct range and set the range selector bit based on the input value.
    - **Scale Multipliers (`A5-09-05`):** The `encode` function should find the appropriate multiplier from an enum to represent the value with the best precision and set the corresponding bits.

---

### 5. `teachIn` Function

The `teachIn` function is a dedicated method to generate a teach-in telegram for the device.

- **Function Signature:** `teachIn(eep)`
- **Returns:** A `ByteArray` instance representing the teach-in telegram.
- **Implementation:** For standard 4BS teach-ins, this is a simple wrapper around the `encodeA5TeachIn` utility.

  ```javascript
  import { encodeA5TeachIn } from "../utils/teach-in.js";

  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  };
  ```

  This utility handles the creation of the correct 4-byte payload with the learn bit set to `0` and the EEP profile embedded.

---

### 6. Advanced: Handling Configurable Devices

Some devices have behaviors that can be configured (e.g., a setpoint's range). The EEP module should declaratively expose these configuration options so that any application using the library can dynamically build a UI for them.

#### Workflow:

1.  **Module Exposes Config:** The `profile()` function returns a static blueprint that includes a `config` array. This array describes each configurable parameter, its type, and a default value.
2.  **Engine Stores User Settings:** The main `enocean-js` engine can use this blueprint to present configuration options to the user. It then stores the user's chosen settings (e.g., `{ "setPointCenter": 22 }`) in its database for that specific device.
3.  **Engine Passes Resolved Config:** At runtime, when calling `decode` or `encode`, the engine passes the stored, user-defined settings. The EEP module then uses these settings to perform the correct translation.

#### Implementation Example (`a5-10-01`):

**a) `profile` function:**
The `profile` function is static and declaratively lists the configurable parameters.

```javascript
profile() {
  return {
    type: "room-operating-panel",
    readings: [
      { name: "temperature", type: "number", unit: "°C" },
      { name: "setPoint", type: "number", unit: "°C" },
      // ...
    ],
    config: [
      { name: "setPointCenter", type: "number", unit: "°C", default: 20 },
      { name: "setPointOffset", type: "number", unit: "K", default: 4 }
    ]
  };
}
```

**b) `decode` and `encode` functions:**
These functions receive the resolved configuration from the engine. They should still have robust defaults in case no config is passed.

```javascript
decode(payload, config = {}) {
  // ...
  const { setPointCenter = 20, setPointOffset = 4 } = config;
  const setPointMin = setPointCenter - setPointOffset;
  const setPointMax = setPointCenter + setPointOffset;

  const setPoint = parseFloat(
    scale(data.getValue(8, 8), [0, 255], [setPointMin, setPointMax]).toFixed(1)
  );
  // ...
  return { setPoint, ... };
}

encode(data, config = {}) {
  // ...
  const { setPointCenter = 20, setPointOffset = 4 } = config;
  const setPointMin = setPointCenter - setPointOffset;
  const setPointMax = setPointCenter + setPointOffset;

  if (typeof data.setPoint === "number") {
    const rawSetPoint = Math.round(
      scale(data.setPoint, [setPointMin, setPointMax], [0, 255])
    );
    payload.setValue(rawSetPoint, 8, 8);
  }
  // ...
}
```
