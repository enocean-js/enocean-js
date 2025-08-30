import { Enocean } from "@enocean-js/enocean";

const eo = new Enocean({ port: "/dev/ttyUSB0" });

async function main() {
  await new Promise((resolve) => eo.on("ready", resolve));
  console.log("Enocean instance is ready. Base ID:", eo.baseId);

  // Cleanup from previous runs to ensure a clean slate
  console.log("Performing cleanup...");
  eo.deleteVdp("living-room-light");
  console.log("Cleanup complete.");

  // 1. Create a Virtual Device Profile (VDP) instance for our light.
  const lightVdp = eo.createVdp(
    "living-room-light",
    "Living Room Ceiling Light",
    "simple-switch"
  );
  console.log("Created VDP:", lightVdp);

  // 2. Start Teach-In mode and wait for a rocker switch
  console.log("\nStarting Teach-In mode for 30 seconds...");
  console.log("Please press a button on your rocker switch to pair it.");
  eo.startTeachInMode();

  const newDevice = await new Promise((resolve) => {
    eo.on("eep-learned", (data) => {
      // We only care about f6-02-01 for this example
      if (data.eep === "f6-02-01") {
        resolve(data);
      }
    });
  });

  eo.stopTeachInMode();
  console.log(
    `\nSuccessfully learned new rocker switch with ID: ${newDevice.id}`
  );

  // 3. Create a binding to the newly learned device.
  const source = {
    type: "device-event",
    event: `device:${newDevice.id.toLowerCase()}:button:0:pressed`,
  };
  const destination = {
    type: "vdp",
    vdpId: "living-room-light",
    action: "toggle",
  };
  eo.createBinding(source, destination);
  console.log("Created binding:", { source, destination });

  // 4. Listen for updates to our VDP.
  eo.on("vdp-updated", (data) => {
    if (data.id === "living-room-light") {
      console.log("--- VDP STATE UPDATED ---");
      console.log("New state:", data.state);
      console.log(`The light is now ${data.state.isOn ? "ON" : "OFF"}`);
      console.log("-------------------------");
    }
  });

  console.log(
    `\nSetup complete. Press button AI on your newly paired rocker switch (${newDevice.id})...`
  );
}

eo.on("decoded-data", (data) => {
  // Log all decoded data for debugging purposes
  //console.log("Received decoded data:", data);
});

main().catch(console.error);
