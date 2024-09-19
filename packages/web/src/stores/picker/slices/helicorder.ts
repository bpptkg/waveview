export interface HelicorderSlice {
  /**
   * The selected channel of the helicorder chart, e.g. `VG.MELAB.00.HHZ`.
   */
  channelId: string;
  /**
   * The duration of the helicorder chart in hours.
   */
  helicorderDuration: number;
  /**
   * The interval of the helicorder track in minutes.
   */
  helicorderInterval: number;
  /**
   * The offset date of the helicorder chart.
   */
  offsetDate: number;
  /**
   * Selection window in the helicorder chart.
   */
  selectionWindow?: [number, number];
  /**
   * The value of the last selection (pointer to the selected track) in the
   * helicorder chart.
   */
  lastSelection: number;
  /**
   * The time window value of the helicorder chart in minutes.
   */
  windowSize: number;
  /**
   * Set auto update for the helicorder chart.
   */
  autoUpdate: boolean;
  /**
   * The auto update interval in seconds.
   */
  autoUpdateInterval: number;
  setWindowSize: (size: number) => void;
  setHelicorderChannelId: (channelId: string) => void;
  setHelicorderDuration: (duration: number) => void;
  setHelicorderInterval: (interval: number) => void;
  setHelicorderOffsetDate: (offsetDate: number) => void;
  getHelicorderExtent: () => [number, number];
  setSelectionWindow: (extent: [number, number]) => void;
  setAutoUpdate: (autoUpdate: boolean) => void;
  setAutoUpdateInterval: (interval: number) => void;
}
