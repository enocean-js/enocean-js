import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { GatewayApiClient } from "./gateway-api-client.js";
import { EnoceanGateway } from "@enocean-js/gateway";
import { unlinkSync as unlink, unwatchFile } from "node:fs";
import * as utils from "@enocean-js/utils";

let gateway, client;
describe("GatewayApiClient", () => {
  beforeAll(async () => {
    gateway = new EnoceanGateway({
      serialPortPath: "/dev/ttyUSB0",
      dbName: "test-gateway",
      port: 44556,
    });
    await gateway.start();
    client = new GatewayApiClient("http://localhost:44556");
    await new Promise((resolve) => {
      client.on("ready", async (data) => {
        resolve();
      });
    });
  });
  afterAll(() => {
    client.eventSource.close();
    gateway.enocean.closeSerialPort();
    unlink(gateway.enocean.memory.path);
  });

  it("to report an open port", async () => {
    expect(await client.isPortOpen()).toBe(true);
  });

  it("to get metadata", async () => {
    const meta = await client.getAllMetadata();
    expect(meta).toHaveProperty("baseId");
    expect(meta).toHaveProperty("serialPortPath");
    let bid = await client.getMetadata("baseId");
    expect(bid.length).toBeGreaterThan(0);
  });

  it("to set metadata", async () => {
    await client.setMetadata("testKey", "testValue");
    expect(await client.getMetadata("testKey")).toBe("testValue");
  });

  it("to list hardware info", async () => {
    let hwInfo = await client.getHWInfo();
    expect(hwInfo).toHaveProperty("baseId");
    expect(hwInfo).toHaveProperty("appVersion");
    expect(hwInfo).toHaveProperty("selfTest");
    expect(hwInfo).toHaveProperty("frequency");
    expect(hwInfo).toHaveProperty("dbPath");
    expect(hwInfo).toHaveProperty("protocol");
  });
  it("to get baseId", async () => {
    let baseId = await client.getBaseId();
    expect(baseId).toHaveProperty("baseId");
    expect(baseId.baseId.length).toBe(8);
  });
});
