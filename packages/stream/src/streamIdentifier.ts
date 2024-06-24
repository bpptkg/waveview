export interface StreamType {
  network: string;
  station: string;
  location: string;
  channel: string;
}

export type StreamIndentifierOptions = StreamType & { id: string };

export type StreamTypeKey = keyof StreamType;

export class StreamIdentifier {
  private _network: string;
  private _station: string;
  private _location: string;
  private _channel: string;
  private _keys: StreamTypeKey[] = [
    "network",
    "station",
    "location",
    "channel",
  ];

  constructor(options: Partial<StreamIndentifierOptions>) {
    const { id } = options;
    if (id) {
      const parsed = this.parseId(id);
      this._network = parsed.network;
      this._station = parsed.station;
      this._location = parsed.location;
      this._channel = parsed.channel;
    } else {
      this._keys.forEach((key) => {
        if (!options[key]) {
          throw new Error(`Missing required field: ${key} (${options[key]})`);
        }
      });

      const { network, station, location, channel } =
        options as StreamIndentifierOptions;

      this._network = network;
      this._station = station;
      this._location = location;
      this._channel = channel;
    }
  }

  get id(): string {
    return `${this._network}.${this._station}.${this._location}.${this._channel}`;
  }

  get network(): string {
    return this._network;
  }

  get station(): string {
    return this._station;
  }

  get location(): string {
    return this._location;
  }

  get channel(): string {
    return this._channel;
  }

  isEmpty(): boolean {
    return (
      this._network === "" &&
      this._station === "" &&
      this._location === "" &&
      this._channel === ""
    );
  }

  toString(): string {
    return this.id;
  }

  toJSON(): StreamType {
    return {
      network: this._network,
      station: this._station,
      location: this._location,
      channel: this._channel,
    };
  }

  equals(other: StreamIdentifier | string): boolean {
    if (typeof other === "string") {
      return this.id === other;
    } else {
      return (
        this._network === other.network &&
        this._station === other.station &&
        this._location === other.location &&
        this._channel === other.channel
      );
    }
  }

  clone(): StreamIdentifier {
    return new StreamIdentifier(this.toJSON());
  }

  update(options: Partial<StreamIndentifierOptions>): void {
    const { id, network, station, location, channel } = options;
    if (id) {
      const parsed = this.parseId(id);
      this._network = parsed.network;
      this._station = parsed.station;
      this._location = parsed.location;
      this._channel = parsed.channel;
    } else {
      if (network) {
        this._network = network;
      }
      if (station) {
        this._station = station;
      }
      if (location) {
        this._location = location;
      }
      if (channel) {
        this._channel = channel;
      }
    }
  }

  shortName(): string {
    return `${this._network}.${this._station}`;
  }

  fullName(): string {
    return `${this._network}.${this._station}.${this._location}.${this._channel}`;
  }

  private parseId(id: string): StreamType {
    const parts = id.split(".");
    if (parts.length !== 4) {
      throw new Error(`Invalid stream identifier: ${id}`);
    }

    return {
      network: parts[0],
      station: parts[1],
      location: parts[2],
      channel: parts[3],
    };
  }

  static fromId(id: string): StreamIdentifier {
    return new StreamIdentifier({ id });
  }

  static fromJSON(options: StreamType): StreamIdentifier {
    return new StreamIdentifier(options);
  }
}
