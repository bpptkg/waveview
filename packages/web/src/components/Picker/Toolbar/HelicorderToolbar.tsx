import { Calendar } from '@fluentui/react-calendar-compat';
import {
  Popover,
  PopoverSurface,
  PopoverTrigger,
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
  ArrowCounterclockwiseRegular,
  ArrowMaximizeVerticalRegular,
  AutoFitHeight20Regular,
  Calendar20Regular,
  ChevronDoubleDown20Regular,
  ChevronDown20Regular,
  ChevronDownUp20Regular,
  ChevronUp20Regular,
  ChevronUpDown20Regular,
} from '@fluentui/react-icons';
import React, { useCallback } from 'react';
import { ScalingType } from '../../../types/scaling';

export interface HelicorderToolbarProps {
  offsetDate?: Date;
  checkedValues?: Record<string, string[]>;
  onShiftViewDown?: () => void;
  onShiftViewUp?: () => void;
  onShiftViewToNow?: () => void;
  onOffsetDateChange?: (date: Date) => void;
  onIncreaseAmplitude?: () => void;
  onDecreaseAmplitude?: () => void;
  onResetAmplitude?: () => void;
  onRefreshData?: () => void;
  onScalingChange?: (scaling: ScalingType) => void;
  onCheckedValueChange?: (name: string, values: string[]) => void;
}

const useStyles = makeStyles({
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
    height: '40px',
  },
  icon: {
    fill: tokens.colorNeutralForeground1,
    '&:hover': {
      fill: tokens.colorNeutralForeground2BrandHover,
      color: tokens.colorNeutralForeground2BrandHover,
    },
    color: tokens.colorNeutralForeground1,
  },
  calendarPopover: {
    borderRadius: '16px',
  },
});

const HelicorderToolbar: React.FC<HelicorderToolbarProps> = (props) => {
  const {
    offsetDate,
    checkedValues = {},
    onShiftViewDown,
    onShiftViewUp,
    onShiftViewToNow,
    onIncreaseAmplitude,
    onDecreaseAmplitude,
    onResetAmplitude,
    onOffsetDateChange,
    onRefreshData,
    onScalingChange,
    onCheckedValueChange,
  } = props;

  const styles = useStyles();

  const handleSelectDate = useCallback(
    (date: Date) => {
      onOffsetDateChange?.(date);
      setOffsetDatePickerOpen(false);
    },
    [onOffsetDateChange]
  );

  const [offsetDatePickerOpen, setOffsetDatePickerOpen] = React.useState<boolean>(false);

  const handleToolbarCheckedValueChange = useCallback<NonNullable<ToolbarProps['onCheckedValueChange']>>(
    (_e, { name, checkedItems }) => {
      if (name === 'options') {
        if (checkedItems.includes('scaling')) {
          onScalingChange?.('local');
        } else {
          onScalingChange?.('global');
        }
      }

      onCheckedValueChange?.(name, checkedItems);
    },
    [onCheckedValueChange, onScalingChange]
  );

  return (
    <div className="bg-white dark:bg-neutral-grey-4 border-b border-r dark:border-b-gray-800 dark:border-r-gray-800 flex justify-between items-center relative h-[40px]">
      <div className="absolute top-0 bottom-[-30px] right-0 left-0 overflow-x-scroll">
        <Toolbar
          aria-label="Helicorder Toolbar"
          checkedValues={checkedValues}
          onCheckedValueChange={handleToolbarCheckedValueChange}
          className={styles.toolbar}
        >
          <Popover trapFocus open={offsetDatePickerOpen} onOpenChange={() => setOffsetDatePickerOpen(!offsetDatePickerOpen)}>
            <PopoverTrigger disableButtonEnhancement>
              <Tooltip content="Change Offset Date" relationship="label" showDelay={1500}>
                <ToolbarButton aria-label="Change Offset Date" icon={<Calendar20Regular />} />
              </Tooltip>
            </PopoverTrigger>
            <PopoverSurface className={styles.calendarPopover}>
              <Calendar value={offsetDate} onSelectDate={handleSelectDate} />
            </PopoverSurface>
          </Popover>

          <Tooltip content="Refresh Data" relationship="label" showDelay={1500}>
            <ToolbarButton aria-label="Refresh Data" icon={<ArrowCounterclockwiseRegular />} onClick={onRefreshData} />
          </Tooltip>

          <ToolbarDivider />

          <Tooltip content="Shift View Up" relationship="label" showDelay={1500}>
            <ToolbarButton aria-label="Shift View Up" icon={<ChevronUp20Regular />} onClick={onShiftViewUp} />
          </Tooltip>
          <Tooltip content="Shift View Down" relationship="label" showDelay={1500}>
            <ToolbarButton aria-label="Shift View Down" icon={<ChevronDown20Regular />} onClick={onShiftViewDown} />
          </Tooltip>
          <Tooltip content="Shift View to Now" relationship="label" showDelay={1500}>
            <ToolbarButton aria-label="Shift View to Now" icon={<ChevronDoubleDown20Regular />} onClick={onShiftViewToNow} />
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
        </Toolbar>
      </div>
    </div>
  );
};

export default HelicorderToolbar;
