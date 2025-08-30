// Import Lit from CDN
import {
  LitElement,
  html,
  css,
  choose,
  unsafeHTML,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { ESP3Packet, toHex, RadioERP1, getRorgTitle } from "../enocean.js";
class MyLogger extends LitElement {
  constructor() {
    super();
    this.lines = ["Logger initialized"];
  }
  static styles = css`
    :host {
    }
    #container {
      witdth: 100%;
      height: 100%;
      overflow: scroll;
      display: block;
      position: relative;
    }
    .line {
      font-family: monospace;
      font-size: 15px;
    }
    .symbol {
      font-family: "Material Symbols Rounded";
      font-weight: normal;
      font-style: normal;
      font-size: 15px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: "liga";
      -webkit-font-smoothing: antialiased;
      width: 15px;
      height: 15px;
      color: #ddd;
      box-sizing: border-box;
    }

    .line-content {
      color: #ddd;
    }
    .telegram {
    }
    .sync_byte,
    .crc {
      color: #555;
    }
    .bracket {
      color: #ddd;
    }
    .sender_id,
    .destination_id {
      font-weight: bold;
      color: #dbad00;
    }
    .rorg {
      color: violet;
    }
    .dot {
      color: #063b72;
    }
    .data_length,
    .bracket.data {
      color: turquoise;
    }
    .optional_length,
    .bracket.optional_data {
      color: #f0a;
    }
    .payload {
      color: limegreen;
    }
    .packet_type {
      color: #539e43;
    }
    .bracket.header {
      color: #555;
    }
    .security_level {
      color: firebrick;
    }
    .sub_tel_num {
      color: darkolivegreen;
    }
    .status {
      color: darkolivegreen;
    }
    .rssi {
      color: lightseagreen;
    }
  `;
  static properties = {
    lines: { type: Array },
  };
  log(x, lineType = "none") {
    this.lines = [...this.lines, { content: x, type: lineType }];
    if (this.lines.length > 100) {
      this.lines.shift(); // Keep the last 100 lines
    }
    //this.requestUpdate();
  }
  success(x) {
    this.log(x, "success");
  }
  warn(x) {
    this.log(x, "warn");
  }
  error(x) {
    this.log(x, "error");
  }
  info(x) {
    this.log(x, "info");
  }
  packet(x) {
    const packet = ESP3Packet.from(x);
    this.log(
      html`<span class="sync_byte">55</span><span class="dot">.</span
        ><span class="bracket header">[</span
        ><span class="header data_length">${toHex(packet.dataLength, 4)}</span
        ><span class="dot">.</span
        ><span class="optional_length header"
          >${toHex(packet.optionalLength)}</span
        ><span class="dot">.</span
        ><span class="packet_type header">${toHex(packet.packetType)}</span
        ><span class="header bracket">]</span><span class="dot">.</span
        ><span class="crc">${toHex(packet.crc8Header)}</span
        ><span class="dot">.</span
        ><span
          >${packet.packetType === 1
            ? this.renderERP1Data(packet)
            : toHex(packet.data, packet.dataLength * 2)}</span
        ><span class="dot">.</span
        ><span
          >${packet.packetType === 1
            ? this.renderERP1OptionalData(packet)
            : toHex(packet.optionalData, packet.optionalLength * 2)}</span
        ><span class="dot">.</span
        ><span class="crc">${toHex(packet.crc8Data)}</span>`,
      "packet"
    );
  }
  renderERP1Data(packet) {
    const radio = RadioERP1.from(packet.toString());
    console.log(getRorgTitle(radio.RORG.toString(16).toUpperCase()));
    return html`<span class="bracket data">[</span
      ><span class="rorg">${toHex(radio.RORG)}</span><span class="dot">.</span
      ><span class="payload"
        >${toHex(radio.payload, radio.payload.length * 2)}</span
      ><span class="dot">.</span
      ><span class="sender_id">${toHex(radio.senderId, 4)}</span
      ><span class="dot">.</span
      ><span class="status">${toHex(radio.status)}</span
      ><span class="bracket data">]</span>`;
  }
  renderERP1OptionalData(packet) {
    const radio = RadioERP1.from(packet.toString());
    console.log(radio);
    return html`<span class="bracket optional_data">[</span
      ><span class="sub_tel_num">${toHex(radio.subTelNum)}</span
      ><span class="dot">.</span
      ><span class="destination_id">${toHex(radio.destinationId, 4)}</span
      ><span class="dot">.</span><span class="rssi">${toHex(radio.RSSI)}</span
      ><span class="dot">.</span
      ><span class="security_level">${toHex(radio.securityLevel)}</span
      ><span class="bracket optional_data">]</span>`;
  }
  // 55.0007.07.01.7a.f630002b7cac31.00ffffffff4100.33
  render() {
    return html`<div id="container">
      <div style="position:absolute;bottom:10px;">
        ${this.lines.map(
          (item) =>
            html`<div class="line">
              ${choose(item.type, [
                [
                  "none",
                  () =>
                    html`<span class="symbol">&nbsp;</span
                      ><span class="line-content">${item.content}</span>`,
                ],
                [
                  "info",
                  () =>
                    html`<span class="symbol" style="color:lightblue">info</span
                      ><span class="line-content">${item.content}</span>`,
                ],
                [
                  "error",
                  () =>
                    html`<span class="symbol" style="color:red">!</span
                      ><span class="line-content">${item.content}</span>`,
                ],
                [
                  "warn",
                  () =>
                    html`<span class="symbol" style="color:orange">⚠️</span
                      ><span class="line-content">${item.content}</span>`,
                ],
                [
                  "success",
                  () =>
                    html`<span class="symbol" style="color:green">check</span
                      ><span class="line-content">${item.content}</span>`,
                ],
                [
                  "packet",
                  () =>
                    html`<span class="symbol" style="color:green">&nbsp;</span
                      ><span class="line-content">${item.content}</span>`,
                ],
              ])}
            </div>`
        )}
      </div>
    </div>`;
  }
}

customElements.define("my-logger", MyLogger);
// Usage: <card-element>...</card-element>
