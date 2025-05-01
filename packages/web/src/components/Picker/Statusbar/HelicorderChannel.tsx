import {
  Button,
  makeStyles,
  Popover,
  PopoverProps,
  PopoverSurface,
  PopoverTrigger,
  Toast,
  Toaster,
  ToastTitle,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { extractFilterOperationOptions } from '../../../shared/filter';
import { useInventoryStore } from '../../../stores/inventory';
import { usePickerStore } from '../../../stores/picker';
import { Channel } from '../../../types/channel';
import { PickerConfig, PickerConfigPayload } from '../../../types/picker';
import { CustomError } from '../../../types/response';
import { usePickerContext } from '../PickerContext';
import HelicorderDefaultChannel from '../PickerSettings/HelicorderDefaultChannel';

const useStyles = makeStyles({
  popoverSurface: {
    padding: '8px',
    borderRadius: '16px',
    width: '250px',
  },
});

const HelicorderChannel: React.FC = () => {
  const { channelId, windowSize, forceCenter, helicorderFilter, getChannelsConfig, savePickerConfig } = usePickerStore();
  const { channels } = useInventoryStore();
  const streamId = useMemo(() => channels().find((channel) => channel.id === channelId)?.stream_id, [channels, channelId]);
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => setOpen(data.open || false);

  const toasterId = useId('helicorder-channel');
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

  const { heliChartRef } = usePickerContext();

  const handleApplySettings = useCallback(
    (config: PickerConfig) => {
      if (!heliChartRef.current) {
        return;
      }

      const { helicorder_channel } = config.data;
      heliChartRef.current.setChannel({ id: helicorder_channel.channel_id });
    },
    [heliChartRef]
  );

  const handleSave = useCallback(
    async (channel: Channel) => {
      const payload: PickerConfigPayload = {
        helicorder_channel: {
          channel_id: channel.id,
        },
        seismogram_channels: getChannelsConfig().map((channel) => ({
          channel_id: channel.channel.id,
          color: channel.color === 'none' ? undefined : channel.color,
        })),
        window_size: windowSize,
        force_center: forceCenter,
        helicorder_filter: extractFilterOperationOptions(helicorderFilter),
      };

      try {
        const config = await savePickerConfig(payload);
        handleApplySettings(config);
        setOpen(false);
      } catch (e) {
        showErrorToast(e as CustomError);
      }
    },
    [savePickerConfig, showErrorToast, handleApplySettings, windowSize, forceCenter, helicorderFilter, getChannelsConfig]
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger disableButtonEnhancement>
        <Tooltip content={`Current helicorder channel: ${streamId}`} relationship="description" showDelay={1500}>
          <button className="flex items-center gap-1 hover:bg-neutral-grey-90 dark:hover:bg-neutral-grey-16 px-1 h-[20px]">
            <span className="text-xs dark:text-neutral-grey-84">{channels().find((channel) => channel.id === channelId)?.stream_id}</span>
          </button>
        </Tooltip>
      </PopoverTrigger>
      <PopoverSurface tabIndex={-1} className={styles.popoverSurface}>
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold">Helicorder Channel</h1>
            <Button appearance="transparent" icon={<DismissRegular fontSize={20} />} onClick={() => setOpen(false)} />
          </div>
          <HelicorderDefaultChannel channelId={channelId} onChange={handleSave} showInstructions={false} />
          <Toaster toasterId={toasterId} />
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default HelicorderChannel;
