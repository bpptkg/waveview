import { LeveldbCluster } from "../cluster";
import { Leveldb } from "../leveldb";

describe("LeveldbCluster", () => {
  let cluster: LeveldbCluster;

  beforeEach(() => {
    cluster = new LeveldbCluster();
  });

  it("should return the size of the store", () => {
    expect(cluster.size).toBe(0);
    cluster.set("test", new Leveldb({ name: "test" }));
    expect(cluster.size).toBe(1);
  });

  it("should check if the store is empty", () => {
    expect(cluster.size).toBe(0);
    expect(cluster.isEmpty()).toBe(true);
    cluster.set("test", new Leveldb({ name: "test" }));
    expect(cluster.size).toBe(1);
    expect(cluster.isEmpty()).toBe(false);
  });

  it("should clear all databases", () => {
    cluster.set("test", new Leveldb({ name: "test" }));
    expect(cluster.size).toBe(1);
    expect(cluster.isEmpty()).toBe(false);
    cluster.clearAll();
    expect(cluster.size).toBe(0);
    expect(cluster.isEmpty()).toBe(true);
  });

  it("should delete a specific database", () => {
    cluster.set("test", new Leveldb({ name: "test" }));
    expect(cluster.size).toBe(1);
    expect(cluster.has("test")).toBe(true);
    cluster.delete("test");
    expect(cluster.size).toBe(0);
    expect(cluster.has("test")).toBe(false);
  });

  it("should check if a specific database exists", () => {
    expect(cluster.has("test")).toBe(false);
    cluster.set("test", new Leveldb({ name: "test" }));
    expect(cluster.has("test")).toBe(true);
  });

  it("should retrieve a specific database", () => {
    const db = new Leveldb({ name: "test" });
    cluster.set("test", db);
    expect(cluster.get("test")).toBe(db);
  });

  it("should set a specific database", () => {
    const db = new Leveldb({ name: "test" });
    cluster.set("test", db);
    expect(cluster.get("test")).toBe(db);
  });

  it("should set a default layer for a specific database", () => {
    cluster.setDefaultLayer("test");
    const db = cluster.get("test")!;
    expect(db.size).toBe(6);
    for (const layer of Leveldb.defaultLayerOptions) {
      expect(db.getLayer(layer.size)).toBeDefined();
    }
  });
});
