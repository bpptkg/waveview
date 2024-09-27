export interface ChannelInfo {
  stream_id: string;
  last_received_packet: string | null;
}

export interface SeismicNetworkStatus {
  state_type: string;
  state_label: string;
  state_description: string;
  threshold: number;
  color: string;
  channels: ChannelInfo[];
}
