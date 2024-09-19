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
  editedEvent: SeismicEventDetail | null;
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
}
