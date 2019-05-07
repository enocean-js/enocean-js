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
  async change (evt) {
    let att = evt.target.getAttribute('data-att')
    var oldValue = this[att]
    var newValue = evt.target.value
    this[att] = newValue
    let event = new CustomEvent('updated', {
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
      input{height:25px; border:1px solid #bbb; border-radius: 3px; padding-left:5px; color: #555}
      header input{height:15px; border-style: none; background:none; outline: none; width:420px;font-weight:bold}
      #info {font-size: 10px;line-height: 10px;color: #666; padding-left: 5px}
      .body-row:{display: flex}
      #main-body{padding:10px; border-color: #aaa; border-style: none solid solid solid; border-width:1px; border-radius:0 0 var(--br) var(--br); }
      #senderId {padding-left:5px;font-weight:bold}
      #altSenderId {font-size:0.7em; padding-left:5px}
      #body {display:flex;flex-direction: row}
      #rorg{
        border-radius:0 0 0 var(--br)
      }
      .eep{
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:1em;
        width:30px;
        height:30px;
      }
      .c0, .f6 {background: #875fff; color: white}
      .c1, .d5 {background: #6B8E23; color: white}
      .c2, .a5 {background: #FFA500; color: black}
      .c3, .d2 {background: #FFFF00; color: black}
      .c4 {background: #00CED1; color: black}
      .c5 {background: #69a5e7; color: white}
      .c6 {background: #5dd65d; color: black}
      .c7 {background: #505762; color: white}

    </style>
    <div>
      <header>
        <div>
          <input id="input-name" data-att="name" placeholder="No Name" @keyup="${this.change}" value="${this.name}"/>
          <div id="info">
            ${this.info}
          </div>
        </div>
        <rssi-indicator value="${this.rssi}"></rssi-indicator>
      </header>
      <div id="main-body">
        <div class="body-row">
          <label for="input-id" >ID</label>
          <input data-att="senderId" id="blablaid" @keyup="${this.change}" value="${this.senderId}"/>
          <label for="input-eep">EEP</label>
          <input data-att="eep" id="input-eep" @keyup="${this.change}" value="${this.eep}"/>
        </div>

      </div>
    </div>`
  }
}
customElements.define('sensor-list-item', SensorListItem)
