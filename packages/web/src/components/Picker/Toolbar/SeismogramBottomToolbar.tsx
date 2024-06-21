import { Toolbar, ToolbarButton, ToolbarDivider, makeStyles } from '@fluentui/react-components';
import { Calendar20Regular } from '@fluentui/react-icons';
import { usePickerStore } from '../../../stores/picker';
import RealtimeClock from '../RealtimeClock';

const timeRangeOptions = [
  { value: 5, label: '5m' },
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 120, label: '3h' },
  { value: 240, label: '6h' },
  { value: 480, label: '12h' },
  { value: 1440, label: '1d' },
];

const useStyles = makeStyles({
  btn: {
    minWidth: 'auto',
    padding: '5px 8px',
  },
});

const SeismogramBottomToolbar = () => {
  const styles = useStyles();

  const { useUTC, timeZone } = usePickerStore();

  return (
    <div className="ml-[80px] flex items-center justify-between">
      <Toolbar aria-label="Seismogram Bottom Toolbar" size="small">
        {timeRangeOptions.map((option) => (
          <ToolbarButton key={option.value} aria-label={`Select Time Range ${option.label}`} className={styles.btn}>
            <span className="font-normal text-sm">{option.label}</span>
          </ToolbarButton>
        ))}
        <ToolbarDivider />
        <ToolbarButton aria-label="Select Channel ID" icon={<Calendar20Regular />} />
      </Toolbar>

      <div className="flex items-center gap-2 mr-2">
        <RealtimeClock useUTC={useUTC} />
        <span className="text-sm">{useUTC ? 'UTC' : timeZone}</span>
      </div>
    </div>
  );
};

export default SeismogramBottomToolbar;
