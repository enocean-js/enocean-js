import { SIGNAL } from "@enocean-js/utils";
import { mkdirSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import os from "os";
const customEEPFolder = join(os.homedir(), `.enocean-js/eep/custom`);
const overwriteEEPFolder = join(os.homedir(), `.enocean-js/eep/overwrite`);
mkdirSync(customEEPFolder, { recursive: true });
mkdirSync(overwriteEEPFolder, { recursive: true });

const __dirname = dirname(fileURLToPath(import.meta.url));

export class ProfileManager {
  constructor() {
    this.EEP = {};
  }
  static getInstance = async () => {
    if (!ProfileManager._instance) {
      ProfileManager._instance = new ProfileManager();
      await ProfileManager._instance.init();
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
  async init() {
    await this.loadEEPFromDisc(join(__dirname, "eep"));
    await this.loadEEPFromDisc(join(os.homedir(), ".enocean-js/eep/custom"));
    await this.loadEEPFromDisc(
      join(os.homedir(), ".enocean-js/eep/overwrite"),
      true
    );
  }
  async loadEEPFromDisc(folder, overwrite = false) {
    console.log(folder);
    const files = readdirSync(folder).filter((f) => f.endsWith(".js"));
    await Promise.all(
      files.map(async (file) => {
        const mod = await import(join(folder, file));
        if (!mod.meta || !mod.meta.eep) {
          console.error("EEP module does not have meta.eep property.");
          return;
        }
        if (this.EEP[mod.meta.eep] && !overwrite) {
          console.warn("EEP module already loaded.", mod.meta.eep);
          return;
        }
        this.EEP[mod.meta.eep] = mod.SPEC;
      })
    );
  }
}
