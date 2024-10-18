import {
  Select,
  Switch,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarProps,
  ToolbarToggleButton,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowAutofitWidthDotted20Regular,
  ArrowMaximizeVerticalRegular,
  AutoFitHeight20Regular,
  BezierCurveSquareRegular,
  ChevronDownUp20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronUpDown20Regular,
  PulseRegular,
  ZoomFit20Regular,
  ZoomIn20Regular,
  ZoomOut20Regular,
} from '@fluentui/react-icons';
import { isEqual } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { formatFilterText } from '../../../shared/formatting';
import { useAppStore } from '../../../stores/app';
import { FilterOperationOptions } from '../../../types/filter';
import { ScalingType } from '../../../types/scaling';

export interface SeismogramToolbarProps {
  showEvent?: boolean;
  checkedValues?: Record<string, string[]>;
  showHideEvent?: boolean;
  appliedFilter?: FilterOperationOptions | null;
  filterOptions?: FilterOperationOptions[];
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFirstMinute?: () => void;
  onZoomFit?: () => void;
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
  onScalingChange?: (scaling: ScalingType) => void;
  onFilterChange?: (filter: FilterOperationOptions | null) => void;
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
  switch: {
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
});

const SeismogramToolbar: React.FC<SeismogramToolbarProps> = (props) => {
  const {
    showEvent = true,
    checkedValues = {},
    showHideEvent = true,
    appliedFilter,
    filterOptions = [],
    onZoomIn,
    onZoomOut,
    onZoomFirstMinute,
    onZoomFit,
    onScrollLeft,
    onScrollRight,
    onIncreaseAmplitude,
    onDecreaseAmplitude,
    onResetAmplitude,
    onShowEventChange,
    onCheckedValueChange,
    onSignalChange,
    onSpectrogramChange,
    onScalingChange,
    onFilterChange,
  } = props;

  const styles = useStyles();
  const { darkMode } = useAppStore();
  const appearance = useMemo(() => {
    return darkMode ? 'filled-lighter' : 'filled-darker';
  }, [darkMode]);

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

        if (checkedItems.includes('scaling')) {
          onScalingChange?.('local');
        } else {
          onScalingChange?.('global');
        }
      }

      onCheckedValueChange?.(name, checkedItems);
    },
    [onCheckedValueChange, onSpectrogramChange, onSignalChange, onScalingChange]
  );

  return (
    <div className="bg-white dark:bg-black border-b dark:border-b-gray-800 relative flex items-center h-[40px]">
      <div className="absolute top-0 bottom-[-30px] right-0 left-0 overflow-x-scroll">
        <Toolbar
          aria-label="Seismogram Toolbar"
          checkedValues={checkedValues}
          onCheckedValueChange={handleToolbarCheckedValueChange}
          className={styles.toolbar}
        >
          <Tooltip content="Zoom In" relationship="label" showDelay={1500}>
            <ToolbarButton aria-label="Zoom In" icon={<ZoomIn20Regular />} onClick={onZoomIn} />
          </Tooltip>
          <Tooltip content="Zoom Out" relationship="label" showDelay={1500}>
            <ToolbarButton aria-label="Zoom Out" icon={<ZoomOut20Regular />} onClick={onZoomOut} />
          </Tooltip>
          <Tooltip content="Zoom First Minute" relationship="label" showDelay={1500}>
            <ToolbarButton aria-label="Zoom First Minute" icon={<ArrowAutofitWidthDotted20Regular />} onClick={onZoomFirstMinute} />
          </Tooltip>
          <Tooltip content="Fit to Window" relationship="label" showDelay={1500}>
            <ToolbarButton aria-label="Fit to Window" icon={<ZoomFit20Regular />} onClick={onZoomFit} />
          </Tooltip>
          <ToolbarDivider />

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
          <Tooltip content="Toggle Global or Local Scaling" relationship="label" showDelay={1500}>
            <ToolbarToggleButton
              aria-label="Toggle Global or Local Scaling"
              icon={<ArrowMaximizeVerticalRegular className={styles.icon} />}
              name="options"
              value="scaling"
              appearance="subtle"
            />
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

          <Select
            appearance={appearance}
            defaultValue={filterOptions.findIndex((item) => isEqual(item, appliedFilter))}
            onChange={(_, data) => {
              const index = parseInt(data.value as string);
              onFilterChange?.(index === -1 ? null : filterOptions[index]);
            }}
          >
            <option value={-1}>Filter: none</option>
            {filterOptions.map((option, index) => (
              <option key={index} value={index}>
                {formatFilterText(option)}
              </option>
            ))}
          </Select>

          {showHideEvent && (
            <>
              <ToolbarDivider />
              <Switch className={styles.switch} checked={showEvent} label={showEvent ? 'Hide Event' : 'Show Event'} onChange={handleShowEventChange} />
            </>
          )}
        </Toolbar>
      </div>
    </div>
  );
};

export default SeismogramToolbar;
