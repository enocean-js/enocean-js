/* eslint-disable no-undef  */
import { html, css, LitElement } from 'https://cdn.klimapartner.net/modules/lit-element/lit-element.js'

export class EEPDescHeader extends LitElement {
  constructor () {
    super()
    this.eep = 'f6-02-03'
  }
  static get styles () {
    return css`
    :host{
      font-family: 'Roboto Mono';
    }
    h1{
      margin:0;
      padding:5px 0 0 0;
      color: white;
      text-align:center;
      font-family: 'Roboto';
    }
    h2{
      font-size:14px;
      margin:0;
      padding:0 0 5px 0;
      color: white;
      text-align:center;
    }
    `
  }
  static get properties () {
    return {
      eep: { type: String },
      rorg: { type: String },
      func: { type: String },
      type: { type: String }
    }
  }
  render () {
    return html`
    <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono|Roboto+Slab&display=swap" rel="stylesheet">
    <h1>EEP ${this.eep.toUpperCase()}</h1>
    <h2>${this.rorg}·${this.func}·${this.type}</h2>
      `
  }
}
customElements.define('eojs-eep-desc-header', EEPDescHeader)
