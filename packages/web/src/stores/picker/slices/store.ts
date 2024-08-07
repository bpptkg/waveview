import { CommonSlice } from './common';
import { HelicorderSlice } from './helicorder';
import { PickSlice } from './pick';
import { SeismogramSlice } from './seismogram';

export type PickerStore = CommonSlice & HelicorderSlice & PickSlice & SeismogramSlice;
