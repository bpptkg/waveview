import { SeismicEventDetail } from '../../types/event';

export interface PickerWorkspaceProps {
  /**
   * The seismic event to be edited. If provided, the picker will be in event
   * editing mode. Otherwise, it will be in pick mode.
   */
  event?: SeismicEventDetail;
  /**
   * Whether the helicorder chart should be shown.
   */
  showHelicorder?: boolean;
  /**
   * Whether the event markers should be shown on the charts.
   */
  showEventMarkers?: boolean;
  /**
   * Callback to be called when the event is saved to the server.
   */
  onSave?: (event: SeismicEventDetail) => void;
  /**
   * Callback to be called when the picker is canceled or closed.
   */
  onCancel?: () => void;
}
