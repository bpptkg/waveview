import { SignalAmplitude } from '../../../types/amplitude';
import { Attachment, SeismicEventDetail } from '../../../types/event';

export interface PickSlice {
  pickRange: [number, number];
  pickMode: boolean;
  eventId?: string;
  time: number;
  duration: number;
  eventTypeId: string;
  stationOfFirstArrivalId: string;
  note: string;
  attachments: Attachment[];
  amplitudes: SignalAmplitude[];
  editedEvent: SeismicEventDetail | null;
  isCalculatingAmplitudes: boolean;
  useOutlierFilter: boolean;
  setTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setEventTypeId: (eventTypeId: string) => void;
  setStationOfFirstArrivalId: (stationId: string) => void;
  setNote: (note: string) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (attachmentId: string) => void;
  resetEditing: () => void;
  setPickMode: (isActive: boolean) => void;
  setEditedEvent: (event: SeismicEventDetail) => void;
  isPickEmpty: () => boolean;
  clearPick: () => void;
  setPickRange: (range: [number, number]) => void;
  savePickedEvent: () => Promise<SeismicEventDetail>;
  fetchEditedEvent: (eventId: string) => Promise<SeismicEventDetail>;
  deleteEvent: (eventId: string) => Promise<void>;
  calcSignalAmplitudes(): Promise<void>;
  setUseOutlierFilter: (useOutlierFilter: boolean) => void;
}
