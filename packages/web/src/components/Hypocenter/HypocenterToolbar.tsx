import { makeStyles, Select, Toolbar, ToolbarButton } from '@fluentui/react-components';
import { ArrowCounterclockwiseRegular, ArrowDownloadRegular, FilterRegular } from '@fluentui/react-icons';
import DateRangePicker from '../DatePicker/DateRangePicker';
import EditableDropdown from './EditableDropdown';

export interface HypocenterToolbarProps {}

const useStyles = makeStyles({
    button: {
      minWidth: 'auto',
    },
  });

const HypocenterToolbar: React.FC<HypocenterToolbarProps> = () => {
    const styles = useStyles();
  return (
    <div className="bg-white dark:bg-black mx-2 drop-shadow rounded flex justify-between items-center">
      <Toolbar aria-label="Hypocenter Toolbar">
        <div className="flex gap-1">
          <DateRangePicker />
          <Select appearance="outline">
            <option value={'automatic'}>Automatic</option>
            <option value={'manual'}>Manual</option>
          </Select>
        </div>
        <ToolbarButton icon={<ArrowCounterclockwiseRegular fontSize={20} />} />
        <ToolbarButton icon={<ArrowDownloadRegular fontSize={20} />} />
        <ToolbarButton icon={<FilterRegular fontSize={20} />} className={styles.button}>Filter</ToolbarButton>
        <EditableDropdown />
        <EditableDropdown />
      </Toolbar>
    </div>
  );
};

export default HypocenterToolbar;
