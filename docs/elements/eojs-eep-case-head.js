/* eslint-disable no-undef  */
import { html, css, LitElement } from 'https://cdn.klimapartner.net/modules/lit-element/lit-element.js'
import { unsafeHTML } from 'https://cdn.klimapartner.net/modules/lit-html/directives/unsafe-html.js'

export class EEPCaseHead extends LitElement {
  constructor () {
    super()
    this.case = {}
  }
  static get styles () {
    return css`
    :host{
      display:block;
      font-family: 'Roboto';
      font-size:14px;
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
    .case-desc{
      width: 600px
    }
    .case-title{
      width: 600px
    }
    kaskadi-collapse{
      border-color: var(--color1-dark50);
      --fader-display: none;
    }
    `
  }
  static get properties () {
    return {
      field: { type: String },
      type: { type: String },
      value: { type: String },
      title: { type: String },
      desc: { type: String }
    }
  }
  render () {
    var title = this.title === 'undefined' ? this.field + ': ' + this.value : this.title
    return html`
    <kaskadi-collapse id="raw-json" title="${title}">
      <div class="case-desc">${unsafeHTML(this.desc)}</div>
    </kaskadi-collapse>


    `
  }
}

customElements.define('eojs-eep-case-head', EEPCaseHead)
