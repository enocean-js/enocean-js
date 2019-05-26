/* eslint-disable no-undef  */
import { html, css, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module'
export class EEPCase extends LitElement {
  constructor () {
    super()
    this.case = {}
    this.eep = ''
  }
  static get styles () {
    return css`
    :host{
      display:block;
      font-family: 'Roboto';
      font-size:14px;
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
    .case {
      display:flex
    }
    .case-item{
      background:white;
      margin:5px;
      padding:5px;
      border-radius: var(--border-radius);
      border: var(--border-style);
    }
    .json{
      flex-grow:1;
      background:white;
      margin:5px;
      padding:5px;
      border-radius: var(--border-radius);
      border: var(--border-style);
    }
    .case-desc{
      width: 600px
    }
    .case-title{
      width: 600px
    }
    .field{position: relative}
    .field h3{
      margin:0; padding:0
    }
    .field .head{
      display:flex
    }
    .field .type{
      color:red
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

.string { color: green; }
.number { color: darkorange; }
.boolean { color: blue; }
.null { color: magenta; }
.key { color: red; }
    `
  }
  static get properties () {
    return {
      case: { type: Object },
      eep: { type: String }
    }
  }
  render () {
    return html`
        ${this.case.condition && this.case.condition.statusfield ? html`<div>status ${parseInt(`00${this.case.condition.statusfield[0].value}${this.case.condition.statusfield[1].value}0000`, 2)}</div>` : ''}
        ${this.case.condition && this.case.condition.datafield ? html`
          <div class="case">
            <div class="case-item">Case</div>
            <div class="case-item">${getShortcutFromOffset(this.case, this.case.condition.datafield.bitoffs).shortcut}</div>
            <div class="case-item">${this.case.condition.datafield.value}</div>
          </div>
          <div class="case-title">${this.case.title}</div>
          <div class="case-desc">${unsafeHTML(this.case.description)}</div>
        ` : ''}
        <div class="main">
        <div>
          ${this.case.datafield.map(item => {
    if (!item.reserved) {
      return html`

                <div class="field">
                  <div class="head">
                    <h3>${item.shortcut} (${typeof item.data === 'string' ? unsafeHTML(item.data) : ''})</h3>
                    <div class="spacer"></div>
                    <div class="type">[${getType(item)}]</div>
                  </div>
                  <div class="desc">${typeof item.description === 'string' ? unsafeHTML(item.description) : ''}</div>
                  <!--<div class="info">${typeof item.info === 'string' ? unsafeHTML(item.info) : ''}</div>-->
                  <div class="info">
                    ${getType(item) === 'scale' ? html`Scale: <span>${parseInt(item.scale.min)} - ${parseInt(item.scale.max)}</span>` : ''}
                    ${getType(item) === 'range' ? html`Range: <span>${parseInt(item.range.min)} - ${parseInt(item.range.max)}</span>` : ''}
                    ${getType(item) === 'enum' ? html`
                      <ul>
                        ${Array.isArray(item.enum.item) ? item.enum.item.map(e => {
    return html`<li>${e.value}: ${unsafeHTML(e.description)}</li>`
  }) : ''}
                      </ul>
                    ` : ''}
                    ${item.unit ? html`<div>Unit: ${item.unit}</div>` : ''}
                  </div>
                </div>
              `
    }
  })}
        </div>
        <div class="json">
          <pre>${unsafeHTML(syntaxHighlight(eep2JSON(this.case, this.eep)))}</pre>
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

function eep2JSON (c, eep, channel = 1) {
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
  if (c.condition && c.condition.statusfield) {
    msg.meta.status = parseInt(`00${c.condition.statusfield[0].value}${c.condition.statusfield[1].value}0000`, 2)
  }
  if (c.condition && c.condition.datafield) {
    msg.meta.data = c.condition.datafield.value
  }
  return msg
}

function getType (item) {
  if (item.enum) return 'enum'
  if (item.range && item.scale) return 'scale'
  if (item.range) return 'range'
  if (item.bitmask) return 'bitmsk'
}
function getShortcutFromOffset (c, offset) {
  var res = c.datafield.find(item => item.bitoffs === offset)
  return res
}
customElements.define('eojs-eep-case', EEPCase)
