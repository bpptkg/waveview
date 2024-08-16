import { Seismogram } from "../seismogram/seismogram";
import { Extension } from "../util/types";
import { PickerOptions } from "./model";
import { Picker } from "./view";

export class PickerExtension implements Extension<Seismogram> {
  private options: Partial<PickerOptions>;
  private picker?: Picker;

  constructor(options?: Partial<PickerOptions>) {
    this.options = options || {};
  }

  install(chart: Seismogram): void {
    this.picker = new Picker(chart, this.options);
    this.picker.attachEventListeners();
  }

  uninstall(chart: Seismogram): void {
    if (this.picker) {
      this.picker.detachEventListeners();
      chart.removeComponent(this.picker);
    }
  }

  getAPI(): Picker {
    if (!this.picker) {
      throw new Error("Picker extension not initialized");
    }
    return this.picker;
  }

  activate(): void {
    this.picker?.model.enable();
  }

  deactivate(): void {
    this.picker?.model.disable();
    this.picker?.clearRange();
  }

  isActive(): boolean {
    return this.picker?.model.isActive() || false;
  }
}
