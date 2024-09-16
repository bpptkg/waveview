import {
  FluentProvider,
  MenuDivider,
  MenuItem,
  MenuList,
  Toast,
  ToastTitle,
  Toaster,
  makeStyles,
  tokens,
  useId,
  useToastController,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { ArrowDownRegular, ArrowMaximizeRegular, ArrowMinimizeRegular, ArrowUpRegular, DeleteRegular, EditRegular } from '@fluentui/react-icons';
import { ElementEvent, Seismogram } from '@waveview/zcharts';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ONE_SECOND } from '../../shared/time';
import { useAppStore } from '../../stores/app';
import { usePickerStore } from '../../stores/picker';
import { useSidebarStore } from '../../stores/sidebar';
import { SeismicEvent } from '../../types/event';
import { CustomError } from '../../types/response';
import { usePickerContext } from './PickerContext';
import { SeismogramChartRef } from './SeismogramChart';
import { usePickerCallback } from './usePickerCallback';

export interface ContextMenuData {
  chartRef: SeismogramChartRef;
}

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    visibility: 'hidden',
    left: 0,
    top: 0,
    width: '250px',
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
  open: (e: ElementEvent) => void;
  close: () => void;
}

const SeismogramContextMenu: React.ForwardRefExoticComponent<React.RefAttributes<ContextMenuRef>> = React.forwardRef((_, ref) => {
  const styles = useStyles();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [channelIndex, setChannelIndex] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SeismicEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [point, setPoint] = useState({ x: 0, y: 0 });

  const { seisChartRef } = usePickerContext();
  const { darkMode } = useAppStore();

  const { eventMarkers, pickMode, eventId } = usePickerStore();

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
    if (pickMode) {
      seisChartRef.current?.disablePickMode();
    }

    const chart = seisChartRef.current?.getInstance() as Seismogram;
    const xAxis = chart.getXAxis();
    const time = xAxis.getValueForPixel(x);

    const marker = eventMarkers.find((e) => {
      const eventTime = new Date(e.time).getTime();
      return time >= eventTime && time <= eventTime + e.duration * ONE_SECOND;
    });
    if (marker && !eventId) {
      setSelectedEvent(marker);
    } else {
      setSelectedEvent(null);
    }
  }, [seisChartRef, eventMarkers, point, pickMode, eventId]);

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
    (e: ElementEvent) => {
      if (!menuRef.current) {
        return;
      }

      const chart = seisChartRef.current?.getInstance() as Seismogram;
      if (!chart) {
        return;
      }

      const width = 250;
      const height = menuRef.current.clientHeight;
      const x = e.offsetX;
      const y = e.offsetY;
      setPoint({ x, y });

      const rect = chart.getGrid().getRect();
      if (!rect.contain(x, y)) {
        return;
      }

      const trackManager = chart.getTrackManager();
      const index = trackManager.getTrackIndexByY(y);
      setChannelIndex(index);

      const ev = e.event as unknown as PointerEvent;
      let px = ev.x;
      let py = ev.y;
      if (px > window.innerWidth - width) {
        px -= width;
      }

      if (py > window.innerHeight - height) {
        py -= height;
      }

      setLeft(px);
      setTop(py);
      setVisible(true);
    },
    [menuRef, seisChartRef]
  );

  const handleClose = useCallback(async () => {
    if (menuRef.current) {
      menuRef.current.style.visibility = 'hidden';
    }
    if (pickMode) {
      seisChartRef.current?.enablePickMode();
    }
    setVisible(false);
  }, [seisChartRef, pickMode]);

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

  const { handleSeismogramRemoveChannel, handleSeismogramMoveChannelUp, handleSeismogramMoveChannelDown } = usePickerCallback();

  const handleRemoveChannel = useCallback(() => {
    if (channelIndex !== null) {
      handleSeismogramRemoveChannel(channelIndex);
    }
    handleClose();
  }, [channelIndex, handleClose, handleSeismogramRemoveChannel]);

  const handleMoveChannelUp = useCallback(() => {
    if (channelIndex !== null) {
      handleSeismogramMoveChannelUp(channelIndex);
    }
    handleClose();
  }, [channelIndex, handleClose, handleSeismogramMoveChannelUp]);

  const handleMoveChannelDown = useCallback(() => {
    if (channelIndex !== null) {
      handleSeismogramMoveChannelDown(channelIndex);
    }
    handleClose();
  }, [channelIndex, handleClose, handleSeismogramMoveChannelDown]);

  const { selectedChannels, isExpandMode, fetchEditedEvent, setExpandMode } = usePickerStore();
  const channel = useMemo(() => selectedChannels[channelIndex ?? 0], [selectedChannels, channelIndex]);
  const { handleSetupEventEditing } = usePickerCallback();
  const sidebar = useSidebarStore();

  const handleEditEvent = useCallback(() => {
    if (!selectedEvent) {
      return;
    }
    fetchEditedEvent(selectedEvent.id)
      .then((event) => {
        handleSetupEventEditing(event);
        sidebar.setSelectedTab('eventEditor');
        sidebar.setVisible(true);
      })
      .catch((error) => {
        showErrorToast(error);
      })
      .finally(() => {
        handleClose();
      });
  }, [selectedEvent, sidebar, fetchEditedEvent, showErrorToast, handleClose, handleSetupEventEditing]);

  const handleExpandView = useCallback(() => {
    if (channelIndex !== null) {
      seisChartRef.current?.expandView(channelIndex);
      setExpandMode(true);
      handleClose();
    }
  }, [channelIndex, seisChartRef, setExpandMode, handleClose]);

  const handleRestoreView = useCallback(() => {
    seisChartRef.current?.restoreView();
    setExpandMode(false);
    handleClose();
  }, [seisChartRef, setExpandMode, handleClose]);

  return createPortal(
    <FluentProvider theme={darkMode ? webDarkTheme : webLightTheme}>
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
                Edit Event: {selectedEvent.type.code}
              </MenuItem>
              <MenuDivider />
            </>
          )}
          {isExpandMode ? (
            <MenuItem onClick={handleRestoreView} icon={<ArrowMinimizeRegular />} aria-label="Restore View">
              Restore View
            </MenuItem>
          ) : (
            <>
              <MenuItem onClick={handleMoveChannelUp} icon={<ArrowUpRegular />} aria-label="Move Channel Up">
                Move {channel?.network_station_code} Up
              </MenuItem>
              <MenuItem onClick={handleMoveChannelDown} icon={<ArrowDownRegular />} aria-label="Move Channel Down">
                Move {channel?.network_station_code} Down
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleRemoveChannel} icon={<DeleteRegular />} aria-label="Remove Selected Channel">
                Remove {channel?.network_station_code}
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleExpandView} icon={<ArrowMaximizeRegular />} aria-label="Expand View">
                Expand View
              </MenuItem>
            </>
          )}
        </MenuList>
        <Toaster toasterId={toasterId} />
      </div>
    </FluentProvider>,
    document.getElementById('root') as HTMLElement
  );
});

export default SeismogramContextMenu;
