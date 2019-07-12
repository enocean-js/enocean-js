/* eslint-disable no-undef  */
import { html, LitElement } from 'https://unpkg.com/@polymer/lit-element?module'

class SensorListItem extends LitElement {
  constructor () {
    super()
    this.eep = undefined
    this.rorg = 'f6'
    this.senderId = 'unknown'
    this.friendlyId = undefined
    this.rssi = 0
  }

  static get properties () {
    return {
      senderId: { type: String },
      friendlyId: { type: String },
      eep: { type: String },
      rssi: { type: Number },
      rorg: { type: Number }
    }
  }

  render () {
    return html`
    <style>
      :host[hidden]{display:none}
      :host{position: relative; margin: 4px; font-size:13px; --br: 3px; display: flex;flex-direction: column;box-shadow:1px 1px 3px #aaa; width:220px;border-radius:var(--br)}
      header {
        height:30px;
        display: flex;
        flex-direction: row;
        padding:3px;
        background:royalblue ; 
        color:white;
        align-items:center;
        justify-content:space-between;
        border-radius:var(--br) var(--br) 0 0;
      }
      .unknown #blender{pointer-events:none;background:rgba(255,255,255,0.4); position:absolute; top:0; left:0; bottom:0; right:0; border-radius: var(--br)}
      rssi-indicator {--fill-color: var(--rssi-fill-color,blue);--empty-color:rgb(255,255,255,0.3);width:20px;height:20px}
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
    <div class="${this.eep ? 'known' : 'unknown'}">
      <div id="blender"></div>
      <header>
        <div>
          <div id="senderId">${this.friendlyId ? this.friendlyId : this.senderId}</div>
          ${this.friendlyId ? html`<div id="altSenderId">${this.senderId}</div>` : ''}
        </div>
        <rssi-indicator value="${this.rssi}"></rssi-indicator>
      </header>
      <div id="body">
        <div id="rorg" class="eep ${this.rorg.toString(16)}">${this.rorg.toString(16)}</div>
        ${this.eep ? html`
          <div id="func" class="eep c${(parseInt(this.eep.split('-')[1], 16)) % 8}">${this.eep.split('-')[1]}</div>
          <div id="type" class="eep c${(parseInt(this.eep.split('-')[2], 16)) % 8}">${this.eep.split('-')[2]}</div>
        ` : ''}
      </div>
    </div>`
  }
}
customElements.define('sensor-list-item', SensorListItem)
