export interface HelicorderSlice {
  /**
   * The selected channel of the helicorder chart, e.g. `VG.MELAB.00.HHZ`.
   */
  channelId: string;
  /**
   * The duration of the helicorder chart in hours.
   */
  duration: number;
  /**
   * The interval of the helicorder track in minutes.
   */
  interval: number;
  /**
   * The offset date of the helicorder chart.
   */
  offsetDate: number;
  /**
   * The last extent of the selected track in the helicorder chart.
   */
  lastTrackExtent: [number, number];
  /**
   * The value of the last selection (pointer to the selected track) in the
   * helicorder chart.
   */
  lastSelection: number;
  setHelicorderChannelId: (channelId: string) => void;
  setHelicorderDuration: (duration: number) => void;
  setHelicorderInterval: (interval: number) => void;
  setHelicorderOffsetDate: (offsetDate: number) => void;
  setLastTrackExtent: (extent: [number, number]) => void;
  setLastSelection: (value: number) => void;
}
