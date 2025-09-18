import {
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
import "./ed-prop-simple.js";
const apiClient = EnoceanJSElement.apiClient;

class EditorPropList extends EnoceanJSElement {
  constructor() {
    super();
    this.props = [];
  }

  static properties = {
    props: { type: Array },
    propertyName: { type: String },
    propertyType: { type: String },
    bitStart: { type: Number },
    bitLength: { type: Number },
    valueMin: { type: Number },
    valueMax: { type: Number },
    rangeMin: { type: Number },
    rangeMax: { type: Number },
    role: { type: String },
  };
  static styles = css`
    :host {
      cursor: arrow;
      display: block;
    }
    material-icon {
      vertical-align: middle;
    }
    .blink {
      color: green;
    }
    .small {
      width: 100px;
    }
  `;
  render() {
    return html`
      <div>
        <input
          @change=${this._onPropertyNameChange}
          id="property-name"
          type="text"
          placeholder="Property Name"
        />
        <select @change=${this._onPropertyTypeChange} id="property-type">
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="enum">enum</option>
        </select>
        <input
          @change=${this._onBitStartChange}
          class="small"
          id="bit-start"
          type="text"
          placeholder="bitStart"
        />
        <input
          class="small"
          id="bit-length"
          type="text"
          placeholder="bitLength"
        />
        <input
          class="small"
          id="value-min"
          type="text"
          placeholder="valueMin"
        />
        <input
          class="small"
          id="value-max"
          type="text"
          placeholder="valueMax"
        />
        <input
          class="small"
          id="range-min"
          type="text"
          placeholder="rangeMin"
          value="0"
        />
        <input
          class="small"
          id="range-max"
          type="text"
          placeholder="rangeMax"
          value="255"
        />
        <input
          class="small"
          id="role"
          list="iobroker-roles"
          placeholder="role"
          value="state"
        />
        <datalist id="iobroker-roles">
          <option value="state"></option>
          <option value="text"></option>
          <option value="text.url"></option>
          <option value="html"></option>
          <option value="json"></option>
          <option value="list"></option>
          <option value="date"></option>
          <option value="sensor.window"></option>
          <option value="sensor.door"></option>
          <option value="sensor.alarm"></option>
          <option value="sensor.alarm.flood"></option>
          <option value="sensor.alarm.fire"></option>
          <option value="sensor.alarm.secure"></option>
          <option value="sensor.alarm.power"></option>
          <option value="sensor.light"></option>
          <option value="sensor.lock"></option>
          <option value="sensor.motion"></option>
          <option value="sensor.rain"></option>
          <option value="sensor.noise"></option>
          <option value="button"></option>
          <option value="button.long"></option>
          <option value="button.stop"></option>
          <option value="button.stop.tilt"></option>
          <option value="button.start"></option>
          <option value="button.open.door"></option>
          <option value="button.window.open"></option>
          <option value="button.open.blind"></option>
          <option value="button.open.tilt"></option>
          <option value="button.close.blind"></option>
          <option value="button.close.tilt"></option>
          <option value="button.mode*"></option>
          <option value="button.mode.auto"></option>
          <option value="button.mode.manual"></option>
          <option value="button.mode.silent"></option>
          <option value="button.press"></option>
          <option value="value"></option>
          <option value="value.window"></option>
          <option value="value.temperature"></option>
          <option value="value.humidity"></option>
          <option value="value.brightness"></option>
          <option value="value.min"></option>
          <option value="value.max"></option>
          <option value="value.default"></option>
          <option value="value.battery"></option>
          <option value="value.valve"></option>
          <option value="value.time"></option>
          <option value="value.interval"></option>
          <option value="value.date"></option>
          <option value="value.datetime"></option>
          <option value="value.gps.longitude"></option>
          <option value="value.gps.latitude"></option>
          <option value="value.gps.elevation"></option>
          <option value="value.gps"></option>
          <option value="value.gps.accuracy"></option>
          <option value="value.gps.radius"></option>
          <option value="value.power"></option>
          <option value="value.power.consumption"></option>
          <option value="value.power.reactive"></option>
          <option value="value.direction"></option>
          <option value="value.curtain"></option>
          <option value="value.blind"></option>
          <option value="value.tilt"></option>
          <option value="value.lock"></option>
          <option value="value.speed"></option>
          <option value="value.pressure"></option>
          <option value="value.distance"></option>
          <option value="value.distance.visibility"></option>
          <option value="value.severity"></option>
          <option value="value.warning"></option>
          <option value="value.sun.elevation"></option>
          <option value="value.sun.azimuth"></option>
          <option value="value.voltage"></option>
          <option value="value.current"></option>
          <option value="value.fill"></option>
          <option value="value.blood.sugar"></option>
          <option value="indicator"></option>
          <option value="indicator.working"></option>
          <option value="indicator.reachable"></option>
          <option value="indicator.connected"></option>
          <option value="indicator.maintenance"></option>
          <option value="indicator.maintenance.lowbat"></option>
          <option value="indicator.maintenance.unreach"></option>
          <option value="indicator.maintenance.alarm"></option>
          <option value="indicator.lowbat"></option>
          <option value="indicator.alarm"></option>
          <option value="indicator.alarm.fire"></option>
          <option value="indicator.alarm.flood"></option>
          <option value="indicator.alarm.secure"></option>
          <option value="indicator.alarm.health"></option>
          <option value="level"></option>
          <option value="level.co2"></option>
          <option value="level.dimmer"></option>
          <option value="level.blind"></option>
          <option value="level.temperature"></option>
          <option value="level.valve"></option>
          <option value="level.color.red"></option>
          <option value="level.color.green"></option>
          <option value="level.color.blue"></option>
          <option value="level.color.white"></option>
          <option value="level.color.hue"></option>
          <option value="level.color.saturation"></option>
          <option value="level.color.rgb"></option>
          <option value="level.color.luminance"></option>
          <option value="level.color.temperature"></option>
          <option value="level.timer"></option>
          <option value="level.timer.sleep"></option>
          <option value="level.volume"></option>
          <option value="level.volume.group"></option>
          <option value="level.curtain"></option>
          <option value="level.tilt"></option>
          <option value="switch"></option>
          <option value="switch.lock"></option>
          <option value="switch.lock.door"></option>
          <option value="switch.lock.window"></option>
          <option value="switch.mode.boost"></option>
          <option value="switch.mode.party"></option>
          <option value="switch.power"></option>
          <option value="switch.light"></option>
          <option value="switch.comfort"></option>
          <option value="switch.enable"></option>
          <option value="switch.mode*"></option>
          <option value="switch.mode.auto"></option>
          <option value="switch.mode.manual"></option>
          <option value="switch.mode.silent"></option>
          <option value="switch.mode.moonlight"></option>
          <option value="switch.mode.color"></option>
          <option value="switch.gate"></option>
          <option value="level.mode.fan"></option>
          <option value="level.mode.swing"></option>
          <option value="level.mode.airconditioner"></option>
          <option value="level.mode.thermostat"></option>
          <option value="level.mode.cleanup"></option>
          <option value="level.mode.work"></option>
          <option value="value.water"></option>
          <option value="value.waste"></option>
          <option value="indicator.maintenance.waste"></option>
          <option value="value.state"></option>
          <option value="value.position"></option>
          <option value="value.gate"></option>
          <option value="media.seek"></option>
          <option value="media.mode.shuffle"></option>
          <option value="media.mode.repeat"></option>
          <option value="media.state"></option>
          <option value="medien.artist"></option>
          <option value="media.album"></option>
          <option value="media.title"></option>
          <option value="media.title.next"></option>
          <option value="media.cover"></option>
          <option value="media.cover.big"></option>
          <option value="media.cover.small"></option>
          <option value="media.duration.text"></option>
          <option value="media.duration"></option>
          <option value="media.elapsed.text"></option>
          <option value="media.elapsed"></option>
          <option value="media.broadcastDate"></option>
          <option value="media.mute"></option>
          <option value="media.season"></option>
          <option value="media.episode"></option>
          <option value="media.mute.group"></option>
          <option value="media.tts"></option>
          <option value="media.bitrate"></option>
          <option value="media.genre"></option>
          <option value="media.date"></option>
          <option value="media.track"></option>
          <option value="media.playid"></option>
          <option value="media.add"></option>
          <option value="media.clear"></option>
          <option value="media.playlist"></option>
          <option value="media.url"></option>
          <option value="media.url.announcement"></option>
          <option value="media.jump"></option>
          <option value="media.content"></option>
          <option value="media.link"></option>
          <option value="media.input"></option>
          <option value="level.bass"></option>
          <option value="level.treble"></option>
          <option value="switch.power.zone"></option>
          <option value="media.browser"></option>
          <option value="value.temperature.windchill"></option>
          <option value="value.temperature.dewpoint"></option>
          <option value="value.temperature.feelslike"></option>
          <option value="value.temperature.min"></option>
          <option value="value.temperature.max"></option>
          <option value="value.humidity.min"></option>
          <option value="value.humidity.max"></option>
          <option value="value.speed.wind"></option>
          <option value="value.speed.max.wind"></option>
          <option value="value.speed.min.wind"></option>
          <option value="value.speed.wind.gust"></option>
          <option value="value.direction.wind"></option>
          <option value="value.direction.max.wind"></option>
          <option value="value.direction.min.wind"></option>
          <option value="weather.direction.wind"></option>
          <option value="date.sunrise"></option>
          <option value="date.sunset"></option>
          <option value="dayofweek"></option>
          <option value="location"></option>
          <option value="weather.icon"></option>
          <option value="weather.icon.wind"></option>
          <option value="weather.icon.name"></option>
          <option value="weather.state"></option>
          <option value="value.precipitation"></option>
          <option value="value.precipitation.hour"></option>
          <option value="value.precipitation.today"></option>
          <option value="value.precipitation.chance"></option>
          <option value="value.precipitation.type"></option>
          <option value="value.radiation"></option>
          <option value="value.uv"></option>
          <option value="value.clouds"></option>
          <option value="value.rain"></option>
          <option value="value.rain.hour"></option>
          <option value="value.rain.today"></option>
          <option value="value.snow"></option>
          <option value="value.snow.hour"></option>
          <option value="value.snow.today"></option>
          <option value="value.snowline"></option>
          <option value="weather.chart.url"></option>
          <option value="weather.chart.url.forecast"></option>
          <option value="weather.html"></option>
          <option value="waether.title"></option>
          <option value="weather.title.short"></option>
          <option value="weather.type"></option>
          <option value="weather.json"></option>
          <option value="value.speed.wind.forecast.0"></option>
          <option value="weather.state.forecast.0"></option>
          <option value="value.direction.wind.forecast.0"></option>
          <option value="weather.direction.wind.forecast.0"></option>
          <option value="value.pressure.forecast.0"></option>
          <option value="value.temperature.min.forecast.0"></option>
          <option value="value.temperature.max.forecast.0"></option>
          <option value="value.precipitation.forecast.0"></option>
          <option value="value.prepitation.forecast.0"></option>
          <option value="weather.title.forecast.0"></option>
          <option value="value.precipitation.day.forecast.0"></option>
          <option value="value.precipitation.night.forecast.0"></option>
          <option value="date.forecast.1"></option>
          <option value="weather.icon.forecast.1"></option>
          <option value="weather.state.forecast.1"></option>
          <option value="value.temperature.min.forecast.1"></option>
          <option value="value.temperature.min.forecast.1"></option>
          <option value="value.prepitation.forecast.1"></option>
          <option value="value.prepitation.forecast.1"></option>
          <option value="value.direction.wind.forecast.1"></option>
          <option value="value.speed.wind.forecast.1"></option>
          <option value="value.pressure.forecast.1"></option>
          <option value="info.ip"></option>
          <option value="info.mac"></option>
          <option value="info.name"></option>
          <option value="info.address"></option>
          <option value="info.serial"></option>
          <option value="info.firmware"></option>
          <option value="info.hardware"></option>
          <option value="info.port"></option>
          <option value="info.standby"></option>
          <option value="info.status"></option>
          <option value="info.display"></option>
          <option value="date.start"></option>
          <option value="date.end"></option>
          <option value="value.health.fat"></option>
          <option value="value.health.weight"></option>
          <option value="value.health.bmi"></option>
          <option value="value.health.calories"></option>
          <option value="value.health.steps"></option>
          <option value="value.health.bpm"></option>
          <option value="url"></option>
          <option value="url.icon"></option>
          <option value="url.cam"></option>
          <option value="url.blank"></option>
          <option value="url.same"></option>
          <option value="url.audio"></option>
          <option value="text.phone"></option>
        </datalist>
      </div>
      <ed-prop-simple></ed-prop-simple>
    `;
  }
}

customElements.define("ed-prop-list", EditorPropList);
