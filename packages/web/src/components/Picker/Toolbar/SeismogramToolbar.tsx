import { Switch, Toolbar, ToolbarButton, ToolbarDivider, ToolbarProps, ToolbarToggleButton, Tooltip, makeStyles, tokens } from '@fluentui/react-components';
import {
  AutoFitHeight20Regular,
  BezierCurveSquareRegular,
  ChevronDownUp20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronUpDown20Regular,
  PulseRegular,
  ZoomIn20Regular,
  ZoomOut20Regular,
} from '@fluentui/react-icons';
import React, { useCallback } from 'react';

export interface SeismogramToolbarProps {
  showEvent?: boolean;
  checkedValues?: Record<string, string[]>;
  showHideEvent?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onScrollLeft?: () => void;
  onScrollRight?: () => void;
  onScrollToDate?: (date: number) => void;
  onIncreaseAmplitude?: () => void;
  onDecreaseAmplitude?: () => void;
  onResetAmplitude?: () => void;
  onShowEventChange?: (showEvent: boolean) => void;
  onCheckedValueChange?: (name: string, values: string[]) => void;
  onSignalChange?: (active: boolean) => void;
  onSpectrogramChange?: (active: boolean) => void;
}

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
  },
  iconZoom: {
    color: tokens.colorNeutralForeground1,
    '&:hover': {
      color: tokens.colorNeutralForeground2BrandHover,
    },
  },
  icon: {
    fill: tokens.colorNeutralForeground1,
    '&:hover': {
      fill: tokens.colorNeutralForeground2BrandHover,
      color: tokens.colorNeutralForeground2BrandHover,
    },
    color: tokens.colorNeutralForeground1,
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
    height: '40px',
  },
});

const SeismogramToolbar: React.FC<SeismogramToolbarProps> = (props) => {
  const {
    showEvent = true,
    checkedValues = {},
    showHideEvent = true,
    onZoomIn,
    onZoomOut,
    onScrollLeft,
    onScrollRight,
    onIncreaseAmplitude,
    onDecreaseAmplitude,
    onResetAmplitude,
    onShowEventChange,
    onCheckedValueChange,
    onSignalChange,
    onSpectrogramChange,
  } = props;

  const styles = useStyles();

  const handleShowEventChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onShowEventChange?.(event.currentTarget.checked);
    },
    [onShowEventChange]
  );

  const handleToolbarCheckedValueChange = useCallback<NonNullable<ToolbarProps['onCheckedValueChange']>>(
    (_e, { name, checkedItems }) => {
      if (name === 'options') {
        if (checkedItems.includes('spectrogram')) {
          onSpectrogramChange?.(true);
        } else {
          onSpectrogramChange?.(false);
        }

        if (checkedItems.includes('signal')) {
          onSignalChange?.(true);
        } else {
          onSignalChange?.(false);
        }
      }

      onCheckedValueChange?.(name, checkedItems);
    },
    [onCheckedValueChange, onSpectrogramChange, onSignalChange]
  );

  return (
    <div className="bg-white dark:bg-black border-b dark:border-transparent flex justify-between items-center">
      <Toolbar aria-label="Seismogram Toolbar" checkedValues={checkedValues} onCheckedValueChange={handleToolbarCheckedValueChange} className={styles.toolbar}>
        <Tooltip content="Zoom In" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Zoom In" icon={<ZoomIn20Regular />} onClick={onZoomIn} />
        </Tooltip>
        <Tooltip content="Zoom Out" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Zoom Out" icon={<ZoomOut20Regular />} onClick={onZoomOut} />
        </Tooltip>

        <Tooltip content="Scroll Left" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Scroll Left" icon={<ChevronLeft20Regular />} onClick={onScrollLeft} />
        </Tooltip>
        <Tooltip content="Scroll Right" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Scroll Right" icon={<ChevronRight20Regular />} onClick={onScrollRight} />
        </Tooltip>
        <Tooltip content="Increase Amplitude" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Increase Amplitude" icon={<ChevronUpDown20Regular />} onClick={onIncreaseAmplitude} />
        </Tooltip>
        <Tooltip content="Decrease Amplitude" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Decrease Amplitude" icon={<ChevronDownUp20Regular />} onClick={onDecreaseAmplitude} />
        </Tooltip>
        <Tooltip content="Reset Amplitude" relationship="label" showDelay={1500}>
          <ToolbarButton aria-label="Reset Amplitude" icon={<AutoFitHeight20Regular />} onClick={onResetAmplitude} />
        </Tooltip>
        <ToolbarDivider />

        <Tooltip content="Toggle Signal" relationship="label" showDelay={1500}>
          <ToolbarToggleButton aria-label="Toggle Signal" icon={<PulseRegular className={styles.icon} />} name="options" value="signal" appearance="subtle" />
        </Tooltip>
        <Tooltip content="Toggle Spectrogram" relationship="label" showDelay={1500}>
          <ToolbarToggleButton
            aria-label="Toggle Spectrogram"
            icon={<BezierCurveSquareRegular className={styles.icon} />}
            name="options"
            value="spectrogram"
            appearance="subtle"
          />
        </Tooltip>

        {showHideEvent && (
          <>
            <ToolbarDivider />
            <Switch checked={showEvent} label={showEvent ? 'Hide Event' : 'Show Event'} onChange={handleShowEventChange} />
          </>
        )}
      </Toolbar>
    </div>
  );
};

export default SeismogramToolbar;
