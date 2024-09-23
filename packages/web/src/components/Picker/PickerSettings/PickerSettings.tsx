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
import { formatNumber } from '../../../shared/formatting';
import { useInventoryStore } from '../../../stores/inventory';
import { usePickerStore } from '../../../stores/picker';
import { ChannelConfig } from '../../../stores/picker/slices';
import { Channel } from '../../../types/channel';
import { PickerConfigPayload } from '../../../types/picker';
import { CustomError } from '../../../types/response';
import { usePickerContext } from '../PickerContext';
import HelicorderDefaultChannel from './HelicorderDefaultChannel';
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

type View = 'default' | 'helcorderDefaultChannel' | 'seismogramChannelList' | 'selectionWindow';

const PickerSettings: React.FC = () => {
  const {
    pickerSettingsOpen,
    channelId: defaultChannelId,
    windowSize,
    forceCenter,
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

  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>('default');

  const [channelId, setChannelId] = useState<string>(defaultChannelId);
  const [channelList, setChannelList] = useState<ChannelConfig[]>(getChannelsConfig());
  const [selectionWindow, setSelectionWindow] = useState<number>(windowSize);
  const [detrend, setDetrend] = useState<boolean>(forceCenter);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setPickerSettingsOpen(open);
    },
    [setPickerSettingsOpen]
  );

  const resetState = useCallback(() => {
    setChannelId(defaultChannelId);
    setChannelList(getChannelsConfig());
    setSelectionWindow(windowSize);
    setDetrend(forceCenter);
  }, [defaultChannelId, windowSize, forceCenter, getChannelsConfig]);

  const handleCancel = useCallback(() => {
    resetState();
    setPickerSettingsOpen(false);
  }, [resetState, setPickerSettingsOpen]);

  useEffect(() => {
    if (pickerSettingsOpen) {
      resetState();
      setView('default');
    }
  }, [pickerSettingsOpen, resetState]);

  const handleApplySettings = useCallback(() => {
    const channels = getChannelsConfig().map((item) => ({
      id: item.channel.id,
      label: item.channel.network_station_code,
      color: item.color,
    }));
    seisChartRef.current?.setChannels(channels);
    const item = getChannelsConfig().find((item) => item.channel.id === channelId)!;
    heliChartRef.current?.setWindowSize(selectionWindow);
    const currentChannel = heliChartRef.current?.getChannel();
    if (currentChannel?.id !== item.channel.id) {
      heliChartRef.current?.setChannel({ id: item.channel.id, label: item.channel.stream_id });
    }
    heliChartRef.current?.setForceCenter(detrend);
    seisChartRef.current?.setForceCenter(detrend);
  }, [channelId, selectionWindow, detrend, heliChartRef, seisChartRef, getChannelsConfig]);

  const handleReset = useCallback(async () => {
    setLoading(true);
    try {
      await resetPickerConfig();
      handleApplySettings();
      setPickerSettingsOpen(false);
    } catch (e) {
      showErrorToast(e as CustomError);
    } finally {
      setLoading(false);
    }
  }, [resetPickerConfig, showErrorToast, handleApplySettings, setPickerSettingsOpen, setLoading]);

  const handleSave = useCallback(async () => {
    setLoading(true);
    const payload: PickerConfigPayload = {
      helicorder_channel: {
        channel_id: channelId,
      },
      seismogram_channels: channelList.map((channel) => ({
        channel_id: channel.channel.id,
        color: channel.color === 'none' ? undefined : channel.color,
      })),
      window_size: selectionWindow,
      force_center: detrend,
    };
    try {
      await savePickerConfig(payload);
      handleApplySettings();
      setPickerSettingsOpen(false);
    } catch (e) {
      showErrorToast(e as CustomError);
    } finally {
      setLoading(false);
    }
  }, [channelId, channelList, selectionWindow, detrend, setPickerSettingsOpen, savePickerConfig, showErrorToast, handleApplySettings]);

  const handleHelicorderChannelChange = useCallback((channel: Channel) => {
    setChannelId(channel.id);
    setView('default');
  }, []);

  const handleSeismogramChannelMoveUp = useCallback(
    (index: number) => {
      const newChannelList = [...channelList];
      const temp = newChannelList[index];
      newChannelList[index] = newChannelList[index - 1];
      newChannelList[index - 1] = temp;
      setChannelList(newChannelList);
    },
    [channelList]
  );

  const handleSeismogramChannelMoveDown = useCallback(
    (index: number) => {
      const newChannelList = [...channelList];
      const temp = newChannelList[index];
      newChannelList[index] = newChannelList[index + 1];
      newChannelList[index + 1] = temp;
      setChannelList(newChannelList);
    },
    [channelList]
  );

  const handleSeismogramChannelAdd = useCallback(
    (channel: Channel) => {
      setChannelList((prev) => {
        return [...prev, { channel }];
      });
    },
    [setChannelList]
  );

  const handleSeismogramChannelDelete = useCallback(
    (index: number) => {
      const newChannelList = [...channelList];
      newChannelList.splice(index, 1);
      setChannelList(newChannelList);
    },
    [channelList]
  );

  const handleSeismogramChannelColorChange = useCallback(
    (index: number, color?: string) => {
      const newChannelList = [...channelList];
      newChannelList[index].color = color;
      setChannelList(newChannelList);
    },
    [channelList]
  );

  const handleSelectionWindowChange = useCallback((value: string) => {
    setSelectionWindow(parseInt(value, 10));
  }, []);

  const handleForceCenterChange = useCallback((value: boolean) => {
    setDetrend(value);
  }, []);

  const Component = useMemo(() => {
    if (view === 'helcorderDefaultChannel') {
      return <HelicorderDefaultChannel channelId={channelId} onChange={handleHelicorderChannelChange} />;
    } else if (view === 'seismogramChannelList') {
      return (
        <SeismogramChannelList
          channelList={channelList}
          onMoveUp={handleSeismogramChannelMoveUp}
          onMoveDown={handleSeismogramChannelMoveDown}
          onAdd={handleSeismogramChannelAdd}
          onDelete={handleSeismogramChannelDelete}
          onColorChange={handleSeismogramChannelColorChange}
        />
      );
    } else if (view === 'selectionWindow') {
      return <SelectionWindow value={selectionWindow.toString()} onChange={handleSelectionWindowChange} />;
    } else {
      return (
        <div className="flex flex-col gap-1 mt-2">
          <h1 className="text-xl font-bold">Picker Settings</h1>
          <a
            className="h-[40px] flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-md p-2 cursor-pointer"
            onClick={() => setView('helcorderDefaultChannel')}
          >
            <div>Helicorder Channel</div>
            <div className="flex items-center">
              <div className="font-normal">{channels().find((channel) => channel.id === channelId)?.stream_id}</div>
              <ChevronRightRegular fontSize={20} />
            </div>
          </a>
          <a
            className="h-[40px] flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-md p-2 cursor-pointer"
            onClick={() => setView('seismogramChannelList')}
          >
            <div>Seismogram Channels</div>
            <div className="flex items-center">
              <div className="font-normal">{channelList.length} channels</div>
              <ChevronRightRegular fontSize={20} />
            </div>
          </a>
          <a
            className="h-[40px] flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-md p-2 cursor-pointer"
            onClick={() => setView('selectionWindow')}
          >
            <div>Selection Window</div>
            <div className="flex items-center">
              <div className="font-normal">{formatNumber(selectionWindow, { unit: ' minutes' })}</div>
              <ChevronRightRegular fontSize={20} />
            </div>
          </a>
          <a
            className="h-[40px] flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-md p-2 cursor-pointer"
            onClick={() => handleForceCenterChange(!detrend)}
          >
            <div>Force Center</div>
            <div className="flex">
              <Switch checked={detrend} onChange={(e) => handleForceCenterChange(e.target.checked)} />
            </div>
          </a>
        </div>
      );
    }
  }, [
    view,
    channelId,
    channelList,
    selectionWindow,
    detrend,
    channels,
    handleHelicorderChannelChange,
    handleSeismogramChannelAdd,
    handleSeismogramChannelDelete,
    handleSeismogramChannelMoveDown,
    handleSeismogramChannelMoveUp,
    handleSeismogramChannelColorChange,
    handleSelectionWindowChange,
    handleForceCenterChange,
  ]);

  return (
    <Dialog open={pickerSettingsOpen} onOpenChange={(_, data) => handleOpenChange(data.open)}>
      <DialogSurface className={styles.dialogSurface}>
        {loading && <ProgressBar shape="square" />}
        {view !== 'default' && (
          <div className="mt-2">
            <Button appearance="transparent" icon={<ArrowLeftRegular />} onClick={() => setView('default')}>
              Back
            </Button>
          </div>
        )}
        <div>
          {Component}
          <div className="flex items-center justify-between gap-1 mt-2">
            <div>
              <Button appearance="secondary" onClick={handleCancel} className={styles.btn}>
                Cancel
              </Button>
            </div>
            <div className="flex gap-1">
              <Button appearance="secondary" onClick={handleReset}>
                Reset Default
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
