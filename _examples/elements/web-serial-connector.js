/* eslint-disable no-undef  */
import { html, css, LitElement } from 'https://cdn.klimapartner.net/modules/lit-element/lit-element.js'
import { until } from 'https://cdn.klimapartner.net/modules/lit-html/directives/until.js'
import { ESP3WebSerialParser } from '../../packages/enocean.js'
export class WebSerialConnector extends LitElement {
  constructor () {
    super()
    this.portNumber = 0
    if ('serial' in navigator) {
      this.getPorts()
    } else {
      console.log('WebSerial not supported by this browser')
    }
  }

  getPorts () {
    this.ports = navigator.serial.getPorts().then(async pl => {
      if (pl.length === 0) {
        return html`<button id="btn_addport" @click="${this.requestPort}">+</button>`
      } else {
        this.port = pl[this.portNumber]
        return this.open()
      }
    })
  }

  async requestPort () {
    this.port = await navigator.serial.requestPort()
    await this.open()
  }

  async open () {
    await this.port.open({ baudrate: 57600 })
    this.ports = html`<button class="open" @click="${this.close}">close</button>`

    this.parser = new ESP3WebSerialParser()
    this.parser.addEventListener('data', console.log)
    this.parser.read(await this.port.readable.getReader())
    this.writer = await this.port.writable.getWriter()
    this.writer.write(new Uint8Array([85, 0, 1, 0, 5, 112, 8, 56]))
    return this.ports
  }

  async close () {
    await this.port.close()
    console.log('closing')
    this.ports = html`<button class="closed" @click="${this.open}">open</button>`
  }

  static get styles () {
    return css`
      #btn_addport{background:green}
    `
  }

  static get properties () {
    return {
      port: { type: Object },
      ports: { type: Object }
    }
  }

  render () {
    return html`
      <div>${until(this.ports, 'loading...')}</div>
    `
  }
}
customElements.define('web-serial-connector', WebSerialConnector)
