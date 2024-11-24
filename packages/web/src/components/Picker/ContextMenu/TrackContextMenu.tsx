import { FluentProvider, MenuItem, MenuList, makeStyles, tokens } from '@fluentui/react-components';
import { ArrowMaximizeRegular, ArrowMinimizeRegular } from '@fluentui/react-icons';
import { ElementEvent } from '@waveview/zcharts';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../../../stores/app';
import { usePickerStore } from '../../../stores/picker';
import { themes } from '../../../theme';
import { usePickerContext } from '../PickerContext';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    visibility: 'hidden',
    left: 0,
    top: 0,
    width: '200px',
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

export interface TrackContextMenuRef {
  open: (e: ElementEvent, index: number) => void;
  close: () => void;
}

const TrackContextMenu: React.ForwardRefExoticComponent<React.RefAttributes<TrackContextMenuRef>> = React.forwardRef((_, ref) => {
  const styles = useStyles();
  const { darkMode } = useAppStore();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [channelIndex, setChannelIndex] = useState<number | null>(null);

  const handleOpen = useCallback((e: ElementEvent, index: number) => {
    if (!menuRef.current) {
      return;
    }
    const ev = e.event as unknown as PointerEvent;
    let px = ev.x;
    let py = ev.y;
    const width = 200;
    const height = menuRef.current.clientHeight;
    if (px > window.innerWidth - width) {
      px -= width;
    }

    if (py > window.innerHeight - height) {
      py -= height;
    }

    setLeft(px);
    setTop(py);
    setVisible(true);
    setChannelIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    if (menuRef.current) {
      menuRef.current.style.visibility = 'hidden';
    }
    setVisible(false);
  }, []);

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }));

  useEffect(() => {
    if (!menuRef.current) {
      return;
    }
    if (visible) {
      menuRef.current.style.visibility = 'visible';
    }
  }, [visible]);

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
  }, [handleClose]);

  const { isExpandMode, setExpandMode, getChannelsConfig } = usePickerStore();
  const { seisChartRef } = usePickerContext();

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

  const channelName = useMemo(() => {
    if (channelIndex === null) {
      return '';
    }
    const item = getChannelsConfig()[channelIndex];
    return item.channel.net_sta_code;
  }, [channelIndex, getChannelsConfig]);

  return createPortal(
    <FluentProvider theme={darkMode ? themes.defaultDark : themes.defaultLight}>
      <div
        className={styles.root}
        ref={menuRef}
        style={{
          left: `${left}px`,
          top: `${top}px`,
        }}
      >
        <MenuList hasIcons>
          {isExpandMode ? (
            <MenuItem onClick={handleRestoreView} icon={<ArrowMinimizeRegular />} aria-label="Restore View">
              Restore View
            </MenuItem>
          ) : (
            <MenuItem onClick={handleExpandView} icon={<ArrowMaximizeRegular />} aria-label="Expand View">
              Expand {channelName}
            </MenuItem>
          )}
        </MenuList>
      </div>
    </FluentProvider>,
    document.getElementById('root') as HTMLElement
  );
});

export default TrackContextMenu;
