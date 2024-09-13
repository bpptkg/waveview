import { MenuDivider, MenuItem, MenuList, Toast, ToastTitle, Toaster, makeStyles, tokens, useId, useToastController } from '@fluentui/react-components';
import { ArrowDown20Regular, ArrowUp20Regular, Delete20Regular, EditRegular } from '@fluentui/react-icons';
import { Seismogram } from '@waveview/zcharts';
import { FederatedPointerEvent } from 'pixi.js';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ONE_SECOND, formatTimezonedDate } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import { SeismicEvent } from '../../types/event';
import { CustomError } from '../../types/response';
import { usePickerContext } from './PickerContext';
import { SeismogramChartRef } from './SeismogramChart';
import { usePickerCallback } from './usePickerCallback';

export interface ContextMenuProps {
  onRemoveChannel?: (index: number) => void;
  onMoveChannelUp?: (index: number) => void;
  onMoveChannelDown?: (index: number) => void;
}

export interface ContextMenuData {
  chartRef: SeismogramChartRef;
}

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    visibility: 'hidden',
    left: 0,
    top: 0,
    width: '300px',
    maxHeight: '500px',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '4px',
    borderRadius: '4px',
    boxShadow: `${tokens.shadow16}`,
    zIndex: 100,
  },
});

export interface ContextMenuRef {
  open: (e: FederatedPointerEvent) => void;
  close: () => void;
}

const SeismogramContextMenu: React.ForwardRefExoticComponent<ContextMenuProps & React.RefAttributes<ContextMenuRef>> = React.forwardRef((props, ref) => {
  const styles = useStyles();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [channelIndex, setChannelIndex] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SeismicEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [point, setPoint] = useState({ x: 0, y: 0 });

  const { seisChartRef } = usePickerContext();
  const { useUTC } = useAppStore();

  const { eventMarkers, editedEvent, } = usePickerStore();

  const toasterId = useId('seismogram-contextmneu');
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

  const setupContext = useCallback(() => {
    const { x } = point;
    // if (isPickModeActive()) {
    //   seisChartRef.current?.disablePickMode();
    // }

    const chart = seisChartRef.current?.getInstance() as Seismogram;
    const xAxis = chart.getXAxis();
    const time = xAxis.getValueForPixel(x);

    const marker = eventMarkers.find((e) => {
      const eventTime = new Date(e.time).getTime();
      return time >= eventTime && time <= eventTime + e.duration * ONE_SECOND;
    });
    if (marker && !editedEvent) {
      setSelectedEvent(marker);
    } else {
      setSelectedEvent(null);
    }
  }, [seisChartRef, eventMarkers, point, editedEvent,]);

  useEffect(() => {
    if (!menuRef.current) {
      return;
    }

    if (visible) {
      menuRef.current.style.visibility = 'visible';
      setupContext();
    }
  }, [visible, setupContext]);

  const handleOpen = useCallback(
    (e: FederatedPointerEvent) => {
      if (menuRef.current) {
        const chart = seisChartRef.current?.getInstance() as Seismogram;
        if (!chart) {
          return;
        }

        const width = 200;
        const height = menuRef.current.clientHeight;
        let { x, y } = e.global;
        setPoint({ x, y });

        const rect = chart.getGrid().getRect();
        if (x > rect.x + rect.width || y < rect.y || y > rect.y + rect.height) {
          return;
        }

        // const index = chart.getChannelIndexAtPosition(y);
        // setChannelIndex(index);

        if (e.pageX > window.innerWidth - width) {
          x -= width;
        }

        if (e.pageY > window.innerHeight - height) {
          y -= height;
        }

        setLeft(x);
        setTop(y);
        setVisible(true);
      }
    },
    [menuRef, seisChartRef]
  );

  const handleClose = useCallback(async () => {
    if (menuRef.current) {
      menuRef.current.style.visibility = 'hidden';
    }
    // if (isPickModeActive()) {
    //   seisChartRef.current?.enablePickMode();
    // }
    setVisible(false);
  }, [seisChartRef]);

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }));

  useEffect(() => {
    const hide = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', hide);

    return () => {
      document.removeEventListener('mousedown', hide);
    };
  }, [handleClose, menuRef]);

  const { onRemoveChannel, onMoveChannelUp, onMoveChannelDown } = props;

  const handleRemoveChannel = useCallback(() => {
    if (channelIndex !== null) {
      onRemoveChannel?.(channelIndex);
    }
    handleClose();
  }, [channelIndex, handleClose, onRemoveChannel]);

  const handleMoveChannelUp = useCallback(() => {
    if (channelIndex !== null) {
      onMoveChannelUp?.(channelIndex);
    }
    handleClose();
  }, [channelIndex, handleClose, onMoveChannelUp]);

  const handleMoveChannelDown = useCallback(() => {
    if (channelIndex !== null) {
      onMoveChannelDown?.(channelIndex);
    }
    handleClose();
  }, [channelIndex, handleClose, onMoveChannelDown]);

  const { selectedChannels, fetchEditedEvent } = usePickerStore();
  const channel = useMemo(() => selectedChannels[channelIndex ?? 0], [selectedChannels, channelIndex]);
  const { handleSetupEventEditing } = usePickerCallback();

  const handleEditEvent = useCallback(() => {
    if (!selectedEvent) {
      return;
    }
    fetchEditedEvent(selectedEvent.id)
      .then((event) => {
        handleSetupEventEditing(event);
      })
      .catch((error) => {
        showErrorToast(error);
      })
      .finally(() => {
        handleClose();
      });
  }, [selectedEvent, fetchEditedEvent, showErrorToast, handleClose, handleSetupEventEditing]);

  return (
    <div
      className={styles.root}
      ref={menuRef}
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
    >
      <MenuList hasIcons>
        {selectedEvent && (
          <>
            <MenuItem onClick={handleEditEvent} icon={<EditRegular fontSize={20} />}>
              Edit {formatTimezonedDate(selectedEvent.time, 'yyyy-MM-dd HH:mm:ss', useUTC)} ({selectedEvent.type.code})
            </MenuItem>
            <MenuDivider />
          </>
        )}
        <MenuItem onClick={handleMoveChannelUp} icon={<ArrowUp20Regular />} aria-label="Move Channel Up">
          Move {channel?.network_station_code} Up
        </MenuItem>
        <MenuItem onClick={handleMoveChannelDown} icon={<ArrowDown20Regular />} aria-label="Move Channel Down">
          Move {channel?.network_station_code} Down
        </MenuItem>
        <MenuDivider />
        <MenuItem onClick={handleRemoveChannel} icon={<Delete20Regular />} aria-label="Remove Selected Channel">
          Remove {channel?.network_station_code}
        </MenuItem>
      </MenuList>
      <Toaster toasterId={toasterId} />
    </div>
  );
});

export default SeismogramContextMenu;
