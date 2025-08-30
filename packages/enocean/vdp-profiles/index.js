import { registerVdpProfile } from "../vdp-registry.js";
import { simpleSwitch } from "./simple-switch.js";

// Automatically register all built-in VDPs when this module is imported.
registerVdpProfile(simpleSwitch);
