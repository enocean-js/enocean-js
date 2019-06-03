import { html, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
export class KaskadiSlider extends LitElement {
  constructor () {
    super()
    this.value = 0
    this.min = 0
    this.max = 100
  }
  static get properties () {
    return {
      value: { type: Number },
      min: { type: Number },
      max: { type: Number }
    }
  }
  changeValue (e) {
    this.value = e.target.value
    let event = new CustomEvent('slide', {
      detail: {
        value: this.value
      }
    })
    this.dispatchEvent(event)
  }
  render () {
    return html`
      <style>
      :host{
        display: block
      }
      div{
        display:flex;
        align-items:center
      }
      </style>
      <div>
        <input type="range" min="${this.min}" max="${this.max}" @input="${this.changeValue}"/><div id="val">${this.value}</div>
      </div>
    `
  }
}
customElements.define('kaskadi-slider', KaskadiSlider)
