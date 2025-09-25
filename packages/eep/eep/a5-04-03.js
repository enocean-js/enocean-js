/**
 * EEP A5-10-03: Temperature Sensor, Set Point Control
 */
import * as utils from "@enocean-js/utils";

export const meta = {
  version: "1.0.0",
  eep: "a5-04-03",
  rorg: "a5",
  func: "04",
  type: "03",
  title: "Temperature Sensor and Humidity Sensor (-20 - 60 °C)",
  communication_type: "uni",
  payloadSize: 4,
};
export const SPEC = {
  meta,
  profile: (direction) => {
    const read = direction == 1 ? true : false;
    const write = direction == 1 ? false : true;
    let props = [
      {
        name: "humidity",
        type: "number",
        min: 0,
        max: 100,
        value: 0,
        role: "value",
        bytePosition: {
          bitStart: 0,
          bitLength: 8,
          bit_min: 0,
          bit_max: 255,
        },
        role: "value.humidity",
      },
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: -20,
        max: 60,
        value: 0,
        read: true,
        write: false,
        role: "value.temperature",
        bytePosition: {
          bitStart: 14,
          bitLength: 10,
          bit_min: 0,
          bit_max: 1023,
        },
      },
    ];
    props = props.map((prop) => ({ ...prop, read, write }));
    return { meta, props };
  },
  decode: (payload, status, profile) => {
    profile = JSON.parse(profile); // Deep clone to avoid mutation

    const ret = profile.props.map((prop) => {
      if (prop.type === "number" && prop.read === true) {
        prop.value = utils
          .scale(
            utils.getValue(
              payload,
              prop.bytePosition.bitStart,
              prop.bytePosition.bitLength
            ),
            [prop.bytePosition.bit_min, prop.bytePosition.bit_max],
            [prop.min, prop.max]
          )
          .toFixed(1);
        return prop;
      } else {
        return prop;
      }
    });
    return { props: ret };
  },
  encode: (data, profile) => {
    // Deep clone profile to avoid mutation
    const updatedProfile = JSON.parse(JSON.stringify(profile));
    let payload = new Uint8Array(updatedProfile.meta.payloadSize);
    for (let prop of updatedProfile.props) {
      if (prop.write === true && prop.type === "number") {
        if (data[prop.name] !== undefined) {
          prop.value = data[prop.name];
        }
        let raw = utils.scale(
          prop.value,
          [prop.min, prop.max],
          [prop.bytePosition.bit_min, prop.bytePosition.bit_max]
        );
        payload.setValue(
          payload,
          raw,
          prop.bytePosition.bitStart,
          prop.bytePosition.bitLength
        );
      }
    }
    payload = setValue(payload, 1, 28, 1);

    // Return both updated profile and payload for functional purity
    return { profile: updatedProfile, payload };
  },
};
