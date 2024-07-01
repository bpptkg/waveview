import { EventMap } from "../util/types";

export class EventEmitter<E extends EventMap = EventMap> {
  private _listeners: { [K in keyof E]?: E[K][] } = {};

  addEventListener<K extends keyof E>(event: K, fn: E[K]): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event]?.push(fn);
  }

  removeEventListener<K extends keyof E>(event: K, fn: E[K]): void {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event]?.filter((f) => f !== fn);
    }
  }

  dispatchEvent<K extends keyof E>(event: K, ...args: Parameters<E[K]>): void {
    this._listeners[event]?.forEach((fn) => fn.apply(this, args));
  }

  on<K extends keyof E>(event: K, fn: E[K]): void {
    this.addEventListener(event, fn);
  }

  off<K extends keyof E>(event: K, fn: E[K]): void {
    this.removeEventListener(event, fn);
  }

  emit<K extends keyof E>(event: K, ...args: Parameters<E[K]>): void {
    this.dispatchEvent(event, ...args);
  }

  once<K extends keyof E>(event: K, fn: E[K]): void {
    const onceFn = (...args: Parameters<E[K]>) => {
      this.off(event, onceFn as E[K]);
      fn.apply(this, args);
    };
    this.on(event, onceFn as E[K]);
  }

  removeAllEventListeners(): void {
    this._listeners = {};
  }
}
