import { MenuDivider, MenuItem, MenuList, makeStyles, tokens } from '@fluentui/react-components';
import { ArrowDown20Regular, ArrowUp20Regular, Delete20Regular } from '@fluentui/react-icons';
import { Seismogram } from '@waveview/charts';
import { FederatedPointerEvent } from 'pixi.js';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { usePickerStore } from '../../stores/picker';

export interface ContextMenuProps {
  onRemoveChannel?: (index: number) => void;
  onMoveChannelUp?: (index: number) => void;
  onMoveChannelDown?: (index: number) => void;
}

export interface ContextMenuData {
  chart: Seismogram;
}

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    visibility: 'hidden',
    left: 0,
    top: 0,
    width: '200px',
    maxHeight: '500px',
    overflowY: 'auto',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '4px',
    borderRadius: '4px',
    boxShadow: `${tokens.shadow16}`,
  },
});

export interface ContextMenuRef {
  open: (e: FederatedPointerEvent, data: ContextMenuData) => void;
  close: () => void;
}

const SeismogramContextMenu: React.ForwardRefExoticComponent<ContextMenuProps & React.RefAttributes<ContextMenuRef>> = React.forwardRef((props, ref) => {
  const styles = useStyles();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [channelIndex, setChannelIndex] = React.useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    open: (e, data) => {
      if (menuRef.current) {
        const width = 200;
        const height = menuRef.current.clientHeight;
        let { x, y } = e.global;

        const { chart } = data;

        const rect = chart.getGrid().getRect();
        if (x > rect.x + rect.width || y < rect.y || y > rect.y + rect.height) {
          return;
        }

        const index = chart.getChannelIndexAtPosition(y);
        setChannelIndex(index);

        if (e.pageX > window.innerWidth - width) {
          x -= width;
        }

        if (e.pageY > window.innerHeight - height) {
          y -= height;
        }

        menuRef.current.style.left = `${x}px`;
        menuRef.current.style.top = `${y}px`;
        menuRef.current.style.visibility = 'visible';
      }
    },
    close: () => {
      if (menuRef.current) {
        menuRef.current.style.visibility = 'hidden';
      }
    },
  }));

  const handleClose = useCallback(() => {
    if (menuRef.current) {
      menuRef.current.style.visibility = 'hidden';
    }
  }, []);

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

  const { selectedChannels } = usePickerStore();
  const channel = useMemo(() => selectedChannels[channelIndex ?? 0], [selectedChannels, channelIndex]);

  return (
    <div className={styles.root} ref={menuRef}>
      <span className="px-2 py-4 font-semibold">{channel && channel.stream_id}</span>
      <MenuList hasIcons>
        <MenuItem onClick={handleMoveChannelUp} icon={<ArrowUp20Regular />} aria-label="Move Channel Up">
          Move Channel Up
        </MenuItem>
        <MenuItem onClick={handleMoveChannelDown} icon={<ArrowDown20Regular />} aria-label="Move Channel Down">
          Move Channel Down
        </MenuItem>
        <MenuDivider />
        <MenuItem onClick={handleRemoveChannel} icon={<Delete20Regular />} aria-label="Remove Selected Channel">
          Remove Channel
        </MenuItem>
      </MenuList>
    </div>
  );
});

export default SeismogramContextMenu;
