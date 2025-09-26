import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
import "./prop.js";
import "./tab-group.js";

const apiClient = EnoceanJSElement.apiClient;
const utils = EnoceanJSElement.utils;

const deviceIconMap = {
  "f6-02-01": "switch",
  "a5-02-*": "thermometer",
  "a5-04-*": "dew_point",
  "a5-10-03": "thermostat",
  "d2-01-*": "smart_outlet",
  "d0-00-06": "battery_android_frame_full",
  "d0-00-*": "notifications_active",
  "*-*-*": "general_device",
};

function getDeviceIcon(eep) {
  const eepStr = (eep || "").toLowerCase();
  if (deviceIconMap[eepStr]) return deviceIconMap[eepStr]; // direct match first

  const parts = eepStr.split("-");
  const patterns = [`${parts[0]}-${parts[1]}-*`, `${parts[0]}-*-*`, `*-*-*`];
  for (const pattern of patterns) {
    if (deviceIconMap[pattern]) {
      return deviceIconMap[pattern];
    }
  }
  return undefined;
}
class EnoceanDevice extends EnoceanJSElement {
  constructor() {
    super();
    this.profile = {};
    this.last_telegram = JSON.stringify({
      data: { data: { name: "foo", type: "bar" } },
    });
  }
  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    .device {
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
      margin: 10px;
      border-radius: 10px;
    }
    .data {
      padding: 10px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px;
      border-radius: 10px 10px 0 0;
      display: flex;
      gap: 10px;
      font-weight: bold;
      font-size: 1.2em;
      background: #38a;
      color: white;
    }
    .header.new {
      background: #3a8;
    }
    .info {
      font-size: 0.8em;
      align-self: center;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 10px;
      border-radius: 0 0 10px 10px;
      font-size: 0.7em;
      color: #888;
      text-align: right;
    }
    .delete {
      cursor: pointer;
      color: #f44;
    }
    #name {
      font-size: 1em;
      font-weight: bold;
      border: none;
      background: transparent;
      color: white;
      width: 100%;
    }
    #name:focus {
      outline: none;
    }
    .new-device {
      border: 2px dashed var(--color-accent, #4caf50);
    }
    .input {
      color: var(--color-accent, #23ecf3ff);
    }
    .output {
      color: var(--color-accent2, #e9993fff);
    }
    .outid {
      color: goldenrod;
    }
    .inid {
      color: seagreen;
    }
  `;
  static properties = {
    profile: { type: String },
    name: { type: String },
    eep: { type: String },
    id: { type: String },
    com_type: { type: String },
    output_eep: { type: String },
    output_id: { type: String },
    direction: { type: Number },
    rssi: { type: Number },
    manufacturer: { type: String },
    device: { type: Object },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_known = apiClient.on("device-data", (event) => {
      if (event.input_id == this.device.id) {
        let eep = this.device.eeps.find(
          (eep) => eep.input_eep === event.input_eep
        );
        eep.profile = JSON.stringify(event.profile);
        this.rssi = event.signalStrength;
        this.requestUpdate();
      }
    });
  }

  async setName(e) {
    const newName = e.target.value;
    await apiClient.setDeviceName(
      this.direction === 1 ? this.id : this.output_id,
      newName
    );
    this.name = newName;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe_known(); // unsubscribe
  }

  deleteDevice() {
    const id = this.direction == 1 ? this.id : this.output_id;
    const eep = this.direction == 1 ? this.eep : this.output_eep;
    return async () => {
      if (confirm(`Are you sure to delete device ${id} (${eep})?`)) {
        await apiClient.removeDevice(id, eep);
        this.dispatchEvent(
          new CustomEvent("deleted", {
            detail: { id: id, eep: eep, device: this },
            bubbles: true,
            composed: true,
          })
        );
      }
    };
  }

  render() {
    const regularDeviceEEPs = this.device.eeps.filter(
      (eep) => eep.input_rorg !== "d0"
    );
    const signals = this.device.eeps.filter((eep) => eep.input_rorg === "d0");

    return html` <div class="device ">
      <div
        class="header ${this.device.eeps[0]?.name == "New Device"
          ? "new"
          : ""} "
      >
        <input
          id="name"
          type="text"
          @change="${this.setName}"
          value="${this.device.eeps[0]?.name}"
        />
        ${this.device.direction == 1
          ? html`<material-icon
              icon="signal_cellular_${utils.erp1.getSignalQualityRating(
                this.device.eeps[0].rssi
              )}_bar"
              title="${this.device.eeps[0].rssi}%"
            ></material-icon>`
          : ""}
        <material-icon
          icon="${this.device.eeps[0].com_type == "bidi"
            ? "swap_vert"
            : this.device.direction == 1
            ? "arrow_downward"
            : "arrow_upward"}"
          class="${this.device.direction == 1 ? "input" : "output"}"
        ></material-icon>

        <material-icon
          icon="delete"
          class="delete"
          @click="${this.deleteDevice()}"
        ></material-icon>
      </div>
      <enocean-tab-group
        .tabs="${[
          ...regularDeviceEEPs.map((eep) => {
            let eepstr = eep.direction === 1 ? eep.input_eep : eep.output_eep;
            const profile = JSON.parse(eep.profile || "{}");
            let channels = [];
            if (profile.channels) {
              channels = profile.channels;
            } else {
              channels = [profile];
            }
            return {
              label: eepstr,
              icon: getDeviceIcon(eepstr),
              content: html`<div class="data">
                ${channels.map((ch, index) => {
                  return html`<div>
                    ${channels.length == 1
                      ? ""
                      : html`<div>Channel ${index + 1}</div>`}
                    ${ch.props.map(
                      (prop) => html` <enocean-prop
                        .prop="${prop}"
                        deviceId="${eep.input_id}"
                        eep="${eep.input_eep}"
                        output_id="${eep.output_id}"
                        output_eep="${eep.output_eep}"
                        channel="${index + 1}"
                      ></enocean-prop>`
                    )}
                  </div>`;
                })}
              </div>`,
            };
          }),
          ...signals.map((eep) => {
            return {
              label: eep.input_eep,
              icon: getDeviceIcon(eep.input_eep),
              content: html`${eep.input_eep}`,
            };
          }),
        ]}"
      >
      </enocean-tab-group>
      <div class="footer">
        <div>${this.device.eeps[0].manufacturer}</div>
        <div>
          ${this.device.eeps[0].com_type == "bidi"
            ? html`<span class="outid"
                >${this.device.eeps[0].output_id} ·
              </span>`
            : ""}
          ${this.device.direction == 1
            ? html`<span class="inid">${this.device.eeps[0].input_id}</span> ·
                ${this.eep}`
            : html`<span class="outid">${this.device.eeps[0].output_id}</span> ·
                ${this.device.eeps[0].output_eep}`}
        </div>
      </div>
    </div>`;
  }
}
customElements.define("enocean-device", EnoceanDevice);

// ${regularDeviceEEPs.length <= 0
//         ? ""
//         : regularDeviceEEPs.map((eep) => {
//             const channels = eep.channels || [];
//             return html`
//               <div class="data tab">
//                 ${channels.map((ch, index) => {
//                   return html`<div>
//                     ${channels.length == 1
//                       ? ""
//                       : html`<div>Channel ${index + 1}</div>`}
//                     ${ch.props.map(
//                       (prop) => html`<enocean-prop
//                         .prop="${prop}"
//                         deviceId="${this.id}"
//                         eep="${this.eep}"
//                         output_id="${this.output_id}"
//                         output_eep="${this.output_eep}"
//                         channel="${index + 1}"
//                       ></enocean-prop>`
//                     )}
//                   </div>`;
//                 })}
//               </div>
//             `;
//           })}
