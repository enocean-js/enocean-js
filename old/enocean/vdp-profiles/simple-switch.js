/**
 * VDP Definition for a simple switch.
 *
 * This profile represents a logical switch with a binary state (on/off).
 * It defines the initial state and the actions that can be performed on it.
 */
export const simpleSwitch = {
  profileName: "simple-switch",
  initialState: { isOn: false },
  actions: {
    /**
     * Sets the state to ON.
     * @param {object} state The current state.
     * @returns {object} The new state.
     */
    on: (state) => ({ ...state, isOn: true }),

    /**
     * Sets the state to OFF.
     * @param {object} state The current state.
     * @returns {object} The new state.
     */
    off: (state) => ({ ...state, isOn: false }),

    /**
     * Toggles the state.
     * @param {object} state The current state.
     * @returns {object} The new state.
     */
    toggle: (state) => ({ ...state, isOn: !state.isOn }),
  },
};
