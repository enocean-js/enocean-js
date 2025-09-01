import express from "express";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export class RockerSwitch {
  constructor(eo) {
    this.eo = eo;
    this.name = "rocker-switch";
    this.router = express.Router({ mergeParams: true });

    this.router.post("/buttons/:buttonName/click", this.handleClick.bind(this));
    this.router.post("/buttons/:buttonName/press", this.handlePress.bind(this));
    this.router.post(
      "/buttons/:buttonName/release",
      this.handleRelease.bind(this)
    );
    this.router.post(
      "/buttons/:buttonName/press_for",
      this.handlePressFor.bind(this)
    );
  }

  // --- Route Handlers (Public Interface) ---

  async handleClick(req, res) {
    try {
      await this.sendButtonAction(
        req.params.id,
        req.params.buttonName,
        "press"
      );
      await delay(100);
      await this.sendButtonAction(
        req.params.id,
        req.params.buttonName,
        "release"
      );
      res.status(202).json({ message: "Click action sent" });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }

  async handlePress(req, res) {
    try {
      await this.sendButtonAction(
        req.params.id,
        req.params.buttonName,
        "press"
      );
      res.status(202).json({ message: "Press action sent" });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }

  async handleRelease(req, res) {
    try {
      await this.sendButtonAction(
        req.params.id,
        req.params.buttonName,
        "release"
      );
      res.status(202).json({ message: "Release action sent" });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }

  async handlePressFor(req, res) {
    const duration = parseInt(req.body.duration, 10);
    if (isNaN(duration) || duration <= 0) {
      return res
        .status(400)
        .json({ error: "A positive 'duration' in milliseconds is required." });
    }
    try {
      await this.sendButtonAction(
        req.params.id,
        req.params.buttonName,
        "press"
      );
      setTimeout(() => {
        this.sendButtonAction(
          req.params.id,
          req.params.buttonName,
          "release"
        ).catch(console.error);
      }, duration);
      res.status(202).json({
        message: `Press action sent, release scheduled in ${duration}ms.`,
      });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }

  // --- Internal Logic (Private Helpers) ---

  _getPayloadForAction(eep, action, buttonName) {
    const upperButtonName = buttonName.toUpperCase();
    switch (eep.toLowerCase()) {
      case "f6-02-01":
      case "f6-02-02": {
        const payload = {};
        switch (upperButtonName) {
          case "AI":
            payload.R1 = 0;
            break;
          case "A0":
            payload.R1 = 1;
            break;
          case "BI":
            payload.R1 = 2;
            break;
          case "B0":
            payload.R1 = 3;
            break;
          default:
            throw new Error(
              `Invalid button name '${buttonName}' for EEP ${eep}.`
            );
        }
        payload.EB = action === "press" ? 1 : 0;
        return payload;
      }
      case "f6-02-03": {
        if (action === "release") return { RA: 0 };
        switch (upperButtonName) {
          case "AI":
            return { RA: 16 };
          case "A0":
            return { RA: 48 };
          case "BI":
            return { RA: 80 };
          case "B0":
            return { RA: 112 };
          default:
            throw new Error(
              `Invalid button name '${buttonName}' for EEP ${eep}.`
            );
        }
      }
      case "f6-02-04": {
        const payload = { RAI: 0, RA0: 0, RBI: 0, RB0: 0 };
        if (action === "press") {
          switch (upperButtonName) {
            case "AI":
              payload.RAI = 1;
              break;
            case "A0":
              payload.RA0 = 1;
              break;
            case "BI":
              payload.RBI = 1;
              break;
            case "B0":
              payload.RB0 = 1;
              break;
            default:
              throw new Error(
                `Invalid button name '${buttonName}' for EEP ${eep}.`
              );
          }
        }
        payload.EBO = action === "press" ? 1 : 0;
        return payload;
      }
      case "f6-01-01": {
        return { PB: action === "press" ? 1 : 0 };
      }
      default:
        throw new Error(
          `The EEP '${eep}' is not supported by the RockerSwitch profile.`
        );
    }
  }

  async sendButtonAction(deviceId, buttonName, action) {
    const device = await this.eo.getVirtualDevice(deviceId);
    if (!device) throw new Error("Virtual device not found");
    const payload = this._getPayloadForAction(device.eep, action, buttonName);
    await this.eo.send(device.senderId, payload, { eep: device.eep });
  }
}
