/* eslint-disable no-undef  */
import { html, css, LitElement } from './lit-element/lit-element.js'
import { unsafeHTML } from './lit-html/directives/unsafe-html.js'
// import { getEEP } from '../../packages/node_modules/@enocean-js/eep-transcoder/src/eep-transcoder.js'
import { getEEP } from 'https://cdn.jsdelivr.net/npm/enocean-js/packages/enocean.js'
import './eojs-eep-desc-header.js'
import './eojs-eep-case.js'
import './kaskadi-collapse.js'
class EEPDescriptor extends LitElement {
  constructor () {
    super()
    this.eep = 'f6-02-03'
  }
  static get styles () {
    return css`
    :host{
      font-family: 'Roboto';
      font-size:12px;
      display:block;
      height:calc(100vh - var(--size-cell1));overflow: scroll;flex-grow:1;
      padding-left: calc(var(--size-cell1));
      padding-right: calc(var(--size-cell1));
    }
    #head{
      background:var(--color3-dark75);
      margin-bottom:var(--size-cell1);
      padding:var(--size-space);
      margin:var(--size-space);
      border-radius: var(--border-radius);
    }
    eojs-eep-case{
      margin-bottom: var(--size-cell1)
    }
    kaskadi-collapse{
      --collapsed-height: 75px;
      padding:var(--size-space);
      margin:var(--size-space);
      background:white;
      border-radius: var(--border-radius);
      border-style: none;
    }
    #raw-json{
      box-sizing: border-box;
      border: var(--border);
      border-color: var(--color2-dark50);
      padding:var(--size-space);
      margin:var(--size-space);
      --collapsed-height: 48px;
    }
    #main{}
  `
  }
  static get properties () {
    return {
      eep: { type: String },
      baseid: { type: String },
      channel: { type: String }
    }
  }
  render () {
    let eep = this.getEEP(this.eep)
    if (eep) {
      return html`
      <div id="main">
        <div id="head">
            <eojs-eep-desc-header eep="${eep.eep}" rorg="${eep.rorg_title}" func="${eep.func_title}" type="${eep.title}"></eojs-eep-desc-header>
            ${eep.description !== '' ? html`<kaskadi-collapse title="Description"><div id="desc">${unsafeHTML(eep.description)}</div></kaskadi-collapse>` : ''}
        </div>
        ${eep.case.map(item => {
          return html`
            <eojs-eep-case eep="${eep.eep}" case="${JSON.stringify(item)}" baseid="${this.baseid}" channel="${this.channel}"></eojs-eep-case>
          `
        })}
        <kaskadi-collapse id="raw-json" title="JSON Specification">
          <pre style="color: #bbb;font-size:10px">${JSON.stringify(eep, null, 2)}</pre>
        </kaskadi-collapse>
      </div>
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
