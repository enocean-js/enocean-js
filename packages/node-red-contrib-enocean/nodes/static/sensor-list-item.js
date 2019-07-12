/* eslint-disable no-undef  */
import { html, LitElement } from 'https://unpkg.com/@polymer/lit-element?module'

class SensorListItem extends LitElement {
  constructor () {
    super()
    this.eep = undefined
    this.senderId = 'unknown'
    this.name = undefined
    this.rssi = 0
  }

  static get properties () {
    return {
      senderId: { type: String },
      name: { type: String },
      eep: { type: String },
      rssi: { type: Number }
    }
  }

  async firstUpdated (changedProperties) {
    await this.getInfo()
  }

  updated (changedProperties) {
    changedProperties.forEach(async (oldVal, name) => {
      if (name === 'eep') {
        await this.getInfo()
      }
    })
  }

  deleteSelf () {
    const event = new CustomEvent('request_delete', {
      detail: {
        message: `please delete me`,
        id: `${this.senderId}_${this.eep}`
      }
    })
    this.dispatchEvent(event)
  }

  async changeValue (evt) {
    const att = evt.target.getAttribute('data-att')
    var oldValue = this[att]
    var newValue = evt.target.value
    this[att] = newValue
    const event = new CustomEvent('updated', {
      detail: {
        message: `this.${att} changed it's value`,
        attribute: att,
        oldValue: oldValue,
        newValue: newValue
      }
    })
    this.dispatchEvent(event)
  }

  async getInfo () {
    try {
      var info = await fetch('enocean-js/eep/' + this.eep)
      this.info = (await info.json()).title
    } catch (err) {
      this.info = 'unknown EEP'
    }
    this.requestUpdate()
  }

  render () {
    return html`
    <style>
      :host[hidden]{display:none}
      :host{position: relative; margin: 4px; font-size:13px; --br: 3px; display: flex;flex-direction: column; border-radius:var(--br)}
      header {
        height:30px;
        display: flex;
        flex-direction: row;
        padding:3px;
        background:#99ccff ;
        color:white;
        align-items:center;
        justify-content:space-between;
        border-radius:var(--br) var(--br) 0 0;
        border-color: #aaa; border-style: solid solid none solid; border-width:1px;
      }
      rssi-indicator {--fill-color: var(--rssi-fill-color,white);--empty-color:rgb(255,255,255,0);width:20px;height:20px}
      .value{ border:1px solid #bbb; border-radius: 3px; padding:5px; color: #333;margin:5px}
      #senderId{ background: #99ff99}
      #eep{ background: #ffff99}
      header input{height:15px; border-style: none; background:none; outline: none; width:420px;font-weight:bold}
      #info {font-size: 10px;line-height: 10px;color: #666; padding-left: 5px}
      .body-row {display: flex; align-items: center}
      #main-body{padding:5px; border-color: #aaa; border-style: none solid solid solid; border-width:1px; border-radius:0 0 var(--br) var(--br); }
      #altSenderId {font-size:0.7em; padding-left:5px}
      #body {display:flex;flex-direction: row}
      #rorg{
        border-radius:0 0 0 var(--br)
      }
      #spacer{flex:1}
      #delete_btn{cursor:pointer}
    </style>
    <div>
      <header>
        <div>
          <input id="input-name" data-att="name" placeholder="Type in a name here" @change="${this.changeValue}" value="${this.name}"/>
          <div id="info">
            ${this.info}
          </div>
        </div>
        <rssi-indicator value="${this.rssi}"></rssi-indicator>
      </header>
      <div id="main-body">
        <div class="body-row">
          <label>ID</label>
          <div class="value" id="senderId">${this.senderId}</div>
          <label>EEP</label>
          <div class="value" id="eep">${this.eep}</div>
          <div id="spacer"></div>
          <img id="delete_btn" @click="${this.deleteSelf}" src="enocean-js/delete.svg" width="16px" height="16px"/>
        </div>

      </div>
    </div>`
  }
}
customElements.define('sensor-list-item', SensorListItem)
