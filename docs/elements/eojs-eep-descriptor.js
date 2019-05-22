/* eslint-disable no-undef  */
import { html, LitElement } from 'https://unpkg.com/@polymer/lit-element?module'
import { getEEP } from 'https://cdn.jsdelivr.net/npm/enocean-js@0.0.1-beta.23/packages/node_modules/@enocean-js/eep-transcoder/src/eep-transcoder.js'

class EEPDescriptor extends LitElement {
  constructor () {
    super()
    this.eep = 'f6-02-03'
  }
  static get properties () {
    return {
      eep: { type: String }
    }
  }
  render () {
    let eep = this.getEEP(this.eep)
    if (eep) {
      return html`
      <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono|Roboto+Slab&display=swap" rel="stylesheet">
      <style>
        :host{
          font-family: 'Roboto Mono'
        }
        .eep-line{
          display:flex;
          align-items:center
        }
        .eep-line div{
          padding:5px;
          font-size: 12px;
          margin:2px;
          border-radius: 5px;
          border: 2px solid #ddd
        }
        .type div:nth-child(2){
          background: #99ff99;
        }
        .func div:nth-child(2){
          background: #ffff99;
        }
        .rorg div:nth-child(2){
          background: #99ccff;
        }
      </style>
      <div class="eep-line rorg">
        <div>${parseInt(eep.rorg_number).toString(16)}</div>
        <div>rorg</div>
        <div>${eep.rorg_title}</div>
      </div>
      <div class="eep-line func">
        <div>${parseInt(eep.func_number).toString(16).padStart(2, '0')}</div>
        <div>func</div>
        <div>${eep.func_title}</div>
      </div>
      <div class="eep-line type">
        <div>${parseInt(eep.number).toString(16).padStart(2, '0')}</div>
        <div>type</div>
        <div>${eep.title}</div>
      </div>
      <div style="color: #bbb;font-size:10px">${JSON.stringify(eep)}</div>
      `
    } else {
      return html`
        <div>no EEP selected</div>
      `
    }
  }
  getEEP (eep) {
    try {
      return getEEP(this.eep)
    } catch (err) {
      return false
    }
  }
}
customElements.define('eojs-eep-descriptor', EEPDescriptor)
