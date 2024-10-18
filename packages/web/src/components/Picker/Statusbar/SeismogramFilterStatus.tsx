import { Tooltip } from '@fluentui/react-components';
import { formatFilterText } from '../../../shared/formatting';
import { useFilterStore } from '../../../stores/filter';

const SeismogramFilterStatus = () => {
  const { appliedFilter } = useFilterStore();
  if (!appliedFilter) {
    return null;
  }
  return (
    <Tooltip content={`Current seismogram filter: ${formatFilterText(appliedFilter)}`} relationship="description" showDelay={1500}>
      <div className="flex items-center gap-1">
        <span className="text-xs dark:text-neutral-grey-84">S: {formatFilterText(appliedFilter)}</span>
      </div>
    </Tooltip>
  );
};

export default SeismogramFilterStatus;
