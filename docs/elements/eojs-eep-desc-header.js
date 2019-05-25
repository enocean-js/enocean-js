import { html, css, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
export class EEPDescHeader extends LitElement {
  constructor () {
    super()
    this.eep = 'f6-02-03'
  }
  static get styles () {
    return css`
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
      border-radius: var(--border-radius);
      border: var(--border-style);
      background:white;
    }
    .type div:nth-child(2){
      background: var(--type-color);
    }
    .func div:nth-child(2){
      background: var(--func-color);
    }
    .rorg div:nth-child(2){
      background: var(--rorg-color);
    }`
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
        <div class="eep-line rorg">
          <div>${this.eep.split('-')[0]}</div>
          <div>rorg</div>
          <div>${this.rorg}</div>
        </div>
        <div class="eep-line func">
          <div>${this.eep.split('-')[1]}</div>
          <div>func</div>
          <div>${this.func}</div>
        </div>
        <div class="eep-line type">
          <div>${this.eep.split('-')[2]}</div>
          <div>type</div>
          <div>${this.type}</div>
        </div>
      `
  }
}
customElements.define('eojs-eep-desc-header', EEPDescHeader)
