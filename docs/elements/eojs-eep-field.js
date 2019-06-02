/* eslint-disable no-undef  */
/* eslint-disable no-return-assign */
import { html, css, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module'
export class EEPField extends LitElement {
  constructor () {
    super()
    this.field = {}
    this.value = 0
  }
  static get styles () {
    return css`
    :host{
      font-family: 'Roboto';
    }
    .field{
      background:white;
      margin:5px;
      padding:5px;
      border-radius: 5px;
      width:500px;
      border-radius: var(--border-radius);
      border: var(--border-style);
    }
    .right div{
      background:white;
      margin:5px;
      padding:5px;
      border-radius: var(--border-radius);
      border: var(--border-style);
    }
    .right{
      flex-grow:1;
    }

    .field{position: relative}
    .field h3{
      color: var(--color3-dark);
      margin:0; padding:0
    }
    .field .head{
      display:flex
    }
    .field .type{
      color:var(--color1-dark)
    }
    .field .desc{
      font-size:10px
    }
    .field .info{
      padding-top: 5px
    }
    .spacer{
      flex-grow: 1
    }
    .main{
      display: flex
    }
    li{
      cursor: pointer
    }
    li[selected]{
      background: var(--color2);
    }
    `
  }
  static get properties () {
    return {
      field: { type: Object },
      value: { type: String }
    }
  }
  click (e) {
    var val = parseInt(e.target.getAttribute('data-value'))
    this.value = val
    this.fireChangeEvent()
  }
  fireChangeEvent () {
    let event = new CustomEvent('valueselect', {
      detail: {
        value: this.value
      }
    })
    this.dispatchEvent(event)
  }
  firstUpdated (changedProperties) {
    this.fireChangeEvent()
  }
  render () {
    if (this.field.shortcut === 'LRNB') {
      this.value = 1
    }

    return html`
      <div class="field">
        <div class="head">
          <h3>${this.field.shortcut} (${typeof this.field.data === 'string' ? unsafeHTML(this.field.data) : ''})</h3>
          <div class="spacer"></div>
          <div class="type">[${getType(this.field)}]</div>
        </div>
        <div class="desc">${typeof this.field.description === 'string' ? unsafeHTML(this.field.description) : ''}</div>
        <!--<div class="info">${typeof this.field.info === 'string' ? unsafeHTML(this.field.info) : ''}</div>-->
        <div class="info">
          ${getType(this.field) === 'scale' ? html`Scale: <span>${parseValue(this.field.scale.min)} - ${parseValue(this.field.scale.max)}</span>` : ''}
          ${getType(this.field) === 'range' ? html`Range: <span>${parseValue(this.field.range.min)} - ${parseValue(this.field.range.max)}</span>` : ''}
          ${getType(this.field) === 'enum' ? html`
            <ul>
              ${Array.isArray(this.field.enum.item) ? this.field.enum.item.map(e => {
    if (e.min && e.max) {
      return html`<li  >${parseValue(e.min)} - ${parseValue(e.max)}: <input type="range" min="${parseValue(e.min)}" max="${parseValue(e.max)}"/> ${unsafeHTML(e.description)}</li>`
    }
    if (e.value) {
      return html`<li @click=${this.click} data-value="${parseValue(e.value)}" ?selected="${parseValue(this.value) === parseValue(e.value ? e.value.toString() : '')}" >${parseValue(e.value)}: ${unsafeHTML(e.description)}</li>`
    }
  }) : html`
                <!-- ${this.value = parseValue(this.field.enum.item.value)} -->
                <li>${parseValue(this.field.enum.item.value)}: ${unsafeHTML(this.field.enum.item.description)}</li>
              `}
            </ul>
          ` : ''}
          ${this.field.unit ? html`<div>Unit: ${this.field.unit}</div>` : ''}
        </div>
      </div>
    `
  }
}
function parseValue (v) {
  var radix = v.toString().substr(0, 2)
  switch (radix) {
    case '0b':
      return parseInt(v.replace('0b', ''), 2)
    case '0x':
      return parseInt(v.replace('0x', ''), 16)
    case '0o':
      return parseInt(v.replace('0o', ''), 8)
    default:
      return parseInt(v)
  }
}
function getType (item) {
  if (item.enum) return 'enum'
  if (item.range && item.scale) return 'scale'
  if (item.range) return 'range'
  if (item.bitmask) return 'bitmsk'
}
customElements.define('eojs-eep-field', EEPField)
