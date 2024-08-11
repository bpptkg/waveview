import { readStream } from "../../util/stream";
import { StreamResponseData } from "../../util/types";

describe("readStream", () => {
  it("should correctly parse the Blob and return StreamResponseData", async () => {
    // Create a mock Blob
    const requestId = "testRequestId";
    const channelId = "testChannelId";
    const start = 0;
    const end = 100;
    const length = 2;
    const index = [1.0, 2.0];
    const data = [10.0, 20.0];
    const extent = [10.0, 20.0];

    const buffer = new ArrayBuffer(64 * 3 + length * 8 * 2);
    const view = new DataView(buffer);

    // Fill requestId
    new TextEncoder().encodeInto(
      requestId.padEnd(64, "\0"),
      new Uint8Array(buffer, 0, 64)
    );
    // Fill channelId
    new TextEncoder().encodeInto(
      channelId.padEnd(64, "\0"),
      new Uint8Array(buffer, 64, 64)
    );
    // Fill header
    view.setBigUint64(128, BigInt(start), true);
    view.setBigUint64(136, BigInt(end), true);
    view.setBigUint64(144, BigInt(length), true);
    // Fill index
    index.forEach((val, i) => view.setFloat64(192 + i * 8, val, true));
    // Fill data
    data.forEach((val, i) =>
      view.setFloat64(192 + length * 8 + i * 8, val, true)
    );

    const blob = new Blob([buffer]);

    // Call the function
    const result: StreamResponseData = await readStream(blob);

    // Verify the result
    expect(result.requestId).toBe(requestId);
    expect(result.channelId).toBe(channelId);
    expect(result.start).toBe(start);
    expect(result.end).toBe(end);
    expect(result.index).toEqual(new Float64Array(index));
    expect(result.data).toEqual(new Float64Array(data));
    expect(result.extent).toEqual(extent);
  });
});
