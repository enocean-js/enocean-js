/* eslint-disable no-undef  */
import { html, css, LitElement } from 'https://unpkg.com/lit-element@^2.1.0?module'
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module'
import { getEEP } from '../../packages/node_modules/@enocean-js/eep-transcoder/src/eep-transcoder.js'
import './eojs-eep-desc-header.js'
import './eojs-eep-case.js'
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
      height:100vh;overflow: scroll;flex-grow:1
    }
    #desc{padding:5px;max-width:500px}
    #main{}
  `
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
      <div id="main">
        <eojs-eep-desc-header eep="${eep.eep}" rorg="${eep.rorg_title}" func="${eep.func_title}" type="${eep.title}"></eojs-eep-desc-header>
        ${eep.description !== '' ? html`
          <h2>Description</h2>
          <div id="desc">${unsafeHTML(eep.description)}</div>
        ` : ''}
        ${eep.case.map(item => {
          return html`
            <eojs-eep-case eep="${eep.eep}" case="${JSON.stringify(item)}"></eojs-eep-case>
          `
        })}
        <pre style="color: #bbb;font-size:10px">${JSON.stringify(eep, null, 2)}</pre>
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
