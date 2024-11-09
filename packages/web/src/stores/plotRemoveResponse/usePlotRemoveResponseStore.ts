import { create } from 'zustand';
import { api } from '../../services/api';
import apiVersion from '../../services/apiVersion';
import { createSelectors } from '../../shared/createSelectors';
import { PlotRemoveResponse, PlotRemoveResponsePayload } from '../../types/instrumentResponse';
import { CustomError } from '../../types/response';
import { useOrganizationStore } from '../organization';
import { usePickerStore } from '../picker';
import { useVolcanoStore } from '../volcano/useVolcanoStore';
import { PlotRemoveResponseStore } from './types';

const plotRemoveResponseStore = create<PlotRemoveResponseStore>((set, get) => ({
  channel: null,
  result: null,
  error: null,
  loading: false,
  output: 'VEL' as const,
  useWaterLevel: false,
  waterLevel: 60,
  usePreFilter: true,
  f1: 0.01,
  f2: 0.05,
  f3: 45,
  f4: 50,
  zeroMean: true,
  taper: true,
  taperFraction: 5,
  setChannel: (channel) => set({ channel }),
  setOutput: (output) => set({ output }),
  setUseWaterLevel: (useWaterLevel) => set({ useWaterLevel }),
  setWaterLevel: (waterLevel) => set({ waterLevel }),
  setUsePreFilter: (usePreFilter) => set({ usePreFilter }),
  setF1: (f1) => set({ f1 }),
  setF2: (f2) => set({ f2 }),
  setF3: (f3) => set({ f3 }),
  setF4: (f4) => set({ f4 }),
  setZeroMean: (zeroMean) => set({ zeroMean }),
  setTaper: (taper) => set({ taper }),
  setTaperFraction: (taperFraction) => set({ taperFraction }),
  fetchPlotRemoveResponse: async () => {
    set({ loading: true, error: null });
    const { currentOrganization } = useOrganizationStore.getState();
    if (!currentOrganization) {
      throw new CustomError('Organization is not set');
    }
    const { currentVolcano } = useVolcanoStore.getState();
    if (!currentVolcano) {
      throw new CustomError('Volcano is not set');
    }
    const { time, duration } = usePickerStore.getState();
    const { channel, output, useWaterLevel, waterLevel, usePreFilter, f1, f2, f3, f4, zeroMean, taper, taperFraction } = get();
    const payload: PlotRemoveResponsePayload = {
      channel_id: channel?.id || '',
      time: new Date(time).toISOString(),
      duration: duration,
      output: output,
      water_level: useWaterLevel ? waterLevel : null,
      pre_filt: usePreFilter ? [f1, f2, f3, f4] : null,
      zero_mean: zeroMean,
      taper: taper,
      taper_fraction: taperFraction / 100,
    };
    const url = apiVersion.plotRemoveResponse.v1(currentOrganization.id, currentVolcano.id);
    try {
      const response = await api(url, {
        method: 'POST',
        body: payload,
      });
      if (!response.ok) {
        throw CustomError.fromErrorData(await response.json());
      }
      const data: PlotRemoveResponse = await response.json();
      set({ result: data });
    } catch (error) {
      set({ error: (error as CustomError).message });
    } finally {
      set({ loading: false });
    }
  },
  clearResult: () => set({ result: null, error: null, loading: false }),
}));

export const usePlotRemoveResponseStore = createSelectors(plotRemoveResponseStore);
