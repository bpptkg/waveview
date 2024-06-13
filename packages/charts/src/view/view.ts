import * as PIXI from "pixi.js";
import { Model } from "../model/model";
import { EventMap, LayoutRect } from "../util/types";

export abstract class View<T extends Model = Model> {
  type = "view";
  readonly model: T;
  readonly group: PIXI.Container = new PIXI.Container();
  private listeners: { [K in keyof EventMap]?: EventMap[K][] } = {};

  constructor(model: T) {
    this.model = model;
  }

  getModel(): T {
    return this.model;
  }

  abstract getRect(): LayoutRect;

  abstract setRect(rect: LayoutRect): void;

  abstract render(): void;

  clear(): void {
    this.group.removeChildren();
  }

  dispose(): void {
    this.group.destroy({ children: true });
  }

  addEventListener<K extends keyof EventMap>(event: K, fn: EventMap[K]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(fn);
  }

  removeEventListener<K extends keyof EventMap>(
    event: K,
    fn: EventMap[K]
  ): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event]?.filter((f) => f !== fn);
    }
  }

  dispatchEvent<K extends keyof EventMap>(
    event: K,
    ...args: Parameters<EventMap[K]>
  ): void {
    this.listeners[event]?.forEach((fn) => fn.apply(this, args));
  }

  on<K extends keyof EventMap>(event: K, fn: EventMap[K]): void {
    this.addEventListener(event, fn);
  }

  off<K extends keyof EventMap>(event: K, fn: EventMap[K]): void {
    this.removeEventListener(event, fn);
  }

  emit<K extends keyof EventMap>(
    event: K,
    ...args: Parameters<EventMap[K]>
  ): void {
    this.dispatchEvent(event, ...args);
  }

  removeAllEventListeners(): void {
    this.listeners = {};
  }
}
