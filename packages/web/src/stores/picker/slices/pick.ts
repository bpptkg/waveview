import { Attachment, SeismicEventDetail } from '../../../types/event';
import { PickEvent } from '../types';

export interface PickSlice {
  pickRange: [number, number];
  editedEvent?: SeismicEventDetail;
  pickMode: boolean;
  eventId?: string;
  time: number;
  duration: number;
  eventTypeId: string;
  stationOfFirstArrivalId: string;
  note: string;
  attachments: Attachment[];
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
  resetEditedEvent: () => void;
  isPickEmpty: () => boolean;
  clearPick: () => void;
  // setPickStart: (start: number) => void;
  // setPickEnd: (end: number) => void;
  setPickRange: (range: [number, number]) => void;
  savePickedEvent: () => Promise<SeismicEventDetail>;
  fetchEditedEvent: (eventId: string) => Promise<SeismicEventDetail>;
}
