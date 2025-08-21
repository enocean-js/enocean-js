import { Enocean, pretty } from "@enocean-js/enocean";
import { connect } from "mqtt";

export function connectMQTT() {
  const eo = new Enocean();
  const topic = "enocean2mqtt";
  const mqtt = connect("mqtt://192.168.178.109:1883", {
    clientId: "enocean2mqtt_1.0.0",
    protocolVersion: 5, // Important: Ensure you are using MQTT 5.0
  });
  //eo.clearDevices();
  eo.startTeachInMode();

  mqtt.on("connect", () => {
    console.log("Connected to MQTT broker");
    mqtt.subscribe(`${topic}/#`, { nl: true, rh: false }, (err) => {
      if (err) {
        console.error("Failed to subscribe to topic:", err);
      } else {
        console.log(`Subscribed to topic ${topic}/#`);
      }
    });
    mqtt.publish(`${topic}/control/teachIn`, "false");
    mqtt.publish(`${topic}/control/teachOut`, "false");
    mqtt.publish(`${topic}/control/timeout`, "0");
    console.log("Published initial control messages");
  });

  mqtt.on("message", async (path, message) => {
    let parts = path.split("/");
    if (parts[0] != topic) return;
    console.log(`Received message on topic ${path}: ${message.toString()}`);
    // rename device
    if (parts[1] === "device" && parts[3] === "name") {
      const device = await eo.getDevice(parts[2]);
      if (device) {
        await eo.setDevice(
          parts[2],
          device.eep,
          device.lastData,
          message.toString()
        );
        mqtt.publish(`${topic}/device/${parts[2]}/name`, message.toString());
      } else {
        console.error(`Device ${parts[2]} not found`);
      }
    }
    // change eep
    if (parts[1] === "device" && parts[3] === "eep") {
      const device = await eo.getDevice(parts[2]);
      if (device) {
        await eo.setDevice(
          parts[2],
          message.toString(),
          device.lastData,
          device.name
        );
        mqtt.publish(`${topic}/device/${parts[2]}/eep`, message.toString());
      } else {
        await eo.setDevice(parts[2], message.toString(), {}, "New Device");
        mqtt.publish(`${topic}/device/${parts[2]}/eep`, message.toString());
        mqtt.publish(`${topic}/device/${parts[2]}/name`, "New Device");
      }
    }
    // teachIn
    // if (parts[1] === "control" && parts[2] === "teachIn") {
    //   if (message.toString() === "true") {
    //     eo.startTeachInMode();
    //     mqtt.publish(`${topic}/control/teachIn`, "true");
    //   } else {
    //     eo.stopTeachInMode();
    //     mqtt.publish(`${topic}/control/teachIn`, "false");
    //   }
    // }
  });

  eo.on("ready", (data) => {
    console.log(data);
  });

  eo.on("packet", (data) => {
    mqtt.publish(`${topic}/packet`, data.toString("hex"));
    //console.log(data.toString("hex"));
  });

  eo.on("known-device-data", (data) => {
    mqtt.publish(`${topic}/device/${data.id}/rssi`, data.rssi.toString());
    mqtt.publish(`${topic}/device/${data.id}/lastSeen`, data.lastSeen);
    mqtt.publish(`${topic}/device/${data.id}/name`, data.name || "hallo", {
      properties: {
        contentType: "string",
      },
    });
    mqtt.publish(`${topic}/device/${data.id}/eep`, data.eep);
    if (data.lastData && data.lastData.teachInType) return;
    for (let key in data.lastData) {
      console.log(key, data.lastData[key].value);

      mqtt.publish(
        `${topic}/device/${data.id}/${key}`,
        data.lastData[key].value.toString()
      );
    }
    //console.log("Received packet from known device", data);
  });

  eo.on("teach-in-mode-timer", (data) => {
    mqtt.publish(`${topic}/control/timeout`, data.toString());
  });

  eo.on("teach-in-mode-ended", () => {
    mqtt.publish(`${topic}/control/teachIn`, "false");
    mqtt.publish(`${topic}/control/timeout`, "0");
  });
  eo.on("teach-in-device", (data) => {
    console.log("new teach-in device", data);
  });

  eo.on("teach-out-mode-timer", (data) => {
    console.log(data);
  });

  eo.on("teach-out-mode-ended", () => {
    console.log("Teach-out mode ended");
  });

  eo.on("teach-out-device", (data) => {
    console.log("teach-out device", data);
  });
}
