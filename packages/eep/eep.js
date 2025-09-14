import { SIGNAL } from "@enocean-js/utils";
import { readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export class ProfileManager {
  constructor() {
    this.EEP = {};
  }
  static getInstance = async () => {
    if (!ProfileManager._instance) {
      ProfileManager._instance = new ProfileManager();
      await ProfileManager._instance.loadEEPFromDisc();
    }
    return ProfileManager._instance;
  };
  static _instance = null;

  getEEP(eep) {
    if (eep.split("-")[0] === "d0") {
      return SIGNAL[eep];
    } else {
      return this.EEP[eep];
    }
  }
  async loadEEPFromDisc() {
    const files = readdirSync(join(__dirname, "eep")).filter((f) =>
      f.endsWith(".js")
    );
    await Promise.all(
      files.map(async (file) => {
        const mod = await import(`./eep/${file}`);
        if (!mod.meta || !mod.meta.eep) {
          console.error("EEP module does not have meta.eep property.");
          return;
        }
        if (this.EEP[mod.meta.eep]) {
          console.warn("EEP module already loaded.", mod.meta.eep);
          return;
        }
        this.EEP[mod.meta.eep] = mod.SPEC;
      })
    );
  }
}
