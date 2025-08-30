/**
 * A central registry for VDP (Virtual Device Profile) definitions.
 * This allows for dynamically adding new VDP types at runtime.
 */
const vdpProfileRegistry = new Map();

/**
 * Registers a new VDP definition.
 * @param {object} profile The VDP definition object.
 */
export function registerVdpProfile(profile) {
  if (!profile || !profile.profileName) {
    throw new Error("Invalid VDP profile: must have a profileName property.");
  }
  vdpProfileRegistry.set(profile.profileName, profile);
}

/**
 * Retrieves a VDP definition from the registry.
 * @param {string} profileName The name of the profile to retrieve.
 * @returns {object} The VDP definition object.
 */
export function getVdpProfile(profileName) {
  if (!vdpProfileRegistry.has(profileName)) {
    throw new Error(`VDP profile '${profileName}' is not registered.`);
  }
  return vdpProfileRegistry.get(profileName);
}
