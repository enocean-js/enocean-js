/* eslint-disable no-undef  */
/* eslint-disable no-return-assign */
import { html, css, LitElement } from '../node_modules/lit-element/lit-element.js'
import { unsafeHTML } from '../node_modules/lit-html/directives/unsafe-html.js'
import './kaskadi-slider.js'
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
    ul{
      padding-left:5px
    }
    li.slider{
      display:flex;
      align-items: center
    }
    li{
      cursor: pointer;
      list-style: none
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
    this.value = parseInt(e.target.getAttribute('data-value'))
    this.fireChangeEvent()
  }
  sliderChange (e) {
    this.value = parseInt(e.target.value)
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
          ${getType(this.field) === 'scale' ? html`
            Scale: <span>${parseValue(this.field.scale.min)} - ${parseValue(this.field.scale.max)}</span>
                    <kaskadi-slider value="${parseValue(this.field.scale.min)}" @slide="${this.sliderChange}" min="${this.field.scale.min}" max="${parseValue(this.field.scale.max)}"></kaskadi-slider>
            ` : ''}
          ${getType(this.field) === 'range' ? html`Range: <span>${parseValue(this.field.range.min)} - ${parseValue(this.field.range.max)}</span>` : ''}
          ${getType(this.field) === 'enum' ? html`
            <ul>
              ${Array.isArray(this.field.enum.item) ? this.field.enum.item.map(e => {
    if (e.description === 'not used' || e.description === 'Not used') {
      return
    }
    if (e.min && e.max) {
      return html`<li class="slider">${parseValue(e.min)} - ${parseValue(e.max)}: ${unsafeHTML(e.description)} <kaskadi-slider value="${parseValue(e.min)}" @slide="${this.sliderChange}" min="${parseValue(e.min)}" max="${parseValue(e.max)}"></kaskadi-slider></li>`
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
  try {
    var radix = v.toString().substr(0, 2)
  } catch (err) {
    console.log(v)
    v = 0
  }
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
