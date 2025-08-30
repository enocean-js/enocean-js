import { getVdpProfile } from "./vdp-registry.js";

/**
 * The BindingManager is responsible for executing VDP actions based on
 * incoming data from physical devices. It listens for 'decoded-data' events
 * and triggers the appropriate bindings.
 */
class BindingManager {
  constructor(enocean, db) {
    this.eo = enocean;
    this.db = db;
    this.eo.on("decoded-data", this.handleDecodedData.bind(this));
  }

  /**
   * Handles incoming decoded data from a physical device.
   * @param {object} data The decoded data payload from the 'decoded-data' event.
   */
  handleDecodedData(data) {
    // We need to generate a unique source string for different actions from the same device.
    // For a rocker switch, this could be based on the button pressed.
    // This part will need to be made more generic as we add more device types.
    let sourceString;
    if (data.eep && data.eep.startsWith("f6-02")) {
      const button = Object.keys(data).find((k) => k.startsWith("R1"));
      const action = data.EB.value == 1 ? "pressed" : "released";
      console.log(action, data.EB.value);
      if (button) {
        // Normalize the ID to lowercase to prevent case-sensitivity issues.
        sourceString = `device:${data.id.toLowerCase()}:button:${
          data[button].value
        }:${action}`;
        //console.log("decoded", sourceString, data[button]);
      }
    }

    if (!sourceString) return;

    const source = { type: "device-event", event: sourceString };
    const binding = this.db.getBindingForSource(source);
    console.log(
      "Looking for binding for source:",
      sourceString,
      "Found:",
      binding
    );
    if (binding) {
      this.executeBinding(binding);
    }
  }

  /**
   * Executes the action defined in a binding.
   * @param {object} binding The binding object from the database.
   */
  executeBinding(binding) {
    consoleog("Executing binding:", binding);
    const { vdpId, action } = binding.destination;
    const vdp = this.db.getVdp(vdpId);
    if (!vdp) return;

    const profile = getVdpProfile(vdp.profileName);
    if (!profile || !profile.actions[action]) return;

    const currentState = vdp.state;
    const actionFn = profile.actions[action];
    const newState = actionFn(currentState);

    this.db.updateVdpState(vdpId, newState);
    this.eo.emit("vdp-updated", { id: vdpId, state: newState });
  }
}

export default BindingManager;
