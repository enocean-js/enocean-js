/* eslint-disable no-undef  */
import { html, css, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module'
import { RadioERP1 } from 'https://cdn.jsdelivr.net/npm/enocean-js/packages/enocean.js'
import './eojs-eep-case-head.js'
import './eojs-eep-field.js'
export class EEPCase extends LitElement {
  constructor () {
    super()
    this.case = {}
    this.eep = ''
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
    `
  }
  static get properties () {
    return {
      case: { type: Object },
      eep: { type: String }
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
        'channel': channel
      }
    }

    c.datafield.forEach(item => {
      if (!item.reserved) {
        msg.data[item.shortcut] = ''
      }
    })
    var fields = this.shadowRoot.querySelectorAll('eojs-eep-field')
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
              <pre>${unsafeHTML(syntaxHighlight(this.eep2JSON(this.case, this.eep)))}</pre>
            </div>
            <div class="tel">5500070701xxa500000000aabbccdd00ffffffff4800xx</div>
          </div>
      </div>
    `
  }
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
