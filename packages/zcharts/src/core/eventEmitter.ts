import { EventMap } from "../util/types";

export class EventEmitter<E extends EventMap = EventMap> {
  private _listeners: { [K in keyof E]?: E[K][] } = {};

  on<K extends keyof E>(event: K, fn: E[K]): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event]?.push(fn);
  }

  off<K extends keyof E>(event: K, fn: E[K]): void {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event]?.filter((f) => f !== fn);
    }
  }

  emit<K extends keyof E>(event: K): void;
  emit<K extends keyof E>(event: K, ...args: Parameters<E[K]>): void;
  emit<K extends keyof E>(event: K, ...args: any[]): void {
    this._listeners[event]?.forEach((fn) => fn.apply(this, args));
  }

  once<K extends keyof E>(event: K, fn: E[K]): void {
    const onceFn = (...args: Parameters<E[K]>) => {
      this.off(event, onceFn as E[K]);
      fn.apply(this, args);
    };
    this.on(event, onceFn as E[K]);
  }

  clear(): void {
    this._listeners = {};
  }
}
