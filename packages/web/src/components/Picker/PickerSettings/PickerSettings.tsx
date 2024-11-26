import {
  Button,
  Dialog,
  DialogSurface,
  makeStyles,
  ProgressBar,
  Switch,
  Toast,
  Toaster,
  ToastTitle,
  tokens,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { ArrowLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { formatFilterText, formatNumber } from '../../../shared/formatting';
import { useInventoryStore } from '../../../stores/inventory';
import { usePickerStore } from '../../../stores/picker';
import { extractFilterOptions } from '../../../stores/picker/creator';
import { ChannelConfig } from '../../../stores/picker/slices';
import { Channel } from '../../../types/channel';
import { BandpassFilterOptions, FilterOperationOptions, LowpassFilterOptions } from '../../../types/filter';
import { FilterOptions, PickerConfig, PickerConfigPayload } from '../../../types/picker';
import { CustomError } from '../../../types/response';
import { usePickerContext } from '../PickerContext';
import HelicorderDefaultChannel from './HelicorderDefaultChannel';
import HelicorderFilter from './HelicorderFilter';
import SeismogramChannelList from './SeismogramChannelList';
import SelectionWindow from './SelectionWindow';

const useStyles = makeStyles({
  dialogSurface: {
    height: 'fit-content',
    width: '600px',
    maxWidth: '90vw',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingBottom: '1rem',
    paddingTop: 0,
  },
  dialogAction: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  btn: {
    minWidth: 'auto',
  },
  searchBoxWrapper: {
    marginBottom: tokens.spacingVerticalMNudge,
  },
  searchBox: {
    width: '200px',
  },
  popoverSurface: {
    maxHeight: '500px',
    overflowY: 'auto',
  },
  toolbar: {
    gap: '3px',
  },
});

enum ViewType {
  HOME,
  HELICORDER_CHANNEL,
  HELICORDER_FILTER,
  SEISMOGRAM_CHANNELS,
  SELECTION_WINDOW,
}

const extractFilterOperationOptions = (appliedFilter: FilterOperationOptions | null): FilterOptions | null => {
  if (!appliedFilter) {
    return null;
  }
  const taper = appliedFilter.taperType;
  const taper_width = appliedFilter.taperWidth;
  const id = appliedFilter.id;
  if (appliedFilter.filterType === 'bandpass') {
    const { freqmin, freqmax, zerophase, order } = appliedFilter.filterOptions as BandpassFilterOptions;
    return {
      type: 'bandpass',
      id,
      freqmin,
      freqmax,
      zerophase,
      order,
      taper,
      taper_width,
    };
  } else if (appliedFilter.filterType === 'lowpass') {
    const { freq, zerophase, order } = appliedFilter.filterOptions as LowpassFilterOptions;
    return {
      type: 'lowpass',
      id,
      freq,
      zerophase,
      order,
      taper,
      taper_width,
    };
  } else if (appliedFilter.filterType === 'highpass') {
    const { freq, zerophase, order } = appliedFilter.filterOptions as LowpassFilterOptions;
    return {
      type: 'highpass',
      id,
      freq,
      zerophase,
      order,
      taper,
      taper_width,
    };
  } else {
    throw new Error('Invalid filter type');
  }
};

const PickerSettings: React.FC = () => {
  const styles = useStyles();

  const {
    pickerSettingsOpen,
    channelId,
    windowSize,
    forceCenter,
    helicorderFilter,
    getHelicorderFilterOptions,
    getChannelsConfig,
    setPickerSettingsOpen,
    savePickerConfig,
    resetPickerConfig,
  } = usePickerStore();
  const { channels } = useInventoryStore();

  const toasterId = useId('picker-settings');
  const { dispatchToast } = useToastController(toasterId);
  const showErrorToast = useCallback(
    (error: CustomError) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{error.message}</ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    },
    [dispatchToast]
  );

  const { heliChartRef, seisChartRef } = usePickerContext();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewType>(ViewType.HOME);

  // All the states below are used to store the current settings.
  const [selectedHelicorderChannel, setSelectedHelicorderChannel] = useState<string>(channelId);
  const [selectedSeismogramChannels, setSelectedSeismogramChannels] = useState<ChannelConfig[]>(getChannelsConfig());
  const [selectedSelectionWindow, setSelectedSelectionWindow] = useState<number>(windowSize);
  const [isForceCenter, setIsForceCenter] = useState<boolean>(forceCenter);
  const [currentHelicorderFilter, setCurrentHelicorderFilter] = useState<FilterOperationOptions | null>(helicorderFilter);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setPickerSettingsOpen(open);
    },
    [setPickerSettingsOpen]
  );

  // Reset the state to the current settings.
  const resetState = useCallback(() => {
    setSelectedHelicorderChannel(channelId);
    setSelectedSeismogramChannels(getChannelsConfig());
    setSelectedSelectionWindow(windowSize);
    setIsForceCenter(forceCenter);
    setCurrentHelicorderFilter(helicorderFilter);
  }, [channelId, windowSize, forceCenter, helicorderFilter, getChannelsConfig]);

  const handleCancel = useCallback(() => {
    resetState();
    setPickerSettingsOpen(false);
  }, [resetState, setPickerSettingsOpen]);

  useEffect(() => {
    if (pickerSettingsOpen) {
      resetState();
      setView(ViewType.HOME);
    }
  }, [pickerSettingsOpen, resetState]);

  // Apply the settings to the helicorder and seismogram charts.
  const handleApplySettings = useCallback(
    (config: PickerConfig) => {
      if (!heliChartRef.current || !seisChartRef.current) {
        return;
      }

      const { helicorder_channel, seismogram_channels, force_center, window_size, helicorder_filter } = config.data;

      const availableChannels = useInventoryStore.getState().channels();
      const selectedChannels: ChannelConfig[] = [];
      seismogram_channels.forEach((channel) => {
        const item = availableChannels.find((c) => c.id === channel.channel_id);
        if (item) {
          selectedChannels.push({
            channel: item,
            color: channel.color ?? undefined,
          });
        }
      });
      const forceCenter = force_center || true;
      const windowSize = window_size || 5; // 5 minutes
      const helicorderFilter = helicorder_filter ? extractFilterOptions(helicorder_filter) : null;

      const channelId = helicorder_channel.channel_id;
      heliChartRef.current.setWindowSize(windowSize);
      heliChartRef.current.applyFilter(helicorderFilter);
      heliChartRef.current.setChannel({ id: channelId });
      heliChartRef.current.setForceCenter(forceCenter);

      const seismogramChannels = getChannelsConfig().map((item) => ({
        id: item.channel.id,
        label: item.channel.net_sta_code,
        color: item.color,
      }));
      seisChartRef.current.setChannels(seismogramChannels);
      seisChartRef.current.setForceCenter(forceCenter);
    },
    [heliChartRef, seisChartRef, getChannelsConfig]
  );

  // Reset the settings to the default.
  const handleReset = useCallback(async () => {
    setLoading(true);
    try {
      const config = await resetPickerConfig();
      handleApplySettings(config);
      setPickerSettingsOpen(false);
    } catch (e) {
      showErrorToast(e as CustomError);
    } finally {
      setLoading(false);
    }
  }, [resetPickerConfig, showErrorToast, setPickerSettingsOpen, setLoading, handleApplySettings]);

  // Save the settings to the server and apply them to the charts.
  const handleSave = useCallback(async () => {
    setLoading(true);
    const payload: PickerConfigPayload = {
      helicorder_channel: {
        channel_id: selectedHelicorderChannel,
      },
      seismogram_channels: selectedSeismogramChannels.map((channel) => ({
        channel_id: channel.channel.id,
        color: channel.color === 'none' ? undefined : channel.color,
      })),
      window_size: selectedSelectionWindow,
      force_center: isForceCenter,
      helicorder_filter: extractFilterOperationOptions(currentHelicorderFilter),
    };
    try {
      const config = await savePickerConfig(payload);
      handleApplySettings(config);
      setPickerSettingsOpen(false);
    } catch (e) {
      showErrorToast(e as CustomError);
    } finally {
      setLoading(false);
    }
  }, [
    selectedHelicorderChannel,
    selectedSeismogramChannels,
    selectedSelectionWindow,
    isForceCenter,
    currentHelicorderFilter,
    setPickerSettingsOpen,
    savePickerConfig,
    showErrorToast,
    handleApplySettings,
  ]);

  const handleHelicorderChannelChange = useCallback((channel: Channel) => {
    setSelectedHelicorderChannel(channel.id);
    setView(ViewType.HOME);
  }, []);

  const handleSeismogramChannelMoveUp = useCallback(
    (index: number) => {
      const newChannelList = [...selectedSeismogramChannels];
      const temp = newChannelList[index];
      newChannelList[index] = newChannelList[index - 1];
      newChannelList[index - 1] = temp;
      setSelectedSeismogramChannels(newChannelList);
    },
    [selectedSeismogramChannels]
  );

  const handleSeismogramChannelMoveDown = useCallback(
    (index: number) => {
      const newChannelList = [...selectedSeismogramChannels];
      const temp = newChannelList[index];
      newChannelList[index] = newChannelList[index + 1];
      newChannelList[index + 1] = temp;
      setSelectedSeismogramChannels(newChannelList);
    },
    [selectedSeismogramChannels]
  );

  const handleSeismogramChannelAdd = useCallback(
    (channel: Channel) => {
      setSelectedSeismogramChannels((prev) => {
        return [...prev, { channel }];
      });
    },
    [setSelectedSeismogramChannels]
  );

  const handleSeismogramChannelDelete = useCallback(
    (index: number) => {
      const newChannelList = [...selectedSeismogramChannels];
      newChannelList.splice(index, 1);
      setSelectedSeismogramChannels(newChannelList);
    },
    [selectedSeismogramChannels]
  );

  const handleSeismogramChannelColorChange = useCallback(
    (index: number, color?: string) => {
      const newChannelList = [...selectedSeismogramChannels];
      newChannelList[index].color = color;
      setSelectedSeismogramChannels(newChannelList);
    },
    [selectedSeismogramChannels]
  );

  const handleSelectionWindowChange = useCallback((value: string) => {
    setSelectedSelectionWindow(parseInt(value, 10));
  }, []);

  const handleForceCenterChange = useCallback((value: boolean) => {
    setIsForceCenter(value);
  }, []);

  const handleHelicorderFilterChange = useCallback(
    (filter: FilterOperationOptions | null) => {
      setCurrentHelicorderFilter(filter);
    },
    [setCurrentHelicorderFilter]
  );

  const Component = useMemo(() => {
    if (view === ViewType.HELICORDER_CHANNEL) {
      return <HelicorderDefaultChannel channelId={selectedHelicorderChannel} onChange={handleHelicorderChannelChange} />;
    } else if (view === ViewType.SEISMOGRAM_CHANNELS) {
      return (
        <SeismogramChannelList
          channelList={selectedSeismogramChannels}
          onMoveUp={handleSeismogramChannelMoveUp}
          onMoveDown={handleSeismogramChannelMoveDown}
          onAdd={handleSeismogramChannelAdd}
          onDelete={handleSeismogramChannelDelete}
          onColorChange={handleSeismogramChannelColorChange}
        />
      );
    } else if (view === ViewType.SELECTION_WINDOW) {
      return <SelectionWindow value={selectedSelectionWindow.toString()} onChange={handleSelectionWindowChange} />;
    } else if (view === ViewType.HELICORDER_FILTER) {
      return <HelicorderFilter appliedFilter={helicorderFilter} filterOptions={getHelicorderFilterOptions()} onChange={handleHelicorderFilterChange} />;
    } else {
      return (
        <div className="flex flex-col gap-1 mt-2">
          <h1 className="text-xl font-bold">Picker Settings</h1>
          <a
            className="h-[40px] flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-md p-2 cursor-pointer"
            onClick={() => setView(ViewType.HELICORDER_CHANNEL)}
          >
            <div>Helicorder Channel</div>
            <div className="flex items-center">
              <div className="font-normal">{channels().find((channel) => channel.id === selectedHelicorderChannel)?.stream_id}</div>
              <ChevronRightRegular fontSize={20} />
            </div>
          </a>
          <a
            className="h-[40px] flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-md p-2 cursor-pointer"
            onClick={() => setView(ViewType.HELICORDER_FILTER)}
          >
            <div>Helicorder Filter</div>
            <div className="flex items-center">
              <div className="font-normal">{formatFilterText(helicorderFilter, { defaultText: 'None' })}</div>
              <ChevronRightRegular fontSize={20} />
            </div>
          </a>
          <a
            className="h-[40px] flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-md p-2 cursor-pointer"
            onClick={() => setView(ViewType.SEISMOGRAM_CHANNELS)}
          >
            <div>Seismogram Channels</div>
            <div className="flex items-center">
              <div className="font-normal">{selectedSeismogramChannels.length} channels</div>
              <ChevronRightRegular fontSize={20} />
            </div>
          </a>
          <a
            className="h-[40px] flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-md p-2 cursor-pointer"
            onClick={() => setView(ViewType.SELECTION_WINDOW)}
          >
            <div>Selection Window</div>
            <div className="flex items-center">
              <div className="font-normal">{formatNumber(selectedSelectionWindow, { unit: ' minutes' })}</div>
              <ChevronRightRegular fontSize={20} />
            </div>
          </a>
          <a
            className="h-[40px] flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-md p-2 cursor-pointer"
            onClick={() => handleForceCenterChange(!isForceCenter)}
          >
            <div>Force Center</div>
            <div className="flex">
              <Switch checked={isForceCenter} onChange={(e) => handleForceCenterChange(e.target.checked)} />
            </div>
          </a>
        </div>
      );
    }
  }, [
    selectedHelicorderChannel,
    selectedSeismogramChannels,
    isForceCenter,
    helicorderFilter,
    selectedSelectionWindow,
    view,
    channels,
    getHelicorderFilterOptions,
    handleForceCenterChange,
    handleHelicorderChannelChange,
    handleHelicorderFilterChange,
    handleSeismogramChannelAdd,
    handleSeismogramChannelColorChange,
    handleSeismogramChannelDelete,
    handleSeismogramChannelMoveDown,
    handleSeismogramChannelMoveUp,
    handleSelectionWindowChange,
  ]);

  return (
    <Dialog surfaceMotion={null} open={pickerSettingsOpen} onOpenChange={(_, data) => handleOpenChange(data.open)}>
      <DialogSurface className={styles.dialogSurface}>
        {loading && <ProgressBar shape="square" />}
        {view !== ViewType.HOME && (
          <div className="mt-2">
            <Button appearance="transparent" icon={<ArrowLeftRegular />} onClick={() => setView(ViewType.HOME)}>
              Back
            </Button>
          </div>
        )}
        <div>
          {Component}
          <div className="flex items-center justify-between gap-1 mt-2">
            <div>
              <Button appearance="secondary" onClick={handleReset}>
                Reset Default
              </Button>
            </div>
            <div className="flex gap-1">
              <Button appearance="secondary" onClick={handleCancel} className={styles.btn}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleSave} disabled={loading}>
                Save
              </Button>
            </div>
          </div>
        </div>
        <Toaster toasterId={toasterId} />
      </DialogSurface>
    </Dialog>
  );
};

export default PickerSettings;
