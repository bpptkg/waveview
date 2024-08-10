import { Segment } from "../segment";

describe("Segment", () => {
  it("should normalize the timestamp correctly", () => {
    const timestamp = new Date("2023-10-01T00:08:00Z").getTime();
    const segment = new Segment(timestamp, 5);
    const expectedTimestamp = new Date("2023-10-01T00:05:00Z").getTime();
    expect(segment.timestamp).toBe(expectedTimestamp);
  });

  it("should return the correct start time", () => {
    const timestamp = new Date("2023-10-01T00:08:00Z").getTime();
    const segment = new Segment(timestamp, 5);
    const expectedStart = new Date("2023-10-01T00:05:00Z").getTime();
    expect(segment.start).toBe(expectedStart);
  });

  it("should return the correct end time", () => {
    const timestamp = new Date("2023-10-01T00:08:00Z").getTime();
    const segment = new Segment(timestamp, 5);
    const expectedEnd = new Date("2023-10-01T00:10:00Z").getTime();
    expect(segment.end).toBe(expectedEnd);
  });
});
