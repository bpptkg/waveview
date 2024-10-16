import { Model } from "../../core/model";
import { ModelOptions } from "../../util/types";

export interface OffscreenSignalOptions extends ModelOptions {
  image?: string;
  dirty?: boolean;
}

export class OffscreenSignalModel extends Model<OffscreenSignalOptions> {
  static readonly defaultOptions: OffscreenSignalOptions = {
    image: undefined,
    dirty: true,
  };

  constructor(options: OffscreenSignalOptions) {
    const opts = { ...OffscreenSignalModel.defaultOptions, ...options };
    super(opts);
  }

  isEmpty(): boolean {
    return !this.options.image;
  }

  getImage(): string {
    return this.options.image || "";
  }

  setImage(image: string): void {
    this.options.image = image;
    this.options.dirty = false;
  }

  dirty(): boolean {
    return this.options.dirty || false;
  }

  setDirty(dirty: boolean): void {
    this.options.dirty = dirty;
  }
}
