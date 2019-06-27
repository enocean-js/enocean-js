/* eslint-disable no-undef  */
import { html, css, LitElement } from '../node_modules/lit-element/lit-element.js'
import { unsafeHTML } from '../node_modules/lit-html/directives/unsafe-html.js'
import { RadioERP1 } from 'https://cdn.jsdelivr.net/npm/enocean-js@0.0.3/packages/enocean.js'
import './eojs-eep-case-head.js'
import './eojs-eep-field.js'
export class EEPCase extends LitElement {
  constructor () {
    super()
    this.case = {}
    this.eep = ''
    this.radio = new RadioERP1()
  }
  static get styles () {
    return css`
    :host{
      display: block;
      font-family: 'Roboto';
      font-size:14px;
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
    .spacer{
      flex-grow: 1
    }
    .main{
      display: flex
    }
    pre{
      color:#ddd;
      margin:5px;
      padding:5px;
      border-radius: var(--border-radius);
      background: #333;
    }
    .string { color: var(--color1-dark50); }
    .number { color: var(--color2-dark50); }
    .boolean { color: blue; }
    .null { color: magenta; }
    .key { color: var(--color3-dark50); }
    .tel{
      font-family: "Roboto Mono"
    }
    .small{color:#aaa;font-size:0.7em}
    `
  }
  static get properties () {
    return {
      case: { type: Object },
      eep: { type: String },
      baseid: { type: String },
      channel: { type: String }
    }
  }
  valueChange () {
    this.requestUpdate()
  }
  eep2JSON (c, eep, channel = 1) {
    var msg = {
      'data': {},
      'meta': {
        'eep': eep,
        'channel': parseInt(this.channel)
      }
    }

    c.datafield.forEach(item => {
      if (!item.reserved) {
        msg.data[item.shortcut] = ''
      }
    })
    var fields = this.shadowRoot.querySelectorAll('eojs-eep-field')
    // console.log(fields)
    fields.forEach(item => {
      msg.data[item.field.shortcut] = item.value
    })

    if (c.condition && c.condition.statusfield) {
      msg.meta.status = parseInt(`00${c.condition.statusfield[0].value}${c.condition.statusfield[1].value}0000`, 2)
    }
    if (c.condition && c.condition.datafield) {
      msg.meta.data = parseInt(c.condition.datafield.value)
    }
    return msg
  }
  render () {
    var json = this.eep2JSON(this.case, this.eep)
    this.radio = RadioERP1.from({ rorg: this.eep.split('-')[0], payload: '00', id: parseInt(this.baseid, 16) + parseInt(this.channel) })
    this.radio.encode(json.data, json.meta)
    return html`
    ${this.case.condition && this.case.condition.statusfield ? html`<eojs-eep-case-head type="Status" field="Statusfield" value="${parseInt(`00${this.case.condition.statusfield[0].value}${this.case.condition.statusfield[1].value}0000`, 2)}" title="${this.case.title}" desc="${this.case.description}"></eojs-eep-case-head>` : ''}
    ${this.case.condition && this.case.condition.datafield ? html`<eojs-eep-case-head type="Datafield" field="${getShortcutFromOffset(this.case, this.case.condition.datafield.bitoffs).shortcut}" value="${this.case.condition.datafield.value}" title="${this.case.title}" desc="${this.case.description}"></eojs-eep-case-head>` : ''}
        <div class="main">
          <div>
            ${this.case.datafield.map(item => {
              if (!item.reserved) {
                return html`<eojs-eep-field @valueselect="${this.valueChange}" field="${JSON.stringify(item)}"></eojs-eep-field>`
              }
            })}
          </div>
          <div class="right">
            <div class="json">
              msg.payload for the node-red-contrib-enocean output node
              <pre>${unsafeHTML(syntaxHighlight(json))}</pre>
            </div>
            <div class="tel">
              55<span class="small">${this.radio.header.toString()}</span><span>${this.radio.data.toString()}</span><span class="small">${this.radio.optionalData.toString()}</span><span class="small">${toHex(this.radio.crc8Data)}</span>
            </div>
          </div>
      </div>
    `
  }
}
function toHex (val, len = 2) {
  return val.toString(16).padStart(len, '0')
}
function syntaxHighlight (json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, undefined, 2)
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
    var cls = 'number'
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key'
      } else {
        cls = 'string'
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean'
    } else if (/null/.test(match)) {
      cls = 'null'
    }
    return '<span class="' + cls + '">' + match + '</span>'
  })
}

function getShortcutFromOffset (c, offset) {
  var res = c.datafield.find(item => item.bitoffs === offset)
  return res
}
customElements.define('eojs-eep-case', EEPCase)
