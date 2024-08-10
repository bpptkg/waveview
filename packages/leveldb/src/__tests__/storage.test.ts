import { StorageLayer } from "../layer";
import { StorageEngine } from "../storage";

describe("StorageEngine", () => {
  let storageEngine: StorageEngine;
  let mockLayer: StorageLayer;

  beforeEach(() => {
    storageEngine = new StorageEngine();
    mockLayer = new StorageLayer({ size: 5, maxPoints: 100 });
  });

  test("should return the size of the layers map", () => {
    expect(storageEngine.size).toBe(0);
    storageEngine.set(0, mockLayer);
    expect(storageEngine.size).toBe(1);
  });

  test("should check if the layers map is empty", () => {
    expect(storageEngine.isEmpty()).toBe(true);
    storageEngine.set(0, mockLayer);
    expect(storageEngine.isEmpty()).toBe(false);
  });

  test("should clear all layers", () => {
    storageEngine.set(0, mockLayer);
    storageEngine.clear();
    expect(storageEngine.size).toBe(0);
    expect(storageEngine.isEmpty()).toBe(true);
  });

  test("should delete a specific layer", () => {
    storageEngine.set(0, mockLayer);
    storageEngine.delete(0);
    expect(storageEngine.size).toBe(0);
    expect(storageEngine.has(0)).toBe(false);
  });

  test("should check if a specific layer exists", () => {
    storageEngine.set(0, mockLayer);
    expect(storageEngine.has(0)).toBe(true);
    expect(storageEngine.has(1)).toBe(false);
  });

  test("should retrieve a specific layer", () => {
    storageEngine.set(0, mockLayer);
    expect(storageEngine.get(0)).toBe(mockLayer);
    expect(storageEngine.get(1)).toBeUndefined();
  });

  test("should set a specific layer", () => {
    storageEngine.set(0, mockLayer);
    expect(storageEngine.get(0)).toBe(mockLayer);
  });
});
