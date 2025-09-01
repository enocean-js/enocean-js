# Architectural Plan: An Engine for High-Level Applications

This document outlines the architecture for `enocean-js`, designed to serve as a powerful protocol engine for high-level applications like an ioBroker adapter.

## I. Core Philosophy: Executable EEP Modules

The core idea is a shift from a central, complex interpreter of declarative data to a collection of simple, self-contained **Executable EEP Modules**.

Each EEP will be a JavaScript module that exports a standard interface:

1.  **`meta`**: Static, human-readable metadata.
2.  **`profile()`**: A function that returns a machine-readable description of the device's capabilities (events, states, actions, data types, units).
3.  **`decode(payloadBuffer)`**: A function that directly parses a raw payload and returns a simple, structured JavaScript object.
4.  **`encode(dataObject, telegramBuilder)`**: A function that takes a simple JavaScript object and uses a builder utility to construct the raw payload for transmission.

This approach offers superior simplicity, flexibility, testability, and performance. The logic for an EEP is explicit, co-located, and easy to maintain.

## II. The Engine's Public API

The engine will expose a clean, high-level API for the application to use:

- `startTeachInMode()`: Initiates learn mode.
- `getProfileDescription(eep)`: Returns the structured JSON object from the EEP module's `profile()` function.
- `createVirtualDevice({ eep })`: Creates a new virtual device and returns its `senderId` and profile description.
- `sendCommand(deviceId, dataObject)`: Sends a command to a physical or virtual device.
- `on(eventName, callback)`: The engine will be an `EventEmitter`, emitting high-level semantic events like `device:learned`, `device:event`, and `device:reading`.

## III. Use Case Implementation

The application flow remains the same as previously defined, but the internal implementation becomes much simpler and more robust.

### Example: Integrating a Physical Button

1.  **Adapter:** Calls `eo.startTeachInMode()`.
2.  **Engine:** Emits `device:learned` with `{ id, eep: 'f6-02-01' }`.
3.  **Adapter:** Calls `eo.getProfileDescription('f6-02-01')`.
4.  **Engine:** Dynamically imports the `f6-02-01.js` module and returns the result of its `profile()` function.
5.  **Adapter:** Uses the profile to create ioBroker states.
6.  **Engine:** When a new packet arrives, it imports the `f6-02-01.js` module, calls its `decode()` function, and uses the result to generate and emit a semantic event (e.g., `device:event` with `{ deviceId, event: 'button:ai:pressed' }`).
7.  **Adapter:** Listens for the event and updates its state.

### Example: Sending a Command to a Virtual Switch

1.  **Adapter:** Calls `eo.sendCommand(senderId, { button: 'ai', action: 'pressed' })`.
2.  **Engine:** Looks up the virtual device to find its EEP (`f6-02-01`). It imports the `f6-02-01.js` module, creates a `TelegramBuilder` instance, and calls the module's `encode()` function with the data object. The `encode()` function uses the builder to construct the final payload, which the engine then transmits.

## IV. Implementation Roadmap

1.  **Create Core Utilities:**
    - Create a `packages/utils` module.
    - Implement a robust `TelegramBuilder` class for low-level bit/byte manipulation.
    - Move pure logic like the `mapValue` scaling function into this package.
2.  **Refactor EEPs to Executable Modules:**
    - Convert key EEP files (`f6-02-01`, `a5-02-05`, `d2-01-0e`, etc.) to the new standard module format.
    - Each module will implement the `meta`, `profile`, `decode`, and `encode` exports.
3.  **Rewrite the Core Engine Logic:**
    - Delete the old, complex `eep-transcoder.js` interpreter.
    - Modify the main `enocean.js` `onPacket` handler to dynamically import the correct EEP module and call its `decode()` function.
    - Implement the `sendCommand` function to import the EEP module and call its `encode()` function.
4.  **Implement the Public API:**
    - Implement `getProfileDescription` to call the EEP module's `profile()` function.
    - Build the Virtual Device API (`createVirtualDevice`, etc.).
