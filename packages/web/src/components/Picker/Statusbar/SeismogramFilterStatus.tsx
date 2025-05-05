import { Tooltip } from '@fluentui/react-components';
import { formatFilterText } from '../../../shared/formatting';
import { useFilterStore } from '../../../stores/filter';

const SeismogramFilterStatus = () => {
  const { appliedFilter } = useFilterStore();
  if (!appliedFilter) {
    return null;
  }
  return (
    <Tooltip
      content={<span className="text-nowrap">{`Seismogram Filter: ${formatFilterText(appliedFilter)}`}</span>}
      relationship="description"
      showDelay={1500}
    >
      <span className="text-xs dark:text-neutral-grey-84 px-1">S: {formatFilterText(appliedFilter)}</span>
    </Tooltip>
  );
};

export default SeismogramFilterStatus;
