import {
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";

const apiClient = EnoceanJSElement.apiClient;

class EnoceanMonitor extends EnoceanJSElement {
  constructor() {
    super();
    this.lines = [{ text: "Monitor started", type: "info" }];
  }
  static properties = {
    lines: { type: Array },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_unknown = apiClient.on("unknown-device", (event) => {
      this.printLine(
        html`[<span class="unknown-device">${event.input_id}</span>]
          ${this.utils.toString(event.raw)}`,
        "unknown-device"
      );
    });
    this.unsubscribe_known = apiClient.on("device-data", (event) => {
      const channel =
        event.profile.channel !== undefined
          ? event.profile.channels
          : [event.profile];
      console.log(event, channel);
      this.printLine(
        html`[<span class="known-device">${event.name}</span>]
          ${channel.map(
            (prop) =>
              html`<span class="key">${prop.name}</span> =
                <span
                  class="value ${prop.type} 
                    ${prop.value == true ? "true" : "false"}"
                  >${prop.value}</span
                >`
          )}
          (${event.eep})`,
        "known-device"
      );
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe_unknown(); // unsubscribe
    this.unsubscribe_known(); // unsubscribe
  }
  printLine(text, type = "info") {
    const new_lines = [...this.lines];
    new_lines.push({ text, type });
    if (new_lines.length > 100) {
      new_lines.shift();
    }
    this.lines = new_lines;
  }
  static styles = css`
    :host {
      display: block;
    }
    .line {
      padding-top: 2px;
      color: #ddd;
      font-family: monospace;
    }
    .known-device,
    .value.boolean.true {
      color: var(--color-accent, #4caf50);
    }
    .unknown-device {
      color: var(--color-danger, #0e70c0ff);
    }
    .known-device-no-eep,
    .value.boolean.false {
      color: var(--color-danger, #f44336);
    }
    .key {
      color: var(--color-key, #0e70c0ff);
    }
    .value {
      color: var(--color-value, #03a9f4);
    }
    #container {
      padding: 10px;
      height: 80vh;
      overflow: scroll;
      background: var(--color-background, #333);
    }
  `;

  render() {
    const reversed = [...this.lines].reverse();
    return html`<div id="container">
      <div id="content">
        ${reversed.map((line) => html`<div class="line">> ${line.text}</div>`)}
      </div>
    </div>`;
  }
}
customElements.define("enocean-monitor", EnoceanMonitor);
